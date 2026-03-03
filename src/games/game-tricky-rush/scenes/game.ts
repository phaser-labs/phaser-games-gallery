import Phaser, { Scene } from "phaser";

import { CHALLENGE } from "@/data/data-tricky-rush";

import { Character, NextPiecePreview, PhraseBuilder } from "../components";
import { ActivePiece, GameResult, Material, TetrisConfig } from "../types/types";
import { announce } from "../utils/announce";
import { createBaseTextures, createColoredBlockTexture, createPenaltyBlockTexture, getColorForPiece } from "../utils/blocks-textures";
import { ASSETS } from "../utils/game-assets";
import {
  buildHouseTopByCol,
  canPlaceCellsAt,
  lockIntoOccupied,
  rotateWithKicks,
  spawnPiece,
} from "../utils/logic-tetris";
import { getRoofFromHouseLayer } from "../utils/roof-from-house";
import { getCells, getPenaltyCells, randPiecePenaltyType } from "../utils/shapes-tetris";
import {
  createTiledBackground,
} from "../utils/tiled-background";

import css from '../styles/tricky.module.css';

export class Game extends Scene {
  private selectedPlayer!: number;
  private selectedBlockType!: Material;

  // ================================
  // CONSTANTS
  // ================================
  private readonly TILE = 16;
  private readonly PIECE_DEPTH = 1000;
  private readonly DAS = 140;
  private readonly ARR = 45;
  currentMaterial: Material = "normal";

  // ================================
  // INPUT
  // ================================
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyRotateCW!: Phaser.Input.Keyboard.Key;
  private keyRotateCCW!: Phaser.Input.Keyboard.Key;
  private dropKey!: Phaser.Input.Keyboard.Key;

  // ================================
  // WORLD / MAP
  // ================================
  private worldMinCol = 0;
  private worldMaxCol = 0;
  private mapHeight = 0;
  roofTopRow = 0;
  private houseTopByCol: Array<number | null> = [];

  // ================================
  // GAME STATE
  // ================================
  private occupied = new Set<string>();
  private settled!: Phaser.GameObjects.Group;
  private activeBlocks: Phaser.GameObjects.Image[] = [];
  private spawnQueue: Array<() => void> = [];
  private active?: ActivePiece & {
    material: Material;
    isPenalty?: boolean;
    penaltyShape?: "D" | "C" | "F";
  };

  // caída
  fallTimer?: Phaser.Time.TimerEvent;
  private fallMs = 450;

  // movimiento lateral tipo Tetris
  private moveHeldDir: -1 | 0 | 1 = 0;
  private moveNextAt = 0;

  private cfg!: TetrisConfig;

  // phrase builder
  private phraseBuilder!: PhraseBuilder;
  private currentChallengeIndex = 0;

  // next piece preview
  private nextPreview!: NextPiecePreview;
  private nextPiece?: ActivePiece & {
    material: Material;
    isPenalty?: boolean;
    penaltyShape?: "D" | "C" | "F";
  };

  // Character
  private character!: Character;
  private laserImage!: Phaser.GameObjects.Image;
  private laserRow!: number;
  private houseWidthPx!: number;

  private isGameOver = false;
  private isPaused = false;
  private isResolvingBlocks = false;

  // Telón accesible (DOM)
  private curtainDom!: Phaser.GameObjects.DOMElement;
  private curtainDomEl!: HTMLDivElement;
  private curtainMsgEl!: HTMLDivElement;

  private overlayMode: 'next' | 'restart' | 'finish' = 'next';
  private overlayBtnEl!: HTMLButtonElement;
  private isTransitioning = false;

  constructor() {
    super("GameMain");
  }

  init(data: { player: number; block: Material }) {

    this.selectedPlayer = data.player;
    this.selectedBlockType = data.block;

    this.cleanUp();
  }

  private cleanUp() {
    this.currentChallengeIndex = 0;

    this.occupied = new Set();
    this.spawnQueue = [];
    this.active = undefined;
    this.activeBlocks = [];

    this.isGameOver = false;
    this.isPaused = false;
    this.isResolvingBlocks = false;

    this.moveHeldDir = 0;
    this.moveNextAt = 0;

    if (this.fallTimer) {
      this.fallTimer.remove(false);
      this.fallTimer = undefined;
    }
  }
  // =========================================================
  // CREATE
  // =========================================================

