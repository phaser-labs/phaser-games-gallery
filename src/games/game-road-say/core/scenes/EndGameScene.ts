import Phaser from 'phaser';
// import { globalState } from '../utils/GlobalState';
//pantalla donde termina el juego, puede ser de victoria o derrota
export class EndGame extends Phaser.Scene {
  constructor() {
    super('endGameScene');
  }
  preload() {}
  // startGame() {
  //   this.scene.start('menuScene'); // Lanza la escena principal
  // }
  create() {
    this.add.image(0, 0, 'backGrass').setOrigin(0, 0).setScale(0.8);
    this.add.particles(0, 0, 'confetti', {
      x: { min: 0, max: this.scale.width },
      y: 0,
      lifespan: 3000,
      speedY: { min: 100, max: 300 },
      speedX: { min: -100, max: 100 },
      gravityY: 200,
      scale: { start: 0.2, end: 0 },
      quantity: 1,
      blendMode: 'NORMAL',
      frequency: 30,
      tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]
    });

    this.anims.create({
      key: 'follower-quieta-anims',
      frames: this.anims.generateFrameNumbers('avatarQuieta', { start: 0, end: 31 }),
      frameRate: 20,
      repeat: -1
    });
    const follower = this.add.sprite(160, 290, 'avatarQuieta').setOrigin(0.5, 0.5);
    follower.play('follower-quieta-anims');
    const containerTextFelicitaciones = this.add.dom(
      300,
      10,
      'h2',
      '',
      'Felicitaciones  '
    ) as Phaser.GameObjects.DOMElement;
    containerTextFelicitaciones.setClassName('gameRoadDice__containerTextFelicitaciones').setOrigin(0, 0);
    const containerTextFeedback = this.add.dom(
      280,
      200,
      'h2',
      '',
      'has superado el camino de preguntas'
    ) as Phaser.GameObjects.DOMElement;
    containerTextFeedback.setClassName('gameRoadDice__containerTextfeedback').setOrigin(0, 0);

    // Agrega el botón en la posición deseada
    const btnIniciar = this.add.dom(600, 400, 'button', '', 'Volver') as Phaser.GameObjects.DOMElement;
    btnIniciar.setClassName('gameRoadDice__startButton');
    const htmlbtnIniciar = btnIniciar.node as HTMLElement;

    htmlbtnIniciar.addEventListener('click', () => {
      this.scene.start('menuScene');
    });
  }

  update() {}
}
