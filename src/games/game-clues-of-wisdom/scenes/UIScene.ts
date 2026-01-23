/* eslint-disable @typescript-eslint/no-explicit-any */
import Phaser from 'phaser';

import { PLAYER_HEALTH_CHANGED_EVENT } from '../gameObjects/Player'; // Asumo que este evento viene de Player
import { WordData } from '../utils/types'; // Asegúrate que esta ruta sea correcta

import "../styles/gamePistas.css";

export class UIScene extends Phaser.Scene {
  originalTargetWords: WordData[] = []; // Para mantener el orden original de las palabras objetivo del nivel
  private promptStructure: { text: string; isTarget: boolean; index: number }[] = []; 

  // --- HUD de Salud
  private hudSprite!: Phaser.GameObjects.Sprite;
  private currentHealth: number = 3;
  private currentPlayerMaxHealth: number = 3;

  // --- HUD de Frase/Palabras
  private promptTextDisplay!: Phaser.GameObjects.DOMElement;
 currentPromptText: string = '';
  private currentFoundWords: WordData[] = [];
  private feedbackTextDisplay!: Phaser.GameObjects.Text;

  // --- HUD para volver al menu
  private menuButtonDOMElement!: Phaser.GameObjects.DOMElement;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { promptText?: string, targetWordsCount?: number, levelId?: string, allWordsForLevel?: WordData[] }): void {
    this.currentPromptText = data.promptText || "Cargando frase...";
    // Guardar las palabras objetivo originales del nivel en su orden correcto
    this.originalTargetWords = data.allWordsForLevel?.filter(word => word.isTarget) || [];
    this.currentFoundWords = [];

    // Nueva estructura: cada palabra con su índice y si es objetivo
    this.promptStructure = (data.allWordsForLevel || []).map((word, idx) => ({
        text: word.text,
        isTarget: word.isTarget,
        index: idx
    }));

    if (this.feedbackTextDisplay) {
        this.feedbackTextDisplay.setText('');
    }
}

  create(): void {
    // --- HUD de Salud ---
    this.currentHealth = (this.scene.get('Play') as any)?.player?.health || this.currentPlayerMaxHealth; 
    this.currentPlayerMaxHealth = (this.scene.get('Play') as any)?.player?.maxHealth || 3;

    const initialHealthFrame = `hud/hud-${Math.max(1, this.currentHealth + 1)}`;
    this.hudSprite = this.add
      .sprite(75, 30, 'atlas', initialHealthFrame) 
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setScale(2.4)
      .setDepth(100);
   
     const promptDiv = document.createElement('div');
     promptDiv.className = 'prompt-text-display'; 
     promptDiv.innerText = this.formatPromptText();
 
     this.promptTextDisplay = this.add.dom(
         this.cameras.main.width / 2 ,
         60,
         promptDiv
     ).setOrigin(0.5, 0);

     // --- HUB para volver al menu
 this.menuButtonDOMElement = this.add.dom(
        this.cameras.main.width - 45, 
        30,
        'button'
    )
    .setScrollFactor(0)
    .setOrigin(0.5, 0.5)
    .setDepth(110);

    const backMenuBtnNode = this.menuButtonDOMElement.node as HTMLButtonElement;
    backMenuBtnNode.classList.add('game-clues-button-back-menu');
    backMenuBtnNode.setAttribute('aria-label', 'Volver al Menú Principal');

    this.menuButtonDOMElement.addListener('click'); 
    this.menuButtonDOMElement.on('click', () => {
        this.sound.play('click', { volume: 0.5 });
        // se emite el evento
        this.events.emit('goToMenu');
        // se detiene la escena
        this.scene.stop();
    });

    // --- Escuchar Eventos ---
    const playScene = this.scene.get('Play');

    this.game.events.on(PLAYER_HEALTH_CHANGED_EVENT, this.updateHealthHud, this);

    // Escuchar evento de palabra encontrada desde PlayScene
    this.events.on('wordCollected', (_: unknown, allCurrentlyFoundWords: WordData[]) => {
        this.currentFoundWords = allCurrentlyFoundWords;
        // Actualiza el innerText del div DOM
        const promptDiv = this.promptTextDisplay.node as HTMLDivElement;
        promptDiv.innerText = this.formatPromptText();

        // --- Animación tipo modal ---
        promptDiv.classList.remove('prompt-pop-in'); // Reinicia si ya estaba
        // Forzar reflow para reiniciar la animación si se repite rápido
         
        void promptDiv.offsetWidth;
        promptDiv.classList.add('prompt-pop-in');

        setTimeout(() => {
          promptDiv.classList.remove('prompt-pop-in');
        }, 5000);
    }, this);

    // Escuchar evento de frase completada DESDE PLAYSCENE
    playScene.events.on('sentenceComplete', () => {
        this.add.text(
            this.cameras.main.width / 2,
            this.promptTextDisplay.y + this.promptTextDisplay.height + 20, // Debajo del prompt
            '¡Frase completada! 🎉',
            {
                fontFamily: 'CluesOfWisdom',
                fontSize: '24px',
                color: '#00ff00', // Verde para éxito
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5, 0)
         .setScrollFactor(0)
         .setDepth(100);
    }, this);

    // Mostrar mensaje introductorio al inicio
    this.showIntroMessage();
  }

  // Método para mostrar mensaje introductorio
  private showIntroMessage(): void {
    const promptText = this.currentPromptText;
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Crear un rectángulo de fondo oscuro semi-transparente
    const overlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    )
    .setScrollFactor(0)
    .setDepth(1000)
    .setAlpha(0);

    // Crear el texto del mensaje
    const messageText = this.add.text(
      centerX,
      centerY,
      promptText,
      {
        fontFamily: 'CluesOfWisdom',
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: this.cameras.main.width - 100 }
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1001)
    .setAlpha(0);

    // Animación de aparición
    this.tweens.add({
      targets: [overlay, messageText],
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        // Después de 4 segundos, desvanecer
        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: [overlay, messageText],
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
              overlay.destroy();
              messageText.destroy();
            }
          });
        });
      }
    });
  }

  private formatPromptText(_currentPromptText?: string, currentlyFoundWords?: WordData[]): string {
    const wordsToFill = currentlyFoundWords || this.currentFoundWords;
   
    const foundSet = new Set(wordsToFill.filter(w => w.isTarget).map(w => w.text));

    // Reconstruir la frase palabra por palabra
    const displayWords = this.promptStructure.map(wordObj => {
        if (wordObj.isTarget) {
            // Si la palabra objetivo ya fue encontrada, mostrarla; si no, mostrar "____"
            return foundSet.has(wordObj.text) ? wordObj.text : "____";
        } else {
            // Palabra fija, siempre mostrarla
            return wordObj.text;
        }
    });

    // Unir las palabras con espacios
    return displayWords.join(' ');
}

  private updateHealthHud = (newHealth: number, maxHealth: number): void => {
    this.currentHealth = newHealth;
    this.currentPlayerMaxHealth = maxHealth; 
    const frameNumber = Math.max(1, newHealth + 1); 
    const frameName = `hud/hud-${frameNumber}`;

    if (this.hudSprite && this.textures.get('atlas')?.has(frameName)) {
      this.hudSprite.setFrame(frameName);
    } else {
        console.warn(`UIScene: Frame del HUD '${frameName}' no encontrado.`);
    }
  };

  shutdown(): void {
    // Limpiar listeners de eventos para evitar fugas de memoria si la escena se destruye y se recrea
    this.game.events.off(PLAYER_HEALTH_CHANGED_EVENT, this.updateHealthHud, this);

    const playScene = this.scene.get('Play');
    if (playScene) {
        playScene.events.off('wordCollected', undefined, this);
        playScene.events.off('sentenceComplete', undefined, this);
    }

    // Destruir elementos de la UI
    if (this.hudSprite) {
      this.hudSprite.destroy();
    }
    if (this.promptTextDisplay) {
      this.promptTextDisplay.destroy();
    }
    if (this.menuButtonDOMElement) {
      this.menuButtonDOMElement.destroy();
    }
    if (this.feedbackTextDisplay) {
      this.feedbackTextDisplay.destroy();
    }

    console.log("UIScene shutdown");
  }

  destroy(): void {
    if (this.hudSprite) {
      this.hudSprite.destroy();
    }
    if (this.promptTextDisplay) {
      this.promptTextDisplay.destroy();
    }
    if (this.menuButtonDOMElement) {
      this.menuButtonDOMElement.destroy();
    }
    if (this.feedbackTextDisplay) {
      this.feedbackTextDisplay.destroy();
    }
    console.log("UIScene destroy");
  }
}