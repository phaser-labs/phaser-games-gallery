import Phaser from 'phaser';

import { preloadCommonAssets, preloadThemeAssets, preloadThemeMusic } from '../../utils/game-assets';
import { themeManager } from '../../utils/theme-manager';

export class Preload extends Phaser.Scene {
  constructor() {
    super('preloadScene');
  }

  preload() {
    this.createProgressBar();

    // Obtener el tema actual
    const currentTheme = themeManager.getCurrentTheme();

    // Cargar assets comunes (que no dependen del tema)
    preloadCommonAssets(this);

    // Cargar assets específicos del tema
    preloadThemeAssets(this, currentTheme);

    // Cargar música del tema
    preloadThemeMusic(this, currentTheme);
  }

  create() {
    // Fade out antes de cambiar a la siguiente escena
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('menuScene');
    });
  }
  private createProgressBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    const loadingText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Cargando...',
        style: { font: '20px monospace', color: '#000' }
      })
      .setOrigin(0.5, 0.5);

    const percentText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: { font: '18px monospace', color: '#eee' }
      })
      .setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00000, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }
}
