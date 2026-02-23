import { Scene } from 'phaser';

export class Preloader extends Scene {;
  constructor() {
    super('Preloader');
  }
  preload() {
    this.createProgressBar();
  }

  /**
   * Creates a progress bar that shows the progress of the current scene's
   * loading process.
   *
   * It creates a graphics object for the progress bar and another one for
   * the background of the progress bar. It also creates two text objects, one
   * for the "Cargando..." message and another one for the percentage of
   * the loading process.
   *
   * When the loading process is complete, it destroys the created objects.
   */
  private createProgressBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Barra de progreso (fondo)
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    // Texto de carga
    const loadingText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Cargando...',
        style: {
          font: '20px monospace',
          color: '#ffffff'
        }
      })
      .setOrigin(0.5, 0.5);

    // Texto de porcentaje
    const percentText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: {
          font: '18px monospace',
          color: '#ffffff'
        }
      })
      .setOrigin(0.5, 0.5);

    // Actualizar barra de progreso
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    // Eliminar elementos cuando termine la carga
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }

  create() {
    this.scene.start('MainMenu');
  }
}
