import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.image('background-1', 'assets/game-mistery-mode/images/game_background_1.png');
  }

  create() {
    this.scene.start('Preloader');
  }
}
