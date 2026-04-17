import Phaser from 'phaser';

import { Quiz } from '../../../types/AppTypes';

// ─────────────────────────────────────────────────────────────
//  LoadMedia_v3 — carga los assets de la versión 3
// ─────────────────────────────────────────────────────────────
export class LoadMedia_v3 extends Phaser.Scene {
  private quizList: Quiz[] = [];

  constructor() {
    super('LoadMedia_v3');
  }

  init(data: { dataGame: Quiz[] }) {
    this.quizList = data?.dataGame ?? [];
  }

  preload() {
    // Solo el fondo de la pantalla de carga, necesario antes de create()
    this.load.image('loadingBg', 'assets/game-pool-question/images/loading_bg.png');
  }

  create() {
    const { width, height } = this.cameras.main;

    // ── Imagen de fondo ───────────────────────────────────────
    this.add
      .image(width / 2, height / 2, 'loadingBg')
      .setOrigin(0.5)
      .setDisplaySize(width / 1.3, height / 1.3);

    // ── Logo / título ─────────────────────────────────────────
    this.add
      .text(width / 2, height / 2 - 100, 'POOL MASTER', {
        fontSize: '48px',
        fontFamily: 'Spline Sans, sans-serif',
        fontStyle: 'bold',
        color: '#2b6cee'
      })
      .setOrigin(0.5);

    // ── Texto de estado ───────────────────────────────────────
    const statusText = this.add
      .text(width / 2, height / 2 - 30, 'Cargando assets...', {
        fontSize: '18px',
        fontFamily: 'Spline Sans, sans-serif',
        color: '#c3c6d7'
      })
      .setOrigin(0.5);

    // ── Barra de progreso ─────────────────────────────────────
    const barW = 400,
      barH = 8,
      barX = width / 2 - barW / 2,
      barY = height / 2 + 10;

    const progressBar = this.add.graphics();

    // ── Porcentaje ────────────────────────────────────────────
    const percentText = this.add
      .text(width / 2, barY + 30, '0%', {
        fontSize: '40px',
        fontFamily: 'Spline Sans, sans-serif',
        color: '#64748b'
      })
      .setOrigin(0.5);

    // ── Eventos de carga ──────────────────────────────────────
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x2b6cee, 1);
      progressBar.fillRoundedRect(barX, barY, barW * value, barH, 4);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      statusText.setText(`Cargando: ${file.key}`);
    });

    this.load.on('complete', () => {
      percentText.setText('100%');
      statusText.setText('¡Listo!');

      this.time.delayedCall(400, () => {
        const data = (this.registry.get('dataGame') as Quiz[]) ?? this.quizList;
        this.scene.start('MenuScene_v3', { dataGame: data });
      });
    });

    // ── ASSETS DE LA VERSIÓN 3 ────────────────────────────────
    this.load.tilemapTiledJSON('mesaBillar_v3', 'assets/game-pool-question/maps/mesaPool3Corta.tmj');
    this.load.image('mesa_v3', 'assets/game-pool-question/tilesets/mesa3.png');

    this.load.spritesheet('ballWhite', 'assets/game-pool-question/images/balls/spriteSheetBallWhite.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    this.load.spritesheet('ball1', 'assets/game-pool-question/images/balls/spriteSheetBall15.png', {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.image('cue', 'assets/game-pool-question/images/cue/poolCue_3.png');

    this.load.audio('sfx_ball_hit', 'assets/game-pool-question/audios/ball_hit.mp3');
    this.load.audio('sfx_cue_hit_ball', 'assets/game-pool-question/audios/cue_hit.mp3');
    this.load.audio('sfx_pocket', 'assets/game-pool-question/audios/pocket.mp3');
    this.load.audio('sfx_correct', 'assets/game-pool-question/audios/correct.mp3');
    this.load.audio('sfx_incorrect', 'assets/game-pool-question/audios/incorrect.mp3');
    this.load.audio('sfx_cushion', 'assets/game-pool-question/audios/cushion.mp3');
    this.load.audio('sfx_fauld', 'assets/game-pool-question/audios/fauld.mp3');

    this.load.start();
  }
}