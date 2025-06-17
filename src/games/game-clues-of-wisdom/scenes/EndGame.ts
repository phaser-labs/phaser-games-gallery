import Phaser from 'phaser';

import '../styles/gamePistas.css';
export class EndGame extends Phaser.Scene {
  private controlsElement?: Phaser.GameObjects.DOMElement;
  constructor() {
    super('endScene');
  }
  init() {}
  create(data: { result?: string }) {
    this.cameras.main.setBackgroundColor('#000');
    this.controlsElement = this.add.dom(0, 0, 'div').setDepth(10).setOrigin(0, 0);
    const controlsContainer = this.controlsElement.node as HTMLDivElement;
    controlsContainer.classList.add('game-clues-instruction-container');

    if (data.result === 'dead') {
      controlsContainer.innerHTML = `
      <div class="game-clues-endgame__container">
      <h2 class="game-clues-instruction__title2">Oh no, has muerto</h2>
      <p class="game-clues__text2">Da clic para intentarlo de nuevo</p>
      </div>
       `;
    } else if (data.result === 'win') {
      controlsContainer.innerHTML = `
      <div class="game-clues-endgame__container">
      <h2 class="game-clues-instruction__title2">Felicidades, has ganado</h2>
      <p class="game-clues__text2">¡Lo lograste! Gracias por jugar.</p>
      </div>
       `;
    }

    // zona para rediriguir al menu principal
    const backMenu = this.add.zone(0, 0, 800, 630);
    backMenu.setOrigin(0, 0);
    backMenu.setInteractive();

    backMenu.once('pointerdown', () => {
      this.scene.start('menuScene');
    });
  }
}
