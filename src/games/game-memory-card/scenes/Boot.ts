import Phaser from 'phaser';
export class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'Boot'
    });
  }

  preload() {
  }

  create() {
    // Configuraciones iniciales del juego
    this.setupGame();

    // Transición al Preloader
    this.scene.start('Preloader');
  }

  private setupGame() {
    // Configuración global del juego
    this.game.canvas.setAttribute('tabindex', '0');
  }
}
