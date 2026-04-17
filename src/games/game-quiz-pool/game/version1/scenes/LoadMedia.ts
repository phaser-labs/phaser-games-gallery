import Phaser from 'phaser';

import type { Quiz } from '@/types/AppTypes';

// ─────────────────────────────────────────────────────────────
//  LoadMedia (v1) — carga los assets de la versión 1
// ─────────────────────────────────────────────────────────────
export class LoadMedia extends Phaser.Scene {
  private quizList: Quiz[] = [];

  constructor() {
    super('LoadMedia');
  }

  init(data: { dataGame: Quiz[] }) {
    this.quizList = data?.dataGame ?? [];
  }

  preload() {
    // Solo el fondo de la pantalla de carga, necesario antes de create()
    this.load.image('loadingBg', 'assets/images/loading_bg.png');
  }

  create() {
    const { width, height } = this.cameras.main;

    // ── Imagen de fondo ───────────────────────────────────────
    this.add
      .image(width / 2, height / 2, 'loadingBg')
      .setOrigin(0.5)
      .setDisplaySize(width, height);

    this.add.rectangle(0, 0, width, height, 0x101622);

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

    this.add.rectangle(width / 2, barY + barH / 2, barW, barH, 0x1d1f27).setOrigin(0.5);

    const progressBar = this.add.graphics();

    // ── Porcentaje ────────────────────────────────────────────
    const percentText = this.add
      .text(width / 2, barY + 30, '0%', {
        fontSize: '14px',
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
      statusText.setText(value < 1 ? 'Cargando assets...' : 'Listo');
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      statusText.setText(`Cargando: ${file.key}`);
    });

    this.load.on('complete', () => {
      percentText.setText('100%');
      statusText.setText('¡Listo!');

      this.time.delayedCall(400, () => {
        const data = (this.registry.get('dataGame') as Quiz[]) ?? this.quizList;
        this.scene.start('Menu', { dataGame: data });
      });
    });

    // ── ASSETS DE LA VERSIÓN 1 ────────────────────────────────
    this.load.tilemapTiledJSON('mesaBillar', 'assets/maps/mesaPool.tmj');
    this.load.image('mesa', 'assets/tilesets/mesaDeBillar.png');

    this.load.spritesheet('ballWhite', 'assets/images/balls/spriteSheetBallWhite.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    this.load.spritesheet('ball1', 'assets/images/balls/spriteSheetBall8.png', {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.image('cue', 'assets/images/cue/poolCue_2.png');

    this.load.audio('sfx_ball_hit', 'assets/audios/ball_hit.mp3');
    this.load.audio('sfx_cue_hit_ball', 'assets/audios/cue_hit.mp3');
    this.load.audio('sfx_pocket', 'assets/audios/pocket.mp3');
    this.load.audio('sfx_correct', 'assets/audios/correct.mp3');
    this.load.audio('sfx_incorrect', 'assets/audios/incorrect.mp3');
    this.load.audio('sfx_cushion', 'assets/audios/cushion.mp3');
    this.load.audio('sfx_fauld', 'assets/audios/fauld.mp3');

    this.load.start();
  }
}