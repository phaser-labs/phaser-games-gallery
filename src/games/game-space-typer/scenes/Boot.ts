import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Carga los assets mínimos necesarios para la pantalla de carga (Preloader)
    this.load.image('logo', 'assets/space-typer-game/logo.png');
  }

  create() {
    this.scene.start('Preloader');
  }
}
