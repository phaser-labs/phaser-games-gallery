import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.image('background', 'assets/quiz-flight/images/scenary-1.png');
    this.load.image('background-2', 'assets/quiz-flight/images/scenary-2.png');
    this.load.image('background-3', 'assets/quiz-flight/images/scenary-3.png');
  }

  create() {
    this.scene.start('Preloader');
  }
}
