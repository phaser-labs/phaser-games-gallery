import Phaser from 'phaser';

// import { globalState } from '../utils/GlobalState';

// import '../../frogJumping.css';
export class LoadMedia extends Phaser.Scene {
  constructor() {
    super('loadMedia');
  }
  preload() {
    this.load.image('loadingBg', 'assets/images/logo_load2.png');
  }
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingImage = this.add.image(width / 2, height / 2, 'loadingBg');
    loadingImage.setOrigin(0.5);
    loadingImage.setScale(3.2);
    const progressBar = this.add.graphics();
    const loadingText = this.add
      .text(width / 2, height / 2 - 50, 'Cargando...', {
        fontSize: '24px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2, 300 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      loadingText.destroy();
      loadingImage.destroy();

      // Cambia de escena o inicia el juego
      this.scene.start('menuScene');
    });
    this.load.image('background_1', 'assets/images/background_1.jpg');
    this.load.image('background_2', 'assets/images/background_2.jpg');
    this.load.image('background_3', 'assets/images/background_3.jpg');

    this.load.image('grid_1_1', 'assets/images/box1.png');
    this.load.image('grid_1_2', 'assets/images/box2.png');
    this.load.image('grid_1_3', 'assets/images/box3.png');
    this.load.image('grid_1_4', 'assets/images/box4.png');

    this.load.image('grid_2_1', 'assets/images/duck1.png');
    this.load.image('grid_2_2', 'assets/images/duck2.png');
    this.load.image('grid_2_3', 'assets/images/duck3.png');
    this.load.image('grid_2_4', 'assets/images/duck4.png');

    this.load.image('grid_3_1', 'assets/images/colorFull1.png');
    this.load.image('grid_3_2', 'assets/images/colorFull2.png');
    this.load.image('grid_3_3', 'assets/images/colorFull3.png');
    this.load.image('grid_3_4', 'assets/images/colorFull4.png');
    this.load.image('endGameImage', 'assets/images/backgroudEndScene.png');

    //sprite sheet
    this.load.spritesheet('bang', 'assets/images/bang.png', {
      frameWidth: 200, // ancho de cada frame
      frameHeight: 200 // alto de cada frame
    });
    //sonidos
    this.load.audio('correct', 'assets/audios/correct.mp3');
    this.load.audio('incorrect', 'assets/audios/incorrect.mp3');
    this.load.audio('breaking', 'assets/audios/breaking.mp3');
    this.load.audio('click', 'assets/audios/click.mp3');
    // imsgenes de la scena de instrucciones
    this.load.image('menuBg', 'assets/images/bgStart.jpg');
    this.load.start();
  }
  update() {}
}
