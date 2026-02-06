import Phaser from 'phaser';

export class Preload extends Phaser.Scene {
  constructor() {
    super('preloadScene');
  }

  preload() {
    this.load.image('tiles_ground', 'assets/game-whack-a-question/tiles/Topdown RPG 32x32 - Ground Tileset 1.2.PNG');
    this.load.image('tiles_trees', 'assets/game-whack-a-question/tiles/Topdown RPG 32x32 - Trees 1.2.PNG');

    this.load.tilemapTiledJSON('mapa_bosque', 'assets/game-whack-a-question/tiles/normalMapWhackAQuestion.json');

    this.createProgressBar();
    this.loadImages();
    this.loadSpritesheets();
    this.loadAudio();
  }

  create() {
    // Transición directa al juego (saltando el menú por ahora)
    // Si quieres usar el menú, cambia 'gameScene' por 'menuScene'
    this.scene.start('menuScene');
  }

  private loadImages() {
    this.load.image('background_sky', 'assets/game-whack-a-question/images/backgrounds/background_sky.png');
    
    this.load.image('clouds_medium', 'assets/game-whack-a-question/images/backgrounds/background_clouds_medium.png');
    this.load.image('clouds_small', 'assets/game-whack-a-question/images/backgrounds/background_clouds_small.png');
    
  }

  private loadSpritesheets() {}
  
  private loadAudio() {}
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
