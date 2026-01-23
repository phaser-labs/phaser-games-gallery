import Phaser from 'phaser';

import PhaserGame from '../main/main';
import { getCurrentThemeName, getCurrentThemeSounds } from '../utils/themeManager';

import '../styles/GameReorganize.css';

const announce = (message: string) => {
  const announcer = document.getElementById('game-reorganize-game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-reorganize-game-announcer not found in DOM.');
  }
};
export class InstructionScene extends Phaser.Scene {
  private dialogElement?: Phaser.GameObjects.DOMElement;
  private questionIndex!: number;
  private gameEvents!: Phaser.Events.EventEmitter;

   private ambientMusic?: Phaser.Sound.BaseSound;

  bg!: Phaser.GameObjects.Image;
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
       
        this.gameEvents.emit('phaserStartsGame'); 
        gameEvents.emit('preloadComplete');
        
        // Suscribirse a cambios de tema
        gameEvents.on('themeChanged', this.handleThemeChange, this);
    
    }
    }
  }
  create() {
    this.cameras.main.setBackgroundColor(0xffe3db);
    this.createBackground();

     this.playAmbientMusic(); // Reproducir música ambiental del tema

    const themeName = getCurrentThemeName().toLowerCase();

    const colorbgTheme = () => {
      if(themeName === 'universo') {
        return '#c04fca61';
      } else if (themeName === 'halloween') {
        return '#cd9ee617';
      } else if (themeName === 'cocina') {
        return '#ffe3dbba';
      } else {
        return '#ffe3dbba';
      }
    };

    const colortextTheme = () => {
      if(themeName === 'universo') {
        return '#fff';
      } else if (themeName === 'halloween') {
        return '#fff';
      } else if (themeName === 'cocina') {
        return '#000';
      } else {
        return '#000';
      }
    }
   
    // Configuración de la escena
    this.dialogElement = this.add.dom(0, 0, 'div').setDepth(10).setOrigin(0, 0); 
    const dialogContainer = this.dialogElement.node as HTMLDivElement;
    dialogContainer.classList.add('game-reorganize-instruction-container');
    dialogContainer.innerHTML = `
      <div class="game-reorganize-instruction-content" style="background-color: ${colorbgTheme()}">
          <div class="game-reorganize-game-logo" >
            <span class="game-reorganize-logo-icon">🎯</span>
            <h1 class="game-reorganize-game-title">Reorganiza Las Oraciones</h1>
          </div>
        
        <div class="game-reorganize-instruction-steps" style="color: ${colortextTheme()}">
          <div class="game-reorganize-step-card" id="step-card-1" tabindex="0">
            <div class="game-reorganize-step-number" >1</div>
            <div class="game-reorganize-step-content">
              <h3>Observa las palabras</h3>
              <p>Las palabras aparecerán desordenadas en la parte inferior</p>
              <div class="game-reorganize-step-visual">📝</div>
            </div>
          </div>
          
          <div class="game-reorganize-step-card" id="step-card-2" tabindex="0">
            <div class="game-reorganize-step-number">2</div>
            <div class="game-reorganize-step-content">
              <h3>Arrastra y organiza</h3>
              <p>Arrastra las palabras a la Zona de Respuesta en el orden correcto</p>
              <div class="game-reorganize-step-visual">🎯</div>
            </div>
          </div>
          
          <div class="game-reorganize-step-card" id="step-card-3" tabindex="0">
             <div class="game-reorganize-step-number">3</div>
             <div class="game-reorganize-step-content">
               <h3>Visualiza la oración</h3>
               <p>Presta atención a la Zona de Visualización puedes ver la oración que vas reorganizando</p>
               <div class="game-reorganize-step-visual">🔍</div>
             </div>
           </div>

             <div class="game-reorganize-step-card" id="step-card-4" tabindex="0">
             <div class="game-reorganize-step-number">4</div>
             <div class="game-reorganize-step-content">
               <h3>Verifica tu respuesta</h3>
               <p>Presiona el botón "Revisar" para comprobar si es correcto</p>
               <div class="game-reorganize-step-visual">✅</div>
             </div>
           </div>
        </div>
        
        <div class="game-reorganize-instruction-tips" style="color: ${colortextTheme()}">
          <h3>Consejos útiles:</h3>
          <ul>
            <li>Puedes reorganizar las palabras en la mesa de trabajo antes de llevarlas a la Zona de Respuesta</li>
            <li>Haz clic en una palabra dentro de la Zona de Respuesta para devolverla a la mesa</li>
            <li>Lee la oración completa antes de empezar</li>
            <li>Ten en cuenta el icono de tres puntos "..." que te ayudará a mover las palabras, enviar a la zona o sacar de la zona con el teclado</li> 
          </ul>
        </div>
        
        <div class="game-reorganize-instruction-footer">
          <button class="game-reorganize-start-game-button" id="start-button">
            <span class="game-reorganize-button-icon">🚀</span>
            <span class="game-reorganize-button-text">¡Comenzar a Jugar!</span>
          </button>
        </div>
      </div>`;
      

    const startButton = document.getElementById('start-button') as HTMLButtonElement;
    startButton.addEventListener('click', () => {
      this.scene.start('MainScene', { questionIndex: this.questionIndex });
     
    });

    startButton.addEventListener("mouseenter", () => {
      this.playHoverSound();
    })

    // Agregar sonido hover a cada step-card
    const stepCards = document.querySelectorAll('.game-reorganize-step-card');
    stepCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.playHoverSound();
      });
    });
  }

    // Método para reproducir sonido hover
  private playHoverSound() {
    try {
      const currentTheme = getCurrentThemeName().toLowerCase();
      const hoverSoundKey = `${currentTheme}-hover-sound`;
      
      // Reproducir el sonido hover del tema actual
      this.sound.play(hoverSoundKey, { volume: 0.02 });
    } catch (error) {
      console.warn('Error al reproducir hover sound:', error);
    }
  }

  // Handler para cambios de tema
  private handleThemeChange() {
    
    // Detener todos los sonidos antes de cambiar al nuevo tema
    this.sound.stopAll();
    
    // Cambiar la música ambiental al nuevo tema
    this.playAmbientMusic();
    
    // Actualizar el fondo
    this.createBackground();
  }

  // Método para reproducir música ambiental del tema actual
  private playAmbientMusic() {
    // Detener música anterior si existe
    if (this.ambientMusic) {
      this.ambientMusic.stop();
      this.ambientMusic.destroy();
    }

    // Obtener los sonidos del tema actual
    const themeSounds = getCurrentThemeSounds();
    const ambientMusicPath = themeSounds[0];

    if (ambientMusicPath) {
      // Crear la clave del sonido basada en el tema actual
      const currentTheme = getCurrentThemeName().toLowerCase();
      const soundKey = `${currentTheme}-ambient-music`;

      // Intentar crear el sonido directamente
      try {
        this.ambientMusic = this.sound.add(soundKey, {
          loop: true,
          volume: 0.1 // Volumen moderado para música ambiental
        });
        this.ambientMusic.play();
      } catch (error) {
        console.warn(`Error al reproducir sonido ambiental: ${soundKey}`, error);
      }
    } else {
      console.warn('No se encontró ambient-music en el tema actual');
    }
  }
  
  // Método shutdown para limpiar elementos DOM y listeners
  shutdown() {
    // Limpiar elementos DOM
    if (this.dialogElement) {
      this.dialogElement.destroy();
    }

     // Detener y limpiar música ambiental
    if (this.ambientMusic) {
      this.ambientMusic.stop();
      this.ambientMusic.destroy();
      this.ambientMusic = undefined;
    }
    
    
    // Limpiar referencias
    this.dialogElement = undefined;
  }
  
  private createBackground() {
    // Usar fondo dinámico basado en el tema actual
    const currentTheme = getCurrentThemeName().toLowerCase();
    const backgroundKey = `${currentTheme}-bg-instructions`;
    
    // Intentar cargar el fondo específico del tema, si no existe usar el genérico
    const textureExists = this.textures.exists(backgroundKey);
    const finalBackgroundKey = textureExists ? backgroundKey : 'bg-instructions';
    
    this.bg = this.add.image(0, 0, finalBackgroundKey).setOrigin(0, 0).setDepth(1);
    
    this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
  }
}
