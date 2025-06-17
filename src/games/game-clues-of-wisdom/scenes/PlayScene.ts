import Phaser from 'phaser';

import { BeeEnemy } from '../gameObjects/Bee';
import { PiranhaPlantEnemy } from '../gameObjects/PiranhaPlant';
import { Player } from '../gameObjects/Player';
import { SlugEnemy } from '../gameObjects/Slug';
import { TreasureChest, WORD_FOUND_EVENT } from '../gameObjects/TreasureChest';
import { globalState } from '../utils/globalState';
import { LevelStructure, WordData } from '../utils/types';

// Helper para la región ARIA Live
/* const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
}; */

export class PlayScene extends Phaser.Scene {
  // --- Propiedades del Mapa y Capas ---
  private map!: Phaser.Tilemaps.Tilemap;
  private tileset!: Phaser.Tilemaps.Tileset;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer | null;
  private collisionLayer!: Phaser.Tilemaps.TilemapLayer | null;

  // --- Propiedades del Jugador ---
  private player!: Player;

  // --- Propiedades de los Enemigos ---
  private enemiesGroup!: Phaser.Physics.Arcade.Group;

  // Para el parallax
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgNear!: Phaser.GameObjects.TileSprite;

  private ladderZones: Phaser.Geom.Rectangle[] = [];
  private spikeZones: Phaser.Geom.Rectangle[] = [];

  private carrotsGroup!: Phaser.Physics.Arcade.Group;
  private chestsGroup!: Phaser.Physics.Arcade.Group;

  // --- Lógica del Juego de Palabras ---
  private levelData!: LevelStructure;
  private targetWordsInLevel: WordData[] = [];
  private foundWords: Map<string, WordData> = new Map();
  private keyE!: Phaser.Input.Keyboard.Key;
  constructor() {
    super('Play');
  }

