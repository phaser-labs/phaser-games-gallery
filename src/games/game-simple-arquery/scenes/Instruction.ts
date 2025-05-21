import Phaser from 'phaser';

import PhaserGame from '../main/main';

import '../styles/GameArquery.css';

const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
};
export class InstructionScene extends Phaser.Scene {
  private dialogElement?: Phaser.GameObjects.DOMElement;
  private questionIndex!: number;
  private gameEvents!: Phaser.Events.EventEmitter;
  constructor() {
    super('InstructionScene');
  }
  init(data: { questionIndex: number }) {
    announce("Antes de empezar el juego, lee las instrucciones presentadas.");
 
    this.questionIndex = data.questionIndex;
    const phaserGameInstance = this.game as PhaserGame;
    if (phaserGameInstance && phaserGameInstance.gameEvents) {
      this.gameEvents = phaserGameInstance.gameEvents;
      const gameEvents = phaserGameInstance.gameEvents;

       if (gameEvents) {
        console.log("InstructionScene: Emitiendo 'phaserStartsGame' para cerrar overlay de React.");
        this.gameEvents.emit('phaserStartsGame'); // Avisa a React que el juego real (MainScene) comienza
        gameEvents.emit('preloadComplete');
    
    }
    }
  }
  create() {
    this.sound.play('background-sound', { loop: true, volume: 0.01 });

    // Configuración de la escena
    this.dialogElement = this.add.dom(0, 0, 'div').setDepth(10).setOrigin(0, 0); 
    const dialogContainer = this.dialogElement.node as HTMLDivElement;
    dialogContainer.classList.add('game-arquery-container');
    dialogContainer.innerHTML = `
      <div class="game-arquery-content">
       <h2 class="game-arquery-title">¿Cómo jugar?</h2>
       <div class="game-arquery-instructions">
       <div>
       <p class="game-arquery-subtitle">Con el mouse:</p>
       <ul class="game-arquery-instruction-list">
              <li>Utiliza el mouse para apuntar entre las diferentes opciones.</li>
              <li>Dar clic para realizar el disparo.</li>
          </ul>
       </div>
       <div>
       <p class="game-arquery-subtitle">Con el teclado:</p>
        <ul class="game-arquery-instruction-list">
              <li>Utiliza la tecla TAB para apuntar entre las diferentes opciones.</li>
              <li>Presiona el ESPACIO para realizar el disparo.</li>
          </ul>
       </div>
       </div>
       <button class="game-arquery-button" id="start-button">Empezar el juego</button>
      </div>`;

    const startButton = document.getElementById('start-button') as HTMLButtonElement;
    startButton.addEventListener('click', () => {
      this.scene.start('MainScene', { questionIndex: this.questionIndex });
   
    });
  }
}
