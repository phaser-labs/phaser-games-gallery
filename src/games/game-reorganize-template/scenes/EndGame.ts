import Phaser from 'phaser';

import PhaserGame from '../main/main';
import { getCurrentThemeName } from '../utils/themeManager';

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
    this.cameras.main.setBackgroundColor(0xffe3db);
  
    this.sound.play('endGame', {
      loop: false,
      volume: 0.03
    });
    // Usar fondo dinámico basado en el tema actual
    const currentTheme = getCurrentThemeName().toLowerCase();
    const backgroundKey = `${currentTheme}-bg-instructions`;
    
    // Intentar cargar el fondo específico del tema, si no existe usar el genérico
    const textureExists = this.textures.exists(backgroundKey);
    const finalBackgroundKey = textureExists ? backgroundKey : 'bg-instructions';
    
    this.backgroundEndGame = this.add.image(0, 0, finalBackgroundKey).setOrigin(0, 0);
    this.backgroundEndGame.displayWidth = this.cameras.main.width;
    this.backgroundEndGame.displayHeight = this.cameras.main.height;
    this.backgroundEndGame.setDepth(10);
    

    const endScreen = this.add.dom(0,0, 'div',).setOrigin(0, 0);
    endScreen.node.classList.add('game-reorganize-end-screen-content');
    endScreen.node.innerHTML = `
    <div>
     <h2 class="game-reorganize-end-screen-title">FIN DEL JUEGO</h2>
     <span>🤓☝️</span>
     <button class="game-reorganize-end-screen-btn" id="btn-reset">Volver a jugar</button>
    </div>
    `;

    // Agregar event listener al botón de reset
    const resetButton = endScreen.node.querySelector('#btn-reset') as HTMLButtonElement;
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.gameEvents.emit('restartGame'); // Notificar a React
        this.scene.start('Preload');

        this.sound.stopAll();
      });
      resetButton.addEventListener("mouseenter", () => {
        this.playHoverSound();
      })
    }
  }
     // Método para reproducir sonido hover
  private playHoverSound() {
    try {
      const currentTheme = getCurrentThemeName().toLowerCase();
      const hoverSoundKey = `${currentTheme}-hover-sound`;
      
      // Reproducir el sonido hover del tema actual
      this.sound.play(hoverSoundKey, { volume: 0.1 });
    } catch (error) {
      console.warn('Error al reproducir hover sound:', error);
    }
  }

  // Método shutdown para limpiar elementos DOM y listeners
  shutdown() {
    // Limpiar elementos DOM
    const endScreenElements = document.querySelectorAll('.game-reorganize-end-screen-content');
    endScreenElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    // Limpiar referencias
    this.backgroundEndGame = undefined as any;
  }
}