  create() {
    this.setupInput();
    this.setupWorld();

    if ("context" in this.sound) {
      const manager = this.sound as Phaser.Sound.WebAudioSoundManager;
      manager.context.resume();
    }

    const audioManager = this.registry.get("audioManager");

    if (!audioManager.isMusicPlaying()) {
      audioManager.playMusic(ASSETS.menu_music.key);
    }

    this.currentMaterial = this.selectedBlockType;

    createBaseTextures(this, this.TILE);

    this.character = new Character(
      this,
      this.scale.width - 150,
      this.roofTopRow * this.TILE - 80,
      this.selectedPlayer
    );

    this.nextPreview = new NextPiecePreview(this, 20, 165);
    this.generateNextPiece();

    this.settled = this.add.group();

    this.loadChallenge(this.currentChallengeIndex);
    this.registerPhraseEvents();

    this.createModalOverlayDom();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.spawnQueue = [];
      this.occupied.clear();
    });
  }

  private generateNextPiece(isPenalty = false) {

    const base = spawnPiece(this.cfg, 0);

    this.nextPiece = {
      ...base,
      material: this.currentMaterial,
      isPenalty,
      penaltyShape: isPenalty ? randPiecePenaltyType() : undefined
    };

    this.nextPreview.update(this.nextPiece);
  }

  // =========================================================
  // SETUP METHODS
  // =========================================================

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.dropKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyRotateCW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyRotateCCW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  }

  private setupWorld() {
    const { map, house } = createTiledBackground(this);

    this.worldMinCol = 0;
    this.worldMaxCol = map.width - 1;
    this.mapHeight = map.height;

    const roofInfo = getRoofFromHouseLayer(map, house);
    this.roofTopRow = roofInfo.topRow;

    this.houseTopByCol = buildHouseTopByCol(map, 'house');

    // 🔥 calcular ancho real de la casa
    const colsWithHouse = this.houseTopByCol
      .map((row, col) => (row !== null ? col : null))
      .filter((col): col is number => col !== null);

    if (colsWithHouse.length > 0) {
      const minCol = Math.min(...colsWithHouse);
      const maxCol = Math.max(...colsWithHouse);

      this.houseWidthPx = (maxCol - minCol + 5) * this.TILE;
    } else {
      this.houseWidthPx = map.width * this.TILE; // fallback
    }

    this.cfg = {
      worldMinCol: this.worldMinCol,
      worldMaxCol: this.worldMaxCol,
      mapHeight: this.mapHeight,
      houseTopByCol: this.houseTopByCol,
      tile: this.TILE,
    };
  }

  // =========================================================
  // SPAWN TYPES
  // =========================================================

  private spawnRewardBlock() {

    if (!this.nextPiece) return;

    const spawnRow = 15;

    const piece = {
      ...this.nextPiece, // ✅ usar la misma
      row: spawnRow,
      material: this.currentMaterial,
      isPenalty: false,
      rot: 0
    };

    this.active = piece;
    this.renderActive();
    this.startFalling();

    this.generateNextPiece(false); // generar la siguiente
  }

  private spawnPenaltyBlock() {

    if (!this.nextPiece) return;

    this.character.playSpell();

    const spawnRow = 15;

    const piece = {
      ...this.nextPiece,
      row: spawnRow,
      material: this.currentMaterial,
      isPenalty: true,
      penaltyShape: randPiecePenaltyType(),
      rot: 0
    };

    this.active = piece;
    this.renderActive();
    this.startFalling();

    this.generateNextPiece(true);
  }

  private startFalling() {

    // eliminar timer anterior si existe
    if (this.fallTimer) {
      this.fallTimer.remove(false);
    }

    this.fallTimer = this.time.addEvent({
      delay: this.fallMs,
      loop: true,
      callback: () => {

        if (!this.active) {
          this.fallTimer?.remove(false);
          return;
        }

        this.move(0, 1);

      }
    });
  }

  private processSpawnQueue() {
    if (this.active || this.isGameOver) return;
    const next = this.spawnQueue.shift();
    if (next) {
      next();
    } else {
      // 🔥 ya no quedan bloques
      this.isResolvingBlocks = false;
    }
  }

  // =========================================================
  // RENDER ACTIVE PIECE
  // =========================================================

  private renderActive() {
    if (!this.active) return;

    this.clearActiveSprites();

    let cells;

    if (this.active.isPenalty && this.active.penaltyShape) {
      cells = getPenaltyCells(
        this.active.penaltyShape,
        this.active.rot
      );
    } else {
      cells = getCells(this.active.type, this.active.rot);
    }

    for (const cell of cells) {
      const x = (this.active.col + cell.x) * this.TILE;
      const y = (this.active.row + cell.y) * this.TILE;

      let tex: string;

      if (this.active.isPenalty) {
        tex = createPenaltyBlockTexture(
          this,
          this.TILE
        );
      } else {
        switch (this.active.material) {
          case "glass":
            tex = "block_glass";
            break;

          case "stone":
            tex = "block_stone";
            break;

          case "normal":
          default:
            tex = createColoredBlockTexture(
              this,
              this.TILE,
              getColorForPiece(this.active.type)
            );
            break;
        }
      }

      const block = this.add.image(x, y, tex).setOrigin(0, 0);

      block.setDepth(this.PIECE_DEPTH);
      this.activeBlocks.push(block);
    }
  }

  private clearActiveSprites() {
    this.activeBlocks.forEach(b => b.destroy());
    this.activeBlocks = [];
  }

  // =========================================================
  // SPAWN / LOCK / DISCARD
  // =========================================================

  private lockPiece() {
    if (!this.active) return;

    lockIntoOccupied(this.occupied, this.active);

    const audioManager = this.registry.get("audioManager");
    audioManager.playSFX(ASSETS.spawn_sound.key);

    this.activeBlocks.forEach(block => {
      block.setDepth(20);
      this.settled.add(block);
    });

    // 🔥 verificar láser SOLO después de bloquear
    if (this.isTouchingLaser(this.active)) {
      audioManager.playSFX(ASSETS.incorrect_word.key);
      this.triggerGameOver('Tocaste el láser.');
      return;
    }

    this.activeBlocks = [];
    this.active = undefined;

    this.fallTimer?.remove(false);

    if (this.spawnQueue.length === 0) this.isResolvingBlocks = false;
    this.processSpawnQueue();
  }

  private discardPiece() {
    this.clearActiveSprites();
    this.active = undefined;
    this.fallTimer?.remove(false);
  }

  // =========================================================
  // MOVEMENT
  // =========================================================

  private move(dc: number, dr: number) {
    if (!this.active) return;
    const audioManager = this.registry.get("audioManager");

    const next: ActivePiece & { material: Material, isPenalty?: boolean, penaltyShape?: "D" | "C" | "F" } = {
      ...this.active,
      col: this.active.col + dc,
      row: this.active.row + dr,
    };

    // 🔥 1) Si se salió del mundo → descartar inmediatamente
    if (this.isOutOfWorld(next)) {
      this.discardPiece();
      this.character.loseLife();

      if (this.character.isDead()) {
        audioManager.playSFX(ASSETS.incorrect_word.key);
        this.triggerGameOver('Te quedaste sin vidas.');
        return;
      }

      this.processSpawnQueue();
      return;
    }

    // 🔥 2) Movimiento normal
    let cells;

    if (next.isPenalty && next.penaltyShape) {
      cells = getPenaltyCells(next.penaltyShape, next.rot);
    } else {
      cells = getCells(next.type, next.rot);
    }

    if (canPlaceCellsAt(this.cfg, this.occupied, cells, next.col, next.row)) {
      this.active = next;
      this.renderActive();
      return;
    }

    // 🔥 3) Si estaba bajando y no pudo colocarse
    if (dr === 1) {
      this.lockPiece();
    }

  }

  private rotate(dir: 1 | -1) {
    if (!this.active) return;

    const rotated = rotateWithKicks(this.cfg, this.occupied, this.active, dir);
    if (rotated) {
      this.active = { ...this.active, ...rotated };
      this.renderActive();
    }
  }

  private hardDrop() {
    if (!this.active) return;
    const audioManager = this.registry.get("audioManager");

    while (true) {

      const next: ActivePiece & { material: Material, isPenalty?: boolean, penaltyShape?: "D" | "C" | "F" } = {
        ...this.active,
        row: this.active.row + 1
      };

      // Si se salió del mundo
      if (this.isOutOfWorld(next)) {
        this.discardPiece();
        this.character.loseLife();

        if (this.character.isDead()) {
          audioManager.playSFX(ASSETS.incorrect_word.key);
          this.triggerGameOver('Te quedaste sin vidas.');
          return;
        }

        this.processSpawnQueue();
        return;
      }
      let cells;

      if (next.isPenalty && next.penaltyShape) {
        cells = getPenaltyCells(next.penaltyShape, next.rot);
      } else {
        cells = getCells(next.type, next.rot);
      }

      if (canPlaceCellsAt(this.cfg, this.occupied, cells, next.col, next.row)) {
        this.active = next;
      } else {
        break;
      }

    }

    this.renderActive();

    if (!this.active) return;

    this.lockPiece();
  }

  private isOutOfWorld(piece: ActivePiece & { isPenalty?: boolean; penaltyShape?: "D" | "C" | "F"; }): boolean {

    let cells;

    if (piece.isPenalty && piece.penaltyShape) {
      cells = getPenaltyCells(piece.penaltyShape, piece.rot);
    } else {
      cells = getCells(piece.type, piece.rot);
    }

    for (const cell of cells) {
      const worldRow = piece.row + cell.y;
      if (worldRow >= this.mapHeight) return true;
    }
    return false;
  }

  private isTouchingLaser(piece: ActivePiece & { isPenalty?: boolean; penaltyShape?: "D" | "C" | "F"; }): boolean {
    let cells;
    if (piece.isPenalty && piece.penaltyShape) {
      cells = getPenaltyCells(piece.penaltyShape, piece.rot);
    } else {
      cells = getCells(piece.type, piece.rot);
    }

    for (const cell of cells) {
      const worldRow = piece.row + cell.y;
      // 🔥 SOLO cuando la pieza supera el láser hacia arriba
      if (worldRow <= this.laserRow) {
        return true;
      }
    }

    return false;
  }

  private positionCharacterAtLaser() {

    if (!this.character || !this.laserImage) return;

    // Posición Y del láser
    const laserY = this.laserImage.y;

    // Borde derecho visual del láser
    const laserRight = this.laserImage.getBounds().right;

    const margin = 20;

    const x = laserRight + margin;
    const y = laserY + 10;

    this.character.setPosition(x, y);
  }

  // =========================================================
  // UPDATE
  // =========================================================

  update(time: number) {
    if (this.isGameOver || this.isPaused) return;
    if (!this.active) return;

    const left = !!this.cursors.left?.isDown;
    const right = !!this.cursors.right?.isDown;

    let dir: -1 | 0 | 1 = 0;
    if (left && !right) dir = -1;
    else if (right && !left) dir = 1;

    if (dir !== this.moveHeldDir) {
      this.moveHeldDir = dir;
      if (dir !== 0) {
        this.move(dir, 0);
        this.moveNextAt = time + this.DAS;
      }
    } else if (dir !== 0 && time >= this.moveNextAt) {
      this.move(dir, 0);
      this.moveNextAt = time + this.ARR;
    }

    if (this.cursors.down?.isDown) this.move(0, 1);
    if (Phaser.Input.Keyboard.JustDown(this.keyRotateCW)) this.rotate(1);
    if (Phaser.Input.Keyboard.JustDown(this.keyRotateCCW)) this.rotate(-1);
    if (Phaser.Input.Keyboard.JustDown(this.dropKey)) this.hardDrop();
  }

  // =========================================================
  // RENDER QUESTION
  // =========================================================

  private loadChallenge(index: number) {
    const { width } = this.scale;
    if (this.phraseBuilder) {
      this.phraseBuilder.destroy();
    }

    const challenge = CHALLENGE[index];

    this.phraseBuilder = new PhraseBuilder(this, challenge, width - 20, 10, 10);

    this.laserRow = this.calculateLaserRow();
    this.positionCharacterAtLaser();

    if (this.laserImage) {
      this.laserImage.destroy();
    }

    this.laserImage = this.add
      .image(width / 2 - 2, this.laserRow * this.TILE, ASSETS.laser.key)
      .setDisplaySize(this.houseWidthPx, 12) // alto ajustable
      .setAlpha(0.7)
      .setDepth(50);

    this.positionCharacterAtLaser();
    const audioManager = this.registry.get("audioManager");

    this.events.once("phrase-correct", () => {

      const isLast = this.currentChallengeIndex >= CHALLENGE.length - 1;
      audioManager.playSFX(ASSETS.completed_words.key); // 🔥 sonido transición

      const result: GameResult = {
        isCorrect: true,
        sentenceId: this.currentChallengeIndex.toString(),
        userAnswer: this.phraseBuilder.getCurrentPhrase(),
        correctAnswer: challenge.sentence ?? '',
      };

      this.emitResult(result);

      if (isLast) {
        this.showOverlay({
          mode: 'finish',
          title: '¡Completado!',
          subtitle: 'Terminaste todas las frases.',
          buttonText: 'Finalizar'
        });
      } else {
        this.showOverlay({
          mode: 'next',
          title: 'Correcto',
          subtitle: 'Prepárate para la siguiente frase.',
          buttonText: 'Siguiente'
        });
      }
    });

    this.events.once("phrase-wrong", () => {
      this.character.loseLife();
      this.character.playSpell();
      audioManager.playSFX(ASSETS.incorrect_word.key);

      const result: GameResult = {
        isCorrect: false,
        sentenceId: this.currentChallengeIndex.toString(),
        userAnswer: this.phraseBuilder.getCurrentPhrase(),
        correctAnswer: challenge.sentence ?? '',
      };

      this.emitResult(result);

      this.showOverlay({
        mode: 'restart',
        title: 'Frase incorrecta',
        subtitle: 'La frase está mal armada.\nInténtalo otra vez.',
        buttonText: 'Reintentar'
      });

    });
  }

  private nextChallenge() {

    this.currentChallengeIndex++;
    this.loadChallenge(this.currentChallengeIndex);
  }

  private registerPhraseEvents() {
    this.events.removeAllListeners("word-placed");

    this.events.on("word-placed", (data: { correct: boolean }) => {
      const audioManager = this.registry.get("audioManager");
      audioManager.playSFX(ASSETS.click_sound.key);

      if (this.isGameOver) return;
      const words = this.phraseBuilder.getWordCount();
      this.isResolvingBlocks = true;
      if (data.correct) {
        if (words < 5) {
          this.spawnQueue.push(() => this.spawnRewardBlock());
          this.spawnQueue.push(() => this.spawnRewardBlock());
        } else {
          this.spawnQueue.push(() => this.spawnRewardBlock());
        }
      } else {
        this.character.loseLife();

        if (this.character.isDead()) {
          this.triggerGameOver('Te quedaste sin vidas.');
          return;
        }
        if (words < 5) {
          this.spawnQueue.push(() => this.spawnPenaltyBlock());
          this.spawnQueue.push(() => this.spawnPenaltyBlock());
        } else {
          this.spawnQueue.push(() => this.spawnPenaltyBlock());
        }
      }
      this.processSpawnQueue();
    });
  }

  private calculateLaserRow(): number {
    const words = this.phraseBuilder.getWordCount();
    if (words < 5) {
      return this.roofTopRow - (words * 2);
    } else {
      return this.roofTopRow - (words);
    }
  }

  public canSelectWord(): boolean {
    return !this.isResolvingBlocks && !this.isPaused && !this.isGameOver;
  }

  private emitResult(payload: GameResult) {
    const cb = this.game.registry.get('onResultCallback') as ((r: GameResult) => void) | undefined;
    cb?.(payload);
  }

  // =========================================================
  // OVERLAY
  // =========================================================

  private createModalOverlayDom() {
    const { width } = this.scale;

    this.curtainDom = this.add.dom(0, 0)
      .setOrigin(0)
      .setDepth(999999)
      .createFromHTML(`
      <div id="modal-overlay" class="${css['modal-overlay']}" style="width:${width}px;height:735px;">
        <div class="${css['modal-card']}">
          <div id="modal-title" class="${css['modal-title']}"></div>
          <div id="modal-body" class="${css['modal-body']}"></div>

          <button id="modal-btn" class="${css['modal-btn']}"></button>
        </div>
      </div>
    `);

    const root = this.curtainDom.node as HTMLDivElement;

    this.curtainDomEl = root.querySelector('#modal-overlay')!;
    this.curtainMsgEl = root.querySelector('#modal-body')!;
    this.overlayBtnEl = root.querySelector('#modal-btn')!;

    this.curtainDomEl.style.display = 'none';

    this.overlayBtnEl.addEventListener('click', () => {
      const audioManager = this.registry.get("audioManager");
      audioManager.playSFX(ASSETS.click_sound.key);
      this.onOverlayPressed()
    });
  }

  private async onOverlayPressed() {

    if (this.isTransitioning) return;
    this.isTransitioning = true;

    try {
      if (this.overlayMode === 'next') {
        this.hideOverlay();
        this.resetRound();
        this.nextChallenge();
        return;
      }
      if (this.overlayMode === 'restart') {

        this.hideOverlay();
        this.resetRound();
        // reset vidas del personaje
        this.character.destroy();
        this.character = new Character(
          this,
          this.scale.width - 150,
          this.roofTopRow * this.TILE - 80,
          this.selectedPlayer
        );
        // recargar misma pregunta
        this.loadChallenge(this.currentChallengeIndex);
        return;
      }
      if (this.overlayMode === 'finish') {
        this.scene.stop();
        this.hideOverlay();
        this.scene.start('EndGame', {
          player: this.selectedPlayer,
          block: this.selectedBlockType,
          lives: this.character.getLives(),
          totalChallenges: CHALLENGE.length
        });
        return;
      }

    } finally {
      this.isTransitioning = false;
    }
  }

  private async showOverlay(opts: {
    mode: 'next' | 'restart' | 'finish';
    title: string;
    subtitle: string;
    buttonText: string;
  }) {

    this.overlayMode = opts.mode;

    this.isPaused = true;
    this.input.enabled = false;
    this.phraseBuilder.setEnabled(false);

    if (this.fallTimer) this.fallTimer.paused = true;

    this.curtainDomEl.style.display = 'flex';

    const root = this.curtainDom.node as HTMLDivElement;

    (root.querySelector('#modal-title') as HTMLDivElement).innerHTML = opts.title;
    this.curtainMsgEl.innerHTML = opts.subtitle;
    this.overlayBtnEl.textContent = opts.buttonText;

    this.overlayBtnEl.focus();

    const builtPhrase = this.phraseBuilder.getCurrentPhrase();

    if (builtPhrase.length > 0) {
      announce(
        `${opts.title}. La frase armada fue: ${builtPhrase}. ${opts.subtitle}. Presiona ${opts.buttonText} para continuar.`
      );
    } else {
      announce(
        `${opts.title}. ${opts.subtitle}. Presiona ${opts.buttonText} para continuar.`
      );
    }
  }

  private hideOverlay() {

    this.curtainDomEl.style.display = 'none';

    this.isPaused = false;
    this.input.enabled = true;
    this.phraseBuilder.setEnabled(true);

    if (this.fallTimer) {
      this.fallTimer.paused = false;
    }
  }

  private triggerGameOver(reason: string) {

    if (this.isGameOver) return;

    this.isGameOver = true;

    // detener caída
    this.fallTimer?.remove(false);

    // limpiar pieza activa
    this.discardPiece();

    // bloquear input
    this.input.enabled = false;

    this.showOverlay({
      mode: 'restart',
      title: '💀 Game Over',
      subtitle: reason,
      buttonText: 'Reintentar'
    });
  }

  private resetRound() {
    // detener caída
    this.fallTimer?.remove(false);
    this.fallTimer = undefined;

    // limpiar pieza activa
    this.clearActiveSprites();
    this.active = undefined;

    // limpiar bloques colocados
    this.settled.clear(true, true);

    // limpiar ocupación
    this.occupied.clear();

    // limpiar cola
    this.spawnQueue = [];

    // reset estados críticos
    this.isGameOver = false;
    this.isPaused = false;
    this.isResolvingBlocks = false;
  }
}
