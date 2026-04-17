import { Scene } from 'phaser';

import { globalState } from '../global-state';
import { FarmBackground, FarmContext, GameResult, TiledCacheEntry, TiledLayer } from '../types/types';
import { announce, createAnimations, ModalManager, showFloatingMessageUI, SidePanelUI } from '../utils';
import { findChestsInRange } from '../utils/chest-utils';
import { animateInventory, createChestCounterDom, createTooltipText, showChestMessage, updateChestCounter } from '../utils/dom-ui';
import { handleFarmPlot, handleHarvest, handleWaterPlant } from '../utils/farm-utils';
import { ASSETS } from '../utils/game-assets';
import { knockbackNpc, NpcSprite, NpcType, scheduleWander, updateNpcs } from '../utils/npc-utils';
import {
  buildBridgeSet,
  buildWalkableSet,
  createFarmBackground,
} from '../utils/tiled-background';

import css from '../styles/kitty-farm.module.css';

const TILE_SIZE = 16;
const ZOOM = 3;
const PLAYER_DEPTH = 13;
const CHEST_DEPTH = 12;
const PLAYER_SPEED = 50;
const CHEST = ['side', 'front'] as const;
const NPC_TYPES = ['chicken', 'cow'] as const;
const NPC_COUNT = 10;
const MAP_KEY = 'bgMap-farm';

const PLAYER_SPAWN_X = 9 * TILE_SIZE + TILE_SIZE / 2;
const PLAYER_SPAWN_Y = 11 * TILE_SIZE + TILE_SIZE / 2;

export class Game extends Scene {
  private bgMap!: FarmBackground;

  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private chestColliders: Phaser.Physics.Arcade.Collider[] = [];

  private lastDir = 'down';

  private npcs: NpcSprite[] = [];
  private walkableSet = new Set<string>();
  private isActing = false;

  private interactKey!: Phaser.Input.Keyboard.Key;
  private openPanelKey!: Phaser.Input.Keyboard.Key;
  private farmPlantKey!: Phaser.Input.Keyboard.Key;

  private chests: Phaser.Physics.Arcade.Sprite[] = [];
  private chestCounterEl!: HTMLSpanElement;
  private openedCount = 0;

  private npcWalkableSet = new Set<string>();   // wander — sin bridge
  private npcSpawnSet = new Set<string>();       // spawn — más restrictivo

  private selectedPlotHighlight!: Phaser.GameObjects.Rectangle;

  // Footsteps sound
  private footstepTimer = 0;
  private readonly FOOTSTEP_INTERVAL = 400;

  // Modal
  private curtainDom!: Phaser.GameObjects.DOMElement;
  private modal!: ModalManager;

  isPaused = false;

  // Side panel
  private sidePanel!: SidePanelUI;

  // Seed counter
  private totalSeedsFromChests = 0;
  private harvested = { corn: 0, tomato: 0 };

  // Tooltip
  private chestTooltip!: Phaser.GameObjects.Text;
  private plotTooltip!: Phaser.GameObjects.Text;

  constructor() { super('Game'); }

  // =========================================================
  // CREATE
  // =========================================================
  create(): void {
    this.clearGameState();

    this.bgMap = createFarmBackground(this);
    createAnimations(this);

    if ("context" in this.sound) {
      const manager = this.sound as Phaser.Sound.WebAudioSoundManager;
      manager.context.resume();
    }

    const audioManager = this.registry.get("audioManager");

    if (!audioManager.isMusicPlaying()) {
      audioManager.playMusic(ASSETS.menu_music.key);
    }

    this.walkableSet = buildWalkableSet(this);

    const bridgeSet = buildBridgeSet(this);

    // NPCs caminan en grass pero NO en bridge
    this.npcWalkableSet = new Set(
      [...this.walkableSet].filter(k => !bridgeSet.has(k))
    );

    // Excluir tiles adyacentes a cofres
    this.chests.forEach(chest => {
      const tx = Math.floor(chest.x / TILE_SIZE);
      const ty = Math.floor(chest.y / TILE_SIZE);
      const radius = 2; // tiles de exclusión alrededor del cofre

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          this.npcWalkableSet.delete(`${tx + dx}_${ty + dy}`);
        }
      }
    });

    // NPCs solo spawnean lejos del bridge (filtro de radio)
    this.npcSpawnSet = new Set(
      [...this.npcWalkableSet].filter(k => {
        const [tx, ty] = k.split('_').map(Number);
        for (let dx = -3; dx <= 3; dx++) {
          for (let dy = -3; dy <= 3; dy++) {
            if (bridgeSet.has(`${tx + dx}_${ty + dy}`)) return false;
          }
        }
        return true;
      })
    );

    const grassNearBridge = this.getGrassAdjacentToBridge();

    this.createNPCs(grassNearBridge);
    this.createPlayer();

    this.createChests(grassNearBridge);

    this.setupCamera();
    this.setupCollisions();
    this.setupFarmPlotInteraction();

    this.createModalOverlayDom();

    this.sidePanel = new SidePanelUI(this);
    this.sidePanel.init();

    this.createChestCounter();

    this.selectedPlotHighlight = this.add
      .rectangle(0, 0, TILE_SIZE, TILE_SIZE)
      .setFillStyle(0xffff00, 0.25)
      .setDepth(999)
      .setVisible(false);

    this.chestTooltip = createTooltipText(this, '[SPACE] Abrir', ZOOM);
    this.plotTooltip = createTooltipText(this, '', ZOOM);

    // 🌱 Mensaje flotante cuando se agrega una semilla
    this.events.on("seed-added", (message: string) => {
      showFloatingMessageUI(this, message, ZOOM);
    });

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.interactKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.openPanelKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    this.farmPlantKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.R
    );

    // semillas
    this.input.keyboard!.on('keydown-ONE', () => {
      this.sidePanel.selectSeed('corn');
      if (audioManager) audioManager.playSFX(ASSETS.click_sound.key, 0.3);
      announce('Seleccionaste semilla de maíz.');
    });

    this.input.keyboard!.on('keydown-TWO', () => {
      this.sidePanel.selectSeed('tomato');
      if (audioManager) audioManager.playSFX(ASSETS.click_sound.key, 0.3);
      announce('Seleccionaste semilla de tomate.');
    });

  }

  private clearGameState(): void {
    this.input.enabled = true;
    this.input.keyboard!.enabled = true;
    this.isPaused = false;

    this.harvested = { corn: 0, tomato: 0 };
    this.totalSeedsFromChests = 0;
    this.openedCount = 0;
    this.chests = [];
    this.npcs = [];
    this.chestColliders = [];
    this.walkableSet = new Set();
    this.npcWalkableSet = new Set();
    this.npcSpawnSet = new Set();
    this.lastDir = 'down';
    this.isActing = false;
    this.footstepTimer = 0;
  }

  // =========================================================
  // WALKABLE
  // =========================================================
  private isWalkableAt(worldX: number, worldY: number): boolean {
    const { map } = this.bgMap;
    const tx = map.worldToTileX(worldX);
    const ty = map.worldToTileY(worldY);
    if (tx === null || ty === null) return false;
    return this.walkableSet.has(`${tx}_${ty}`);
  }

  private snapToTileCenter(worldX: number, worldY: number): { x: number; y: number } {
    const { map } = this.bgMap;
    const tx = map.worldToTileX(worldX) ?? 0;
    const ty = map.worldToTileY(worldY) ?? 0;
    return {
      x: tx * TILE_SIZE + TILE_SIZE / 2,
      y: ty * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  private isNpcWalkableAt(worldX: number, worldY: number): boolean {
    const { map } = this.bgMap;
    const tx = map.worldToTileX(worldX);
    const ty = map.worldToTileY(worldY);
    if (tx === null || ty === null) return false;
    return this.npcWalkableSet.has(`${tx}_${ty}`);
  }

  // Grass walkable adyacente a bridge — spawn de NPCs
  private getGrassAdjacentToBridge(): { x: number; y: number; key: string }[] {
    const cached = this.cache.tilemap.get(MAP_KEY) as TiledCacheEntry;
    const { layers, width } = cached.data;

    const bridgeTiles = new Set<string>();
    const collectBridge = (tiledLayers: TiledLayer[]): void => {
      for (const layer of tiledLayers) {
        if (layer.type === 'tilelayer' && layer.name === 'bridge' && layer.data) {
          layer.data.forEach((gid, i) => {
            if (gid > 0) bridgeTiles.add(`${i % width}_${Math.floor(i / width)}`);
          });
        }
        if (layer.type === 'group' && layer.layers) collectBridge(layer.layers);
      }
    };
    collectBridge(layers);

    const result: { x: number; y: number; key: string }[] = [];
    const seen = new Set<string>();
    const grassLayer = this.bgMap.layers['grass'];
    if (!grassLayer) return result;

    grassLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (tile.index <= 0) return;
      const k = `${tile.x}_${tile.y}`;
      if (!this.walkableSet.has(k)) return;
      if (seen.has(k)) return;

      const neighbors = [
        `${tile.x + 1}_${tile.y}`, `${tile.x - 1}_${tile.y}`,
        `${tile.x}_${tile.y + 1}`, `${tile.x}_${tile.y - 1}`,
      ];
      if (!neighbors.some(n => bridgeTiles.has(n))) return;

      seen.add(k);
      result.push({ x: tile.pixelX + TILE_SIZE / 2, y: tile.pixelY + TILE_SIZE / 2, key: k });
    });

    return result;
  }

  // =========================================================
  // PLAYER
  // =========================================================
  private createPlayer(): void {
    this.player = this.physics.add
      .sprite(PLAYER_SPAWN_X, PLAYER_SPAWN_Y, 'player')
      .setDepth(PLAYER_DEPTH);

    this.player.setBodySize(14, 14);
    this.player.play('player-idle-down');
  }

  // =========================================================
  // NPCs
  // =========================================================
  private createNPCs(spawnTiles: { x: number; y: number }[]): void {
    const safeSpawnTiles = spawnTiles.filter(tile => {
      const tx = Math.floor(tile.x / TILE_SIZE);
      const ty = Math.floor(tile.y / TILE_SIZE);
      return this.npcSpawnSet.has(`${tx}_${ty}`);
    });

    // fallback si no hay tiles seguros
    const finalSpawnTiles = safeSpawnTiles.length > 0 ? safeSpawnTiles : spawnTiles;

    for (let i = 0; i < NPC_COUNT; i++) {
      const type = NPC_TYPES[Phaser.Math.Between(0, NPC_TYPES.length - 1)];
      const spawn = finalSpawnTiles[Phaser.Math.Between(0, finalSpawnTiles.length - 1)];

      const npc = this.physics.add
        .sprite(spawn.x, spawn.y, type)
        .setDepth(PLAYER_DEPTH) as NpcSprite;

      if (type === 'chicken') {
        npc.setBodySize(10, 10).setOffset(3, 6);
      } else {
        npc.setBodySize(22, 18).setOffset(5, 12);
      }

      const body = npc.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);  // 🔥 inmovable para física
      body.pushable = false;

      npc.isKnockedBack = false;
      npc.lastSafeX = spawn.x;
      npc.lastSafeY = spawn.y;

      npc.play(`${type}-idle`);
      this.npcs.push(npc);
      scheduleWander(this, npc, type, this.isNpcWalkableAt.bind(this), this.snapToTileCenter.bind(this));
    }
  }

  // =========================================================
  // CHESTS
  // =========================================================
  private createChests(spawnTiles: { x: number; y: number; key: string }[]): void {
    const advices = globalState.advices;
    if (!advices.length) return;

    const shuffled = [...spawnTiles].sort(() => Math.random() - 0.5);
    const usedKeys = new Set<string>();

    advices.forEach((advice, index) => {
      const tile = shuffled[index % shuffled.length];

      if (usedKeys.has(tile.key)) return;
      usedKeys.add(tile.key);

      const type = CHEST[Phaser.Math.Between(0, CHEST.length - 1)];

      const chest = this.physics.add
        .sprite(tile.x, tile.y, ASSETS.chest.spritesheet.key)
        .setDepth(CHEST_DEPTH);

      if (type === 'front') {

        chest.setBodySize(16, 16);
      } else {
        chest.setBodySize(10, 18).setOffset(15, 15);
      }

      this.chests.push(chest);

      chest.setFrame(0);

      (chest.body as Phaser.Physics.Arcade.Body).setImmovable(true);

      chest.setData('advice', advice);
      chest.setData('opened', false);
      chest.setData('type', type);

      chest.play(`chest-idle-${type}`);
    });
  }

  private handleChestInteraction(): void {
    if (!Phaser.Input.Keyboard.JustDown(this.interactKey)) return;

    const { closed, opened } = findChestsInRange(
      this.chests, this.player.x, this.player.y, this.lastDir, 25
    );

    if (closed) { this.openChest(closed); return; }
    if (opened) {
      this.showChestMessage(opened, 'Cofre ya abierto');
      announce('Cofre ya abierto');
    }
  }

  private openChest(chest: Phaser.Physics.Arcade.Sprite): void {
    if (chest.getData('animating')) return;
    if (chest.getData('opened')) return;

    const type = chest.getData('type');

    chest.setData('animating', true);
    chest.setData('opened', true);

    this.updateChestCounter();

    // Sonido al abrir
    const audioManager = this.registry.get('audioManager');
    audioManager.playSFX(ASSETS.chest_open.key);

    announce('Abriendo cofre...');

    chest.play(`chest-open-${type}`);

    this.chestColliders.forEach(collider => {
      if (collider.object2 === chest || collider.object1 === chest) {
        collider.active = false;
      }
    });

    chest.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      chest.setData('animating', false);
      chest.anims.stop();
      this.sidePanel.enableAudioFocus();
      this.sidePanel.disable();
      this.modal.show(chest.getData('advice'));
    });
  }

  // =========================================================
  // CAMERA
  // =========================================================
  private setupCamera(): void {
    const { map } = this.bgMap;
    this.cameras.main
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      .setZoom(ZOOM)
      .startFollow(this.player, true, 0.1, 0.1);
  }

  // =========================================================
  // COLLISIONS
  // =========================================================
  private setupCollisions(): void {
    // NPC vs NPC — sí colisión entre ellos
    this.physics.add.collider(
      this.npcs as unknown as Phaser.GameObjects.GameObject[],
      this.npcs as unknown as Phaser.GameObjects.GameObject[]
    );

    // PLAYER + NPCs vs CHESTS
    this.chests.forEach(chest => {

      // player vs chest
      const playerCollider = this.physics.add.collider(this.player, chest);
      this.chestColliders.push(playerCollider);

      // npc vs chest
      this.npcs.forEach(npc => {
        const npcCollider = this.physics.add.collider(npc, chest);
        this.chestColliders.push(npcCollider);
      });

    });

    // player vs npc — overlap en vez de collider
    this.npcs.forEach(npc => {
      const type = npc.texture.key as NpcType;

      this.physics.add.overlap(this.player, npc, () => {
        if (!this.isNpcWalkableAt(this.player.x, this.player.y)) return;

        const dx = npc.x - this.player.x;
        const dy = npc.y - this.player.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const body = npc.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(false);

        npc.setVelocity((dx / len) * 80, (dy / len) * 80);

        knockbackNpc(this, npc, type, this.isNpcWalkableAt.bind(this), this.snapToTileCenter.bind(this));

        // restaurar immovable después del empuje
        this.time.delayedCall(450, () => {
          if (npc.active) body.setImmovable(true);
        });
      });
    });
  }

  // =========================================================
  // FARM PLOT INTERACTION
  // =========================================================
  private setupFarmPlotInteraction(): void {
    const { farmPlot } = this.bgMap;

    const layerData = farmPlot.layer;
    const maxX = layerData.width - 1;
    const maxY = layerData.height - 1;

    farmPlot.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (tile.index <= 0) return;

      // 🔥 ignorar borde exterior — 1 tile de margen en todos los lados
      if (tile.x === 0 || tile.y === 0 || tile.x === maxX || tile.y === maxY) return;

      const worldX = tile.pixelX + TILE_SIZE / 2;
      const worldY = tile.pixelY + TILE_SIZE / 2;

      const highlight = this.add
        .rectangle(worldX, worldY, TILE_SIZE, TILE_SIZE)
        .setFillStyle(0x00ff00, 0)
        .setDepth(19);

      const zone = this.add
        .zone(worldX, worldY, TILE_SIZE, TILE_SIZE)
        .setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => {
        const seed = this.sidePanel.getSelectedSeed();
        if (!seed) return;

        const key = `${tile.x}_${tile.y}`;
        const planted = this.registry.get(key);

        if (planted) {
          highlight.setFillStyle(0xffffff, 0.3);
        } else {
          highlight.setFillStyle(0x00ff00, 0.3);
        }
      });

      zone.on('pointerout', () => {
        highlight.setFillStyle(0x000000, 0);
      });

      zone.on('pointerdown', () => {
        const key = `${tile.x}_${tile.y}`;
        const plant = this.registry.get(key) as Phaser.GameObjects.Sprite;

        if (plant) {
          const watered = plant.getData('watered');

          if (watered) {
            handleHarvest(this.farmCtx, tile, plant);
            return;
          }

          handleWaterPlant(this.farmCtx, worldX, worldY, plant);
          return;
        }

        handleFarmPlot(this.farmCtx, tile, worldX, worldY)
      });
    });
  }

  private checkWinCondition(): void {

    const total = this.harvested.corn + this.harvested.tomato;

    if (this.totalSeedsFromChests < this.chests.length) return;
    if (total < this.totalSeedsFromChests) return;

    this.isPaused = true;
    this.input.enabled = false;

    announce('¡Felicidades! Has cosechado todas tus plantas. ¡Ganaste!');

    this.time.delayedCall(800, () => {
      this.showVictoryOverlay();
    });
  }

  // =========================================================
  // OVERLAY
  // =========================================================
  private createModalOverlayDom() {
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;

    this.curtainDom = this.add.dom(width / 2, height / 2)
      .setOrigin(0.5)
      .setDepth(20)
      .setScrollFactor(0)
      .setScale(1 / ZOOM)
      .createFromHTML(`
      <div id="modal-overlay" class="${css['modal-overlay']}" style="width:${width}px;height:${height}px;">
        <div id="modal-card" class="${css['modal-card']}">
          <div id="modal-content" class="${css['modal-content']}">
            <div id="modal-header" class="${css['modal-header']}">
              <!-- 🎧 AUDIO -->
              <div id="modal-audio"></div>
              <div id="modal-title" class="${css['modal-title']}"></div>  
            </div>        
            <!-- 📚 CONTENT -->
            <div id="modal-body" class="${css['modal-body']}" tabindex="0">
              <div id="modal-advice" class="${css['modal-advice']}"></div>
              <figure>
                <img id="modal-img" class="${css['modal-img']}" />
                <figcaption class="${css['modal-figcaption']}">
                  <strong id="modal-img-title"></strong>&nbsp;<p id="modal-alt"></p>
                </figcaption>
              </figure>
            </div>

            <!-- ✅ BUTTON -->
            <button id="modal-btn" class="${css['modal-btn']}">
              ✓ Aprendido
            </button>
          </div>
        </div>
      </div>
    `);

    const root = this.curtainDom.node as HTMLDivElement;

    // 🔥 inicializar ModalManager
    this.modal = new ModalManager(this, root);

    this.modal.init((advice) => {
      this.sidePanel.enableAudioFocus();
      this.sidePanel.disable();
      
      const results: GameResult = {   // 🔥 reemplaza, no acumula
        advice: {
          id: advice.id,
          title: advice.title,
          description: advice.description,
        }
      };

      this.emitResult(results);

      // 🔁 lógica al cerrar modal
      this.isPaused = false;
      this.input.enabled = true;

      this.sidePanel.addSeed();
      this.sidePanel.open();

      this.totalSeedsFromChests++; // Aumentar contador de semillas

      const audioManager = this.registry.get('audioManager');
      audioManager.playSFX(ASSETS.collect_item.key);

      announce('Aprendido. Se agregó una semilla a tu colección.');
    });
  }

  private showVictoryOverlay() {
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;

    const dom = this.add.dom(width / 2, height / 2)
      .setOrigin(0.5)
      .setDepth(100)
      .setScrollFactor(0)
      .setScale(1 / ZOOM)
      .createFromHTML(`
      <div class="${css['modal-overlay']}" style="width:${width}px;height:${height}px;">
        <div class="${css['modal-card']}">
          <div class="${css['modal-content']}">

            <h1 class="${css.title}">¡GRAN TRABAJO!</h1>

            <p class="${css.subtitle}" style="text-align:center;">
              Has cuidado tu granja con dedicación y esfuerzo.
              Es momento de ver todo lo que lograste.
            </p>

            <button id="go-results" class="${css['modal-btn']}">
              Ver resultados
            </button>

          </div>
        </div>
      </div>
    `);

    this.input.enabled = false;

    const root = dom.node as HTMLElement;
    const btn = root.querySelector('#go-results') as HTMLButtonElement;

    btn.focus();

    const goToEndGame = () => {
      dom.destroy();
      this.input.enabled = true;

      this.scene.start('EndGame', {
        chestsOpened: this.openedCount,
        totalChests: this.chests.length,
        harvested: this.harvested
      });
    };

    const audioManager = this.registry.get("audioManager");

    btn.onclick = () => {
      audioManager.playSFX(ASSETS.click_sound.key, 0.3);
      goToEndGame();
    };

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        audioManager.playSFX(ASSETS.click_sound.key, 0.3);
        e.preventDefault();
        goToEndGame();
      }
    });

    // 🔊 accesibilidad
    announce('Gran trabajo. Has completado la granja. Presiona Enter para ver tus resultados.');
  }

  private emitResult(payload: GameResult) {
    const cb = this.game.registry.get('onResultCallback') as ((r: GameResult) => void) | undefined;
    cb?.(payload);
  }

  // ===========================================================
  // COUNTER CHESTS
  // ===========================================================
  private createChestCounter(): void {
    this.chestCounterEl = createChestCounterDom(
      this,
      `assets/game-kitty-farmer/${ASSETS.chest.image.path}`,
      this.chests.length
    );
  }

  private updateChestCounter(): void {
    updateChestCounter(this.chestCounterEl, ++this.openedCount, this.chests.length);
  }

  // ===========================================================
  // FLOATING MESSAGES
  // ===========================================================
  private showChestMessage(chest: Phaser.Physics.Arcade.Sprite, message: string): void {
    showChestMessage(this, chest, message, ZOOM, TILE_SIZE);
  }

  private get farmCtx(): FarmContext {
    return {
      scene: this,
      player: this.player,
      sidePanel: this.sidePanel,
      audioManager: this.registry.get('audioManager'),
      zoom: ZOOM,
      tileSize: TILE_SIZE,
      setActing: v => { this.isActing = v; },
      onHarvest: (type) => {
        this.harvested[type]++;
        animateInventory(type);
        this.checkWinCondition();
      },
    };
  }

  // =========================================================
  // UPDATE
  // =========================================================
  update(): void {
    if (this.isPaused) return; // 🔥 CLAVE

    this.handlePlayerMovement();
    this.updateNpcs();

    // Cofres
    this.handleChestInteraction();
    this.highlightClosestChest();
    this.updateChestTooltip();

    // Plantar
    this.handlePanelToggle();
    this.handleFarmInteraction();
    this.updateKeyboardPlotSelection();
    this.updatePlotTooltip();
  }

  private updateNpcs(): void {
    updateNpcs(this.npcs, this.isNpcWalkableAt.bind(this), this.snapToTileCenter.bind(this));
  }

  private handlePlayerMovement(): void {
    if (this.isActing) return;

    const { left, right, up, down } = this.cursors;

    let vx = 0;
    let vy = 0;

    if (left.isDown) vx = -PLAYER_SPEED;
    if (right.isDown) vx = PLAYER_SPEED;
    if (up.isDown) vy = -PLAYER_SPEED;
    if (down.isDown) vy = PLAYER_SPEED;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    const margin = TILE_SIZE * 0.6;

    if (vx !== 0) {
      if (!this.isWalkableAt(this.player.x + Math.sign(vx) * margin, this.player.y)) vx = 0;
    }
    if (vy !== 0) {
      if (!this.isWalkableAt(this.player.x, this.player.y + Math.sign(vy) * margin)) vy = 0;
    }

    this.player.setVelocity(vx, vy);

    const isMoving = vx !== 0 || vy !== 0;

    // ✅ footsteps solo cuando se mueve, con intervalo
    if (isMoving) {
      this.footstepTimer += this.game.loop.delta;
      if (this.footstepTimer >= this.FOOTSTEP_INTERVAL) {
        this.footstepTimer = 0;
        const audioManager = this.registry.get('audioManager');
        audioManager.playSFX(ASSETS.footsteps.key, 0.3);
      }
    } else {
      this.footstepTimer = 0; // reset al detenerse
    }

    if (vy < 0) { this.lastDir = 'up'; this.player.play('player-walk-up', true); }
    else if (vy > 0) { this.lastDir = 'down'; this.player.play('player-walk-down', true); }
    else if (vx < 0) { this.lastDir = 'left'; this.player.play('player-walk-left', true); }
    else if (vx > 0) { this.lastDir = 'right'; this.player.play('player-walk-right', true); }
    else { this.player.play(`player-idle-${this.lastDir}`, true); }

    if (!this.isWalkableAt(this.player.x, this.player.y)) {
      const safe = this.snapToTileCenter(
        this.player.x, this.player.y
      );
      this.player.setPosition(safe.x, safe.y);
      this.player.setVelocity(0, 0);
    }
  }

  // =========================================================
  // CHESTS INTERACTION
  // =========================================================
  private highlightClosestChest(): void {
    this.chests.forEach(c => c.clearTint());

    const { highlighted } = findChestsInRange(
      this.chests, this.player.x, this.player.y, this.lastDir, 25
    );

    if (highlighted) highlighted.setTint(0xffffaa);
  }

  private updateChestTooltip(): void {
    const { closed } = findChestsInRange(
      this.chests, this.player.x, this.player.y, this.lastDir, 25
    );

    if (closed) {
      this.chestTooltip
        .setPosition(closed.x, closed.y - TILE_SIZE * 1.5)
        .setVisible(true);
    } else {
      this.chestTooltip.setVisible(false);
    }
  }

  // =========================================================
  // FARM PLOT SELECTION
  // =========================================================
  private handlePanelToggle(): void {
    if (!Phaser.Input.Keyboard.JustDown(this.openPanelKey)) return;

    const audioManager = this.registry.get('audioManager');
    audioManager.playSFX(ASSETS.click_sound.key, 0.3);

    this.sidePanel.toggle();
  }

  private handleFarmInteraction(): void {
    if (!Phaser.Input.Keyboard.JustDown(this.farmPlantKey)) return;

    const tile = this.getTileInFront();
    if (!tile) return;

    const worldX = tile.pixelX + TILE_SIZE / 2;
    const worldY = tile.pixelY + TILE_SIZE / 2;

    const key = `${tile.x}_${tile.y}`;
    const plant = this.registry.get(key) as Phaser.GameObjects.Sprite;

    // Bloqueado mientras crece
    if (plant && plant.getData('growing')) {
      announce('La planta aún está creciendo');
      showFloatingMessageUI(this, '⏳ Espera que crezca', ZOOM);
      return;
    }

    // 🌾 cosechar
    if (plant && plant.getData('watered')) {
      handleHarvest(this.farmCtx, tile, plant);
      return;
    }

    // 💧 regar
    if (plant) {
      handleWaterPlant(this.farmCtx, worldX, worldY, plant);
      return;
    }

    // 🌱 plantar (solo si hay semilla)
    const seed = this.sidePanel.getSelectedSeed();
    if (!seed) return; // ❌ ya no abre panel aquí

    handleFarmPlot(this.farmCtx, tile, worldX, worldY);
  }

  private getTileInFront(): Phaser.Tilemaps.Tile | null {
    const { farmPlot } = this.bgMap;

    const offset = TILE_SIZE;

    let x = this.player.x;
    let y = this.player.y;

    switch (this.lastDir) {
      case 'up':
        y -= offset;
        break;
      case 'down':
        y += offset;
        break;
      case 'left':
        x -= offset;
        break;
      case 'right':
        x += offset;
        break;
    }

    return farmPlot.getTileAtWorldXY(x, y);
  }

  private updateKeyboardPlotSelection(): void {
    const tile = this.getTileInFront();

    if (!tile) {
      this.selectedPlotHighlight.setVisible(false);
      return;
    }

    const worldX = tile.pixelX + TILE_SIZE / 2;
    const worldY = tile.pixelY + TILE_SIZE / 2;

    const key = `${tile.x}_${tile.y}`;
    const plant = this.registry.get(key);

    const seed = this.sidePanel.getSelectedSeed();

    // 🎯 decidir color
    let color = 0xffff00; // default

    if (plant && plant.getData?.('watered')) {
      color = 0xffcc00; // cosecha
    } else if (plant) {
      color = 0x66ccff; // regar
    } else if (seed) {
      color = 0x00ff00; // plantar
    }

    this.selectedPlotHighlight
      .setPosition(worldX, worldY)
      .setFillStyle(color, 0.25)
      .setVisible(true);
  }

  private updatePlotTooltip(): void {
    const tile = this.getTileInFront();

    if (!tile) {
      this.plotTooltip.setVisible(false);
      return;
    }

    const key = `${tile.x}_${tile.y}`;
    const plant = this.registry.get(key) as Phaser.GameObjects.Sprite;
    const seed = this.sidePanel.getSelectedSeed();

    const worldX = tile.pixelX + TILE_SIZE / 2;
    const worldY = tile.pixelY - TILE_SIZE / 2;

    let label = '';

    if (plant && plant.getData('growing')) {
      label = '⏳ Creciendo...';
    } else if (plant && plant.getData?.('watered')) {
      label = '[R] Cosechar';
    } else if (plant) {
      label = '[R] Regar';
    } else if (seed) {
      label = '[R] Plantar';
    }

    if (label) {
      this.plotTooltip
        .setText(label)
        .setPosition(worldX, worldY)
        .setVisible(true);
    } else {
      this.plotTooltip.setVisible(false);
    }
  }
}