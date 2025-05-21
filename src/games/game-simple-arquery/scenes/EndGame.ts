import Phaser from 'phaser';

import PhaserGame from '../main/main';

export class EndScene extends Phaser.Scene {
  private gameEvents!: Phaser.Events.EventEmitter;
  private backgroundEndGame!: Phaser.GameObjects.Image;
  constructor() {
    super('EndScene');
  }
  init() {
    const phaserGameInstance = this.game as PhaserGame;
    if (phaserGameInstance && phaserGameInstance.gameEvents) {
      this.gameEvents = phaserGameInstance.gameEvents;
    } else {
      console.error('gameEvents no está disponible en EndGameScene!');
    }
  }
  create() {
    this.backgroundEndGame = this.add.image(0, 0, 'end-game-bg').setOrigin(0, 0);
    this.backgroundEndGame.displayWidth = this.cameras.main.width;
    this.backgroundEndGame.displayHeight = this.cameras.main.height;
     this.backgroundEndGame.setDepth(-10);


    const endScreen = this.add.dom(260, 160, 'div',).setOrigin(0, 0);
    endScreen.node.innerHTML = `
    <div class="game-arquery-end-screen-content">
    <h2 class="gameArquery_title">FIN DEL JUEGO</h2>
    </div>
    `;

    this.input.once('pointerdown', () => {
      this.gameEvents.emit('restartGame'); // 🔁 Notificar a React
      this.scene.start('Preload');
    });
  }
}
