import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    this.createProgressBar();

    this.load.image('background', 'assets/space-typer-game/blue-stars.png');
    this.load.image('bg-quiet', 'assets/space-typer-game/background.jpg');
    // asteroides menu
    this.load.image('asteroid1', 'assets/space-typer-game/Asteroid 01_png_processed.png');
    this.load.image('asteroid2', 'assets/space-typer-game/Asteroid 02_png_processed.png');
    this.load.image('asteroid3', 'assets/space-typer-game/Asteroid 03_png_processed.png');
    this.load.image('asteroid4', 'assets/space-typer-game/Asteroid 04_png_processed.png');
    //AVatar principal
    this.load.image('pj_frame1', 'assets/space-typer-game/player/personaje_1.png');
    this.load.image('pj_frame2', 'assets/space-typer-game/player/personaje_2.png');
    this.load.image('pj_frame3', 'assets/space-typer-game/player/personaje_3.png');
    //Enemigos
    //Alien 1
    this.load.image('alien1_frame1', 'assets/space-typer-game/enemies/Enemy01_Green_Frame_1_png_processed.png');
    this.load.image('alien1_frame2', 'assets/space-typer-game/enemies/Enemy01_Green_Frame_2_png_processed.png');
    this.load.image('alien1_frame3', 'assets/space-typer-game/enemies/Enemy01_Green_Frame_3_png_processed.png');
    //Alien 2
    this.load.image('alien2_frame1', 'assets/space-typer-game/enemies/Enemy01_Red_Frame_1_png_processed.png');
    this.load.image('alien2_frame2', 'assets/space-typer-game/enemies/Enemy01_Red_Frame_2_png_processed.png');
    this.load.image('alien2_frame3', 'assets/space-typer-game/enemies/Enemy01_Red_Frame_3_png_processed.png');
    //Alien 3
    this.load.image('alien3_frame1', 'assets/space-typer-game/enemies/Enemy01_Teal_Frame_1_png_processed.png');
    this.load.image('alien3_frame2', 'assets/space-typer-game/enemies/Enemy01_Teal_Frame_2_png_processed.png');
    this.load.image('alien3_frame3', 'assets/space-typer-game/enemies/Enemy01_Teal_Frame_3_png_processed.png');
    //Alien 4
    this.load.image('alien4_frame1', 'assets/space-typer-game/enemies/Enemy02Green_Frame_1_png_processed.png');
    this.load.image('alien4_frame2', 'assets/space-typer-game/enemies/Enemy02Green_Frame_2_png_processed.png');
    this.load.image('alien4_frame3', 'assets/space-typer-game/enemies/Enemy02Green_Frame_3_png_processed.png');
    //Alien 5
    this.load.image('alien5_frame1', 'assets/space-typer-game/enemies/Enemy02Red_Frame_1_png_processed.png');
    this.load.image('alien5_frame2', 'assets/space-typer-game/enemies/Enemy02Red_Frame_2_png_processed.png');
    this.load.image('alien5_frame3', 'assets/space-typer-game/enemies/Enemy02Red_Frame_3_png_processed.png');
    //Alien 6
    this.load.image('alien6_frame1', 'assets/space-typer-game/enemies/Enemy02_Teal_Frame_1_png_processed.png');
    this.load.image('alien6_frame2', 'assets/space-typer-game/enemies/Enemy02_Teal_Frame_2_png_processed.png');
    this.load.image('alien6_frame3', 'assets/space-typer-game/enemies/Enemy02_Teal_Frame_3_png_processed.png');

    //Bala láser
    this.load.image('laser1', 'assets/space-typer-game/fx/bullet1.png');
    this.load.image('laser2', 'assets/space-typer-game/fx/bullet2.png');
    this.load.image('laser3', 'assets/space-typer-game/fx/bullet3.png');
    this.load.image('laser4', 'assets/space-typer-game/fx/bullet4.png');
    this.load.image('laser5', 'assets/space-typer-game/fx/bullet5.png');
    this.load.image('laser6', 'assets/space-typer-game/fx/bullet6.png');

  }

  create() {
    const MIN_MS = 900;

    this.time.delayedCall(MIN_MS, () => {
      this.scene.start('MainMenu');
    });
  }
  private createProgressBar() {
    const { width, height } = this.scale;

    const barW = Math.min(560, width * 0.78);
    const barH = 22;
    const radius = 10;

    const cx = width / 2;
    const cy = height / 2;

    const y = cy + 60;
    const x = cx - barW / 2;

    // logo centrado, ajustado hacia arriba
    this.add
      .image(cx, cy - 80, 'logo')
      .setOrigin(0.5)
      .setDepth(100)
      .setScale(0.5);

    // Texto de "Cargando..." justo arriba de la barra
    const loadingText = this.add
      .text(cx, y - 20, 'Cargando...', {
        fontFamily: '"PixelFont", monospace',
        fontSize: '18px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 1);

    // % centrado dentro de la barra
    const percentText = this.add
      .text(cx, y + barH / 2, '0%', {
        fontFamily: '"PixelFont", monospace',
        fontSize: '16px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setDepth(10);

    const bg = this.add.graphics();
    const fill = this.add.graphics();
    const border = this.add.graphics();

    // Fondo de barra (gris)
    bg.fillStyle(0x4a4a4a, 0.9);
    bg.fillRoundedRect(x, y, barW, barH, radius);

    border.lineStyle(2, 0x9a9a9a, 1);
    border.strokeRoundedRect(x, y, barW, barH, radius);

    // Suavizado visual para que se vea aunque cargue rápido
    let displayPct = 0;
    let targetPct = 0;

    this.load.on('progress', (v: number) => {
      targetPct = Phaser.Math.Clamp(v, 0, 1);
    });

    this.events.on(Phaser.Scenes.Events.UPDATE, () => {
      displayPct += (targetPct - displayPct) * 0.18;
      const pct = Phaser.Math.Clamp(displayPct, 0, 1);

      percentText.setText(`${Math.round(pct * 100)}%`);

      fill.clear();
      fill.fillStyle(0x515151, 0.85); // morado arcano (puedes cambiarlo a blanco si quieres 100% igual a la referencia)
      fill.fillRect(x, y, barW * pct, barH);
    });

    this.load.once('complete', () => {
      targetPct = 1;
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bg.destroy();
      fill.destroy();
      border.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }
}