  init(data: { levelId?: string }): void {
    console.log('[PlayScene] Init - Data recibida:', data);

    const allChallenges = this.registry.get('allSentenceChallenges') as LevelStructure[] | undefined;
    let currentChallenge: LevelStructure | undefined;

    if (data.levelId && allChallenges) {
      // Si se pasó un levelId específico, intentar encontrarlo
      currentChallenge = allChallenges.find((challenge) => challenge.id === data.levelId);
      if (currentChallenge) {
        console.log(`[PlayScene] Desafío encontrado por ID '${data.levelId}':`, currentChallenge);
      } else {
        console.warn(
          `[PlayScene] No se encontró desafío con ID '${data.levelId}'. Usando el primer desafío por defecto.`
        );
      }
    }

    // Si no se encontró por ID o no se pasó un ID, usar el desafío actual del registro
    if (!currentChallenge) {
      currentChallenge = this.registry.get('currentChallengeConfig') as LevelStructure | undefined;
      if (currentChallenge) {
        console.log('[PlayScene] Usando currentChallengeConfig del registro:', currentChallenge);
      }
    }
    if (currentChallenge) {
      this.levelData = currentChallenge;
    } else {
      console.error('¡ERROR CRÍTICO! No se pudieron cargar los datos del nivel para PlayScene.');
      // Podrías cargar un nivel por defecto o detener la escena.
      this.levelData = {
        id: 'fallback_level',
        words: [{ text: 'Error', isTarget: true }],
        promptText: 'Error al cargar nivel.',
        feedback: { sentenceCompleteText: 'Oops!' }
      };
    }

    // Limpiar y preparar para el nivel actual
    this.targetWordsInLevel = this.levelData.words.filter((word) => word.isTarget);
    this.foundWords.clear();

    console.log('[PlayScene] Datos de Nivel Finales:', this.levelData);
    console.log('[PlayScene] Palabras Objetivo del Nivel:', this.targetWordsInLevel);
  }
  create(): void {
    this.cameras.main.setBackgroundColor(0x000000);
    this.map = this.make.tilemap({ key: 'map' });
    const tilesetImage = this.map.addTilesetImage('tileset', 'mi_tileset');

    if (!tilesetImage) {
      console.error('Error: No se pudo añadir el tileset. Verifica los nombres.');
      return;
    }
    this.tileset = tilesetImage;

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    this.bgFar = this.add
      .tileSprite(0, 0, gameWidth, gameHeight, 'parallax_bg_far')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-10)
      .setScale(1.5);
    this.bgNear = this.add
      .tileSprite(0, 0, gameWidth, gameHeight, 'parallax_bg_near')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-9)
      .setScale(1.4);

    this.scene.launch('UIScene');

       if (this.input.keyboard) {
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[globalState.openChestKey as keyof typeof Phaser.Input.Keyboard.KeyCodes]);
    }

    this.groundLayer = this.map.createLayer('Main Layer', this.tileset, 0, 0);
    if (this.groundLayer) this.groundLayer.setDepth(-5);

    this.collisionLayer = this.map.createLayer('Collisions Layer', this.tileset, 0, 0);
    if (this.collisionLayer) {
      this.collisionLayer.setCollisionByProperty({ collides: true });
    }

    // --- INICIALIZAR GRUPO DE ZANAHORIAS ANTES DE USARLO
    this.carrotsGroup = this.physics.add.group({
      allowGravity: false
    });

    // --- INICIALIZAR GRUPO DE COFRES ANTES DE USARLO
    this.chestsGroup = this.physics.add.group({ allowGravity: true, immovable: true });

  // Escuchar un evento desde UIScene para volver al menú
        const uiScene = this.scene.get('UIScene');
        if (uiScene) {
            uiScene.events.on('goToMenu', this.handleGoToMenu, this);
        }
    // --- Zonas de escaleras y generación de zanahorias ---
    const objectLayer = this.map.getObjectLayer('Object Layer');
    if (objectLayer) {
      // --- CREACIÓN DE COFRES ---
      const chestSpawnObjects = objectLayer.objects.filter((obj) => {
        const typeProperty = obj.properties?.find((p: { name: string; value: string }) => p.name === 'type');
        return typeProperty?.value === 'chest' && obj.x !== undefined && obj.y !== undefined;
      });

      // Barajear las posiciones de los cofres
      const shuffledChestSpawns = Phaser.Utils.Array.Shuffle([...chestSpawnObjects]);

      // Barajear las palabras objetivo
      const shuffledTargetWords = Phaser.Utils.Array.Shuffle([...this.targetWordsInLevel]);

      // Asignar cada palabra objetivo a un spawn aleatorio
      shuffledTargetWords.forEach((wordData, index) => {
        if (index < shuffledChestSpawns.length) {
          const chestObj = shuffledChestSpawns[index];
          let xPos = chestObj.x!;
          let yPos = chestObj.y!;
          if (chestObj.gid && chestObj.height) {
            yPos = chestObj.y! + chestObj.height;
          }
          if (chestObj.width && !chestObj.point) xPos += chestObj.width / 2;

          const chest = new TreasureChest(this, xPos, yPos, 'atlas', wordData);
          this.chestsGroup.add(chest);
        } else {
          console.warn(
            `[PlayScene] No hay suficientes spawns de cofres en Tiled para la palabra objetivo: ${wordData.text}`
          );
        }
      });

      // --- CREACIÓN DE ZANAHORIAS ---
      const carrotSpawnObjects = objectLayer.objects.filter((obj) => {
        const typeProperty = obj.properties?.find((p: { name: string; value: string }) => p.name === 'type');
        return typeProperty?.value === 'carrot_spawn' && obj.x !== undefined && obj.y !== undefined;
      });

      // Filtrar objetos de zanahorias y crear sprites
      carrotSpawnObjects.forEach((obj) => {
        const xPos = obj.x!;
        let yPos = obj.y!;

        if (obj.gid && obj.height) {
          yPos = obj.y! - obj.height;
        }

        const carrot = this.carrotsGroup.create(xPos, yPos, 'atlas', 'carrot/carrot-1');

        carrot.setOrigin(0.5, 0.5).setScale(1);
        carrot.play('carrot_spin');
        if (carrot.body) {
          (carrot.body as Phaser.Physics.Arcade.Body).setSize(carrot.width * 0.6, carrot.height * 0.6); // Collider más ajustado
          (carrot.body as Phaser.Physics.Arcade.Body).setOffset(carrot.width * 0.2, carrot.height * 0.2);
        } else {
          console.warn('Zanahoria creada sin cuerpo físico:', carrot);
        }
      });

      // --- ESCALERAS Y ESPINAS
      objectLayer.objects.forEach((obj) => {
        // Escaleras
        const isStair = obj.properties?.find(
          (p: { name: string; value: boolean }) => p.name === 'stairs' && p.value === true
        );
        if (isStair && obj.x !== undefined && obj.y !== undefined && obj.width && obj.height) {
          this.ladderZones.push(new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height));
        }
        // Espinas
        const isSpike = obj.properties?.find(
          (p: { name: string; value: boolean }) => p.name === 'spikes' && p.value === true
        );
        if (isSpike && obj.x !== undefined && obj.y !== undefined && obj.width && obj.height) {
          this.spikeZones.push(new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height));
        }
      });
    }

    // --- Configurar el Mundo y la Cámara que sigue al jugador ---
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // --- Crear al Jugador ---
    // Si no se encuentra el spawn, se usa una posición por defecto.
    const spawnPointObject = this.map.findObject('Object Layer', (obj) => obj.name === 'PlayerSpawn');
    let spawnX = 80;
    let spawnY = 150;

    if (spawnPointObject && typeof spawnPointObject.x === 'number' && typeof spawnPointObject.y === 'number') {
      spawnX = spawnPointObject.x;
      spawnY = spawnPointObject.y;
    }

    this.player = new Player(this, spawnX, spawnY);

    // --- Crear Grupo de Enemigos
    this.enemiesGroup = this.physics.add.group({
      runChildUpdate: true
    });

    // --- Spawn de enemigos desde Tiled
    const enemyObjects = this.map.getObjectLayer('Object Layer')?.objects || [];
    enemyObjects.forEach((obj) => {
      if (obj.x != undefined && obj.y != undefined) {
        const type = obj.properties?.find((p: { name: string }) => p.name === 'type')?.value;
        let xPos = obj.x;
        let yPos = obj.y;
        if (type === 'piranha' && obj.height && obj.height > 0 && !obj.point) {
          yPos = obj.y + obj.height;
        } else if (type !== 'piranha' && obj.width && obj.height && !obj.point) {
          xPos += obj.width / 2;
          yPos += obj.height / 2;
        }

        if (type === 'bee') {
          const patrolDistance =
            obj.properties?.find((p: { name: string }) => p.name === 'patrolDistance')?.value || 64;
          const isHorizontal =
            obj.properties?.find((p: { name: string }) => p.name === 'horizontalPatrol')?.value === true;

          const bee = new BeeEnemy(this, xPos, yPos, 'atlas', 'bee/bee-1', patrolDistance, isHorizontal);
          this.enemiesGroup.add(bee);

          if (bee.body) {
            const beeBody = bee.body as Phaser.Physics.Arcade.Body;
            beeBody.setAllowGravity(false);

            if (isHorizontal) {
              beeBody.setVelocityX(bee['moveSpeed'] * bee['patrolDirection']);
              beeBody.setVelocityY(0);
            } else {
              // Patrulla Vertical
              beeBody.setVelocityX(0);
              beeBody.setVelocityY(bee['moveSpeed'] * bee['patrolDirection']);
            }
          }
        } else if (type === 'slug') {
          const patrolDistance =
            obj.properties?.find((p: { name: string }) => p.name === 'patrolDistance')?.value || 48;
          const initialDirProp = obj.properties?.find((p: { name: string }) => p.name === 'initialDirection')?.value;
          const initialDirection = initialDirProp === -1 ? -1 : 1;
          const speed = obj.properties?.find((p: { name: string }) => p.name === 'moveSpeed')?.value || 20;

          const slug = new SlugEnemy(this, xPos, yPos, 'slug_enemy', 0, patrolDistance, speed, initialDirection);
          this.enemiesGroup.add(slug);
        } else if (type === 'piranha') {
          const attackRange = obj.properties?.find((p: { name: string }) => p.name === 'attackRange')?.value || 70;
          const plant = new PiranhaPlantEnemy(this, xPos, yPos, 'atlas', 'piranha-plant/piranha-plant-1', attackRange);
          this.enemiesGroup.add(plant);
        }
      }
    });

    // --- Colisiones Jugador---
    if (this.player && this.collisionLayer) {
      this.physics.add.collider(this.player, this.collisionLayer);
      // --- Colisiones de Enemigos ---
      this.physics.add.collider(this.enemiesGroup, this.collisionLayer);
      // --- Colisiones de cofres ---
      this.physics.add.collider(this.chestsGroup, this.collisionLayer);
    }
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2.6);

    // --- Overlap entre Jugador y Zanahorias ---
    if (this.player) {
      this.physics.add.overlap(this.player, this.carrotsGroup, this.handleCollectCarrot, undefined, this);
    } else {
      console.warn('Player is undefined in PlayScene.create');
    }

    // Colisión entre Jugador y Enemigos
    this.physics.add.overlap(this.player, this.enemiesGroup, this.handlePlayerEnemyOverlap, undefined, this);

    if (this.levelData) {
      this.scene.launch('UIScene', {
        levelId: this.levelData.id,
        promptText: this.levelData.promptText,
        targetWordsCount: this.targetWordsInLevel.length,
        allWordsForLevel: this.levelData.words
      });
    } else {
      console.error('[PlayScene Create] this.levelData es undefined. No se puede lanzar UIScene con datos.');
    }
    // --- ESCUCHAR EVENTO DE PALABRA ENCONTRADA
    this.events.on(WORD_FOUND_EVENT, this.handleWordFound, this);
  }

  private handlePlayerEnemyOverlap: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (playerGO, enemyGO): void => {
    const player = playerGO as Player;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enemy = enemyGO as any;

    if (enemy.getHitByPlayer && typeof enemy.getHitByPlayer === 'function') {
      enemy.getHitByPlayer(player);
    }
  };

  private handleGoToMenu(): void {
        console.log("[PlayScene] Recibido evento 'goToMenu' desde UIScene.");
    
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.scene.stop(); // Detener PlayScene
        this.scene.start('menuScene');
    }

  private handleWordFound(wordData: WordData, chestEmitter: TreasureChest): void {
    if (!this.foundWords.has(wordData.text)) {
      this.foundWords.set(wordData.text, wordData);
      console.log(
        `[PlayScene] Palabra "${wordData.text}" encontrada. Total: ${this.foundWords.size}/${this.targetWordsInLevel.length}`
      );

      console.log(`[PlayScene] chestEmitter: ${chestEmitter}`);

      // Notificar a UIScene para que actualice el prompt
      this.scene.get('UIScene')?.events.emit('wordCollected', wordData, Array.from(this.foundWords.values()));

      if (this.foundWords.size >= this.targetWordsInLevel.length) {
        this.allTargetWordsFound();
      }
    }
  }

  private allTargetWordsFound(): void {
    this.scene.get('UIScene')?.events.emit('sentenceComplete', this.levelData.feedback);
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('endScene', { result: 'win' });
    });
  }

  // función para Recolectar Zanahorias
  private handleCollectCarrot: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (playerGO, carrotGO): void => {
    if (!playerGO || !carrotGO) {
      console.warn('handleCollectCarrot: playerGO o carrotGO es undefined');
      return;
    }

    const player = playerGO as Player;
    const carrot = carrotGO as Phaser.Physics.Arcade.Sprite;

    if (player.health < player.maxHealth) {
      // Solo recoger si no tiene salud máxima
      player.collectHealthItem(1);

      carrot.disableBody(true, true);
      this.carrotsGroup.remove(carrot, true, true);
    }
  };

  update(time: number, delta: number): void {
    // Se actualiza el Parallax
    if (this.bgFar) {
      this.bgFar.tilePositionX = this.cameras.main.scrollX * 0.2;
      this.bgFar.tilePositionY = this.cameras.main.scrollY * 0.2;
    }
    if (this.bgNear) {
      this.bgNear.tilePositionX = this.cameras.main.scrollX * 0.5;
      this.bgNear.tilePositionY = this.cameras.main.scrollY * 0.3;
    }

    if (this.player && this.player.active) {
      // Detectar si el jugador está tocando una escalera
      let touchingLadder = false;
      const playerBounds = this.player.getBounds();
      for (const zone of this.ladderZones) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, zone)) {
          touchingLadder = true;
          break;
        }
      }
      this.player.setTouchingLadder(touchingLadder);

      // Detectar si el jugador toca una zona de espinas
      for (const spikeZone of this.spikeZones) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, spikeZone)) {
          this.player.takeDamage(this.player.health); // Muerte instantánea
          break;
        }
      }

      this.player.preUpdate(time, delta);

      // --- LÓGICA PARA ABRIR COFRES CON TECLA E
      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
            let openedAChestThisFrame = false;
            this.chestsGroup.getChildren().forEach((chestGO) => {
                if (openedAChestThisFrame) return;

                const chest = chestGO as TreasureChest;
                if (chest.active && chest['canBeOpened'] && !chest['isOpen']) {
                    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y);
                    if (distance < (chest.width + this.player.width) / 1.5) {
                        if (chest.attemptOpen()) {
                            openedAChestThisFrame = true;
                        }
                    }
                }
            });
        }
    }
  }
   shutdown(): void {
        // Limpiar el listener al detener la escena
        const uiScene = this.scene.get('UIScene');
        if (uiScene) {
            uiScene.events.off('goToMenu', this.handleGoToMenu, this);
        }
        console.log("[PlayScene] Shutdown");
        // Aquí también podrías detener la música si es específica de esta escena.
    }
}
