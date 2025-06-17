import Phaser from 'phaser';

import MusicManager from '../utils/musicManager';

import '../styles/gamePistas.css';

export class Menu extends Phaser.Scene {
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgNear!: Phaser.GameObjects.TileSprite;

  private menuElement?: Phaser.GameObjects.DOMElement;

  constructor() {
    super('menuScene');
  }
  init() {}

  create() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    MusicManager.getInstance().play(this, 'music', {volume: 0.2});

    // Fondo parallax igual que en PlayScene
    this.bgFar = this.add
      .tileSprite(0, 0, gameWidth, gameHeight, 'parallax_bg_far')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-10)
      .setScale(2.5);

    this.bgNear = this.add
      .tileSprite(0, -60, gameWidth, gameHeight, 'parallax_bg_near')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-9)
      .setScale(2.8);

    this.menuElement = this.add.dom(100, 50, 'div').setDepth(10).setOrigin(0.5, 0);
    const menuContainer = this.menuElement.node as HTMLDivElement;
    menuContainer.innerHTML = `
     <h2 class="game-clues-container">Pistas de Sabiduría: La Odisea de Nira</h2>
     <div class="game-clues-container__buttons">
     <button class="game-clues-button" id="start-game-button">Iniciar Juego</button>
     <button class="game-clues-button" id="controls-button">Controles</button>
     <button class="game-clues-button" id="settings-button">Configuraciones</button>
     </div> 
     `;

    const startButton = document.getElementById('start-game-button') as HTMLButtonElement;
    startButton.addEventListener('click', () => {
      this.sound.play('click', {volume: 0.5}); 
      this.scene.start('instructionScene');
    });

    const settingsButton = document.getElementById('settings-button') as HTMLButtonElement;
    settingsButton.addEventListener('click', () => {
      this.sound.play('click', {volume: 0.5}); 
      this.scene.start( 'settingsScene' );
    });
    const controlsButton = document.getElementById('controls-button') as HTMLButtonElement;
    controlsButton.addEventListener('click', () => {
      this.sound.play('click', {volume: 0.5}); 
      this.scene.start('controlsScene');
    });

  }

  update(_time: number, delta: number): void {
    // Movimiento suave del fondo
    if (this.bgFar) {
      this.bgFar.tilePositionX += 0.03 * delta;
    }
    if (this.bgNear) {
      this.bgNear.tilePositionX += 0.04 * delta;
    }
  }
}
