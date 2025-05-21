import Phaser from 'phaser';

import { globalState } from '../utils/GlobalState';

import '../utils/global.css';

// --- Definiciones (LEVEL_DATA, FINAL_SCENE_KEY) como antes ---
const LEVEL_DATA = [
  // Asegúrate de que estas coordenadas son donde REALMENTE quieres los CENTROS de los botones
  { id: 'level-1', scene: 'gameLevel1Scene', x: 140, y: 120 },
  { id: 'level-2', scene: 'gameLevel2Scene', x: 650, y: 60 },
  { id: 'level-3', scene: 'gameLevel3Scene', x: 460, y: 420 },
  { id: 'level-4', scene: 'gameLevel4Scene', x: 150, y: 370 },
  { id: 'level-5', scene: 'gameLevel5Scene', x: 440, y: 240 },
];
const FINAL_SCENE_KEY = 'endGameScene';


const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
};


export class LevelMapScene extends Phaser.Scene {
  private backgroundImg!: Phaser.GameObjects.Image;
  private dialogsData = globalState?.dialogs?.map?.indication?.text || [ `Este es el mapa de nuestro Reino Arcanum, aprendiz de arquero. Para enfrentar 
        los desafíos de nuestros profesores, selecciona uno de los pergaminos haciendo clic sobre él. Prepara 
        bien tu arco y asegúrate de tener flechas suficientes. ¡Ja!
        ¡Buena suerte!` ];
  private textParts: string[] = this.dialogsData;
  private currentPart: number = 0;
  private textElement: HTMLParagraphElement | null = null;
  private showMoreButton: HTMLButtonElement | null = null;
  private cursor!: Phaser.GameObjects.Image;

    isMuted: boolean = false;
    volumeButton!: Phaser.GameObjects.Image;

  // Usaremos un Map para rastrear los Phaser DOM Elements
  private levelButtons: Map<string, Phaser.GameObjects.DOMElement> = new Map();
  // --- NUEVO: Para rastrear el contenedor del diálogo ---
  private dialogElement?: Phaser.GameObjects.DOMElement;


  private mouseEnterHandler?: () => void;
  private mouseLeaveHandler?: () => void;

  constructor() {
    super('mapScene');
  }

  preload() {

  }

  create() {
    this.btnMusic(); // Botón de música
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene'); // <-- UIScene.create() se ejecuta AHORA
  } else {
      this.scene.bringToTop('UIScene');
  }
    this.game.events.emit('hide-ui'); // Ocultar la UI para esta escena
    
    this.game.canvas.setAttribute('tabindex', '0'); 
    this.levelButtons.clear();

    if (this.dialogElement) {
        this.dialogElement.destroy(); // Destruye el DOM element previo si existe
        this.dialogElement = undefined;
    }


    this.cameras.main.setBackgroundColor('#1a110e');
    this.backgroundImg = this.add.image(0, 20, 'backgroundMap');
    this.backgroundImg.setOrigin(0, 0).setScale(0.6);
    this.input.mouse?.disableContextMenu();
    this.input.setDefaultCursor('none');
    this.cursor = this.add.image(0, 0, 'cursor').setDepth(9999);
    this.cursor.setOrigin(0, 0).setScale(1.5);

    const gameCanvas = this.sys.game.canvas; 

    this.mouseEnterHandler = () => {
      this.cursor.setVisible(true);
  };

 
  this.mouseLeaveHandler = () => {
      this.cursor.setVisible(false);
  };

  // Añadir los listeners al elemento canvas
  gameCanvas.addEventListener('mouseenter', this.mouseEnterHandler);
  gameCanvas.addEventListener('mouseleave', this.mouseLeaveHandler);

    // Titulo del reino
    const textTitle = this.add.dom(350, 70, 'h1', null, 'Reino Arcanum').setOrigin(0.5, 0.5);
    const title = textTitle.node as HTMLDivElement;
    title.classList.add('game-arcanum-map-title');
    this.levelButtons.set('title', textTitle);

    // Diálogo
    this.createDialog(); 

    // Botones de niveles
    this.createLevelButtons();

    // Comprobar si el juego está completado
    this.checkGameCompletion();

  }
  private btnMusic() {
    const isCurrentlyMuted = this.sound.mute;
    const initialTexture = isCurrentlyMuted ? 'mute' : 'sound';
    this.volumeButton = this.add.image(750, 50, initialTexture).setInteractive().setDepth(100000);
    this.isMuted = isCurrentlyMuted;
  
    this.volumeButton.on('pointerdown', () => {
      this.isMuted = !this.isMuted;
      this.sound.mute = this.isMuted;
      const newTexture = this.isMuted ? 'mute' : 'sound';
      this.volumeButton.setTexture(newTexture);
      const message = this.isMuted ? 'Música desactivada' : 'Música activada';
      announce(message);
    });

    const btnBack = this.add.image(50, 50, 'menuIcon').setInteractive().setDepth(100000);
    btnBack.on('pointerdown', () => {

      this.transitionToScene('InstructionsScene');
      this.game.events.emit('hide-ui'); // Ocultar la UI al salir de la escena
      this.shutdown(); // Llamar a shutdown para limpiar la escena
    });
  }
  shutdown() {
 announce(''); // Limpiar el mensaje del announcer

    // Destruir y eliminar todos los botones de nivel del DOM
    this.levelButtons.forEach((btn) => {
      btn.destroy();
    });
    this.levelButtons.clear();

    // Destruir el diálogo si existe
    if (this.dialogElement) {
       this.dialogElement.destroy();
       this.dialogElement = undefined;
    }
    this.textElement = null;
    this.showMoreButton = null;

    const gameCanvas = this.sys.game.canvas;
        if (this.mouseEnterHandler) {
            gameCanvas.removeEventListener('mouseenter', this.mouseEnterHandler);
             this.mouseEnterHandler = undefined;
        }
        if (this.mouseLeaveHandler) {
            gameCanvas.removeEventListener('mouseleave', this.mouseLeaveHandler);
             this.mouseLeaveHandler = undefined;
        }
 }


  private createLevelButtons(): void {
    LEVEL_DATA.forEach((levelInfo, index) => {
      const { id, scene, x, y } = levelInfo;
      const previousLevelId = index > 0 ? LEVEL_DATA[index - 1].id : null;
      this.createLevelButton(x, y, id, scene, previousLevelId);
    });
  }

  private createLevelButton(x: number, y: number, levelId: string, sceneKey: string, previousLevelId: string | null): void {
 
    // Comprueba si ya existe un botón con este ID en el DOM 
    const existingElement = document.getElementById(levelId);
    if (existingElement) {
        console.warn(`Element with ID ${levelId} already exists before creation. Removing old one.`);
        existingElement.remove();
    }

    // Crear el DOM Element
    const btn = this.add.dom(x, y, 'button');
    const buttonElement = btn.node as HTMLButtonElement;
    buttonElement.id = levelId; // Se le asigna el ID

    let levelState: 'locked' | 'unlocked' | 'completed' = 'locked';
    const isCompleted = globalState.completedLevels.includes(levelId);
    const isFirstLevel = previousLevelId === null;
    const isPreviousCompleted = previousLevelId !== null && globalState.completedLevels.includes(previousLevelId);

    if (isCompleted) {
      levelState = 'completed';
    } else if (isFirstLevel || isPreviousCompleted) {
      levelState = 'unlocked';
    } else {
      levelState = 'locked';
    }

    buttonElement.className = '';
    buttonElement.classList.add('game-arcanum-btn-level-base');

    switch (levelState) {
      case 'completed':
        buttonElement.classList.add('game-arcanum-btn-level-completed');
        buttonElement.ariaLabel = 'nivel completado';
        buttonElement.disabled = true;
        break;
      case 'unlocked':
        buttonElement.classList.add('game-arcanum-btn-level-unlocked');
        buttonElement.ariaLabel = 'nivel desbloqueado, da clic para jugar';
        buttonElement.disabled = false; // Asegurarse que no está deshabilitado
        buttonElement.addEventListener('click', () => {
          if (buttonElement.disabled) return; // Doble chequeo
          this.transitionToScene(sceneKey);
        }, { once: true });
        break;
      case 'locked':
        buttonElement.ariaLabel = 'nivel bloqueado, elige un nivel anterior';
        buttonElement.classList.add('game-arcanum-btn-level-locked');
        buttonElement.disabled = true;
        break;
    }
    this.levelButtons.set(levelId, btn);
  }

  private checkGameCompletion(): void {
    const totalLevels = LEVEL_DATA.length;
    const completedCount = globalState.completedLevels.length;

    const allLevelsDefinedAreComplete = LEVEL_DATA.every(level =>
        globalState.completedLevels.includes(level.id)
    );

    if (allLevelsDefinedAreComplete && completedCount >= totalLevels && totalLevels > 0) {
      globalState.gameFinished = true; // Cambia el estado del juego a terminado
      announce("Has completado todos los niveles!"); // Limpiar el mensaje del announcer
      this.time.delayedCall(1500, () => {
        if (this.scene.isActive('mapScene')) { 
             this.transitionToScene(FINAL_SCENE_KEY);
        }
      });
    }
  }

  private createDialog(): void {
    
    this.dialogElement = this.add.dom(20, 450, 'div').setDepth(10).setOrigin(0, 0); // Guardar referencia
    const dialogContainer = this.dialogElement.node as HTMLDivElement;
    dialogContainer.classList.add('game-arcanum-dialog-container');
    dialogContainer.innerHTML = `
      <div class="game-arcanum-dialog-content">
        <img src="assets/game-arcanum-archer/images/Characters/r_BINe.png" alt="Personaje Althena." class="game-arcanum-book-image1">
        <div class="game-arcanum-book-text">
          <p id="dialog-text2"></p>
        </div>
        <div class="game-arcanum-book-text2">
          <p>Profesora Althena</p>
        </div>
        <button id="show-more-btn" aria-label="botón para continuar el dialogo." class="game-arcanum-btn-more"><img src="https://img.icons8.com/?size=100&id=11759&format=png&color=3b2c29" width="35px" height="25px"></button>
        <button id="close" aria-label="botón para cerrar dialogo." class="game-arcanum-btn-close" style="display:none;"></button>
      </div>`;

    this.textElement = dialogContainer.querySelector('#dialog-text2') as HTMLParagraphElement;
    this.showMoreButton = dialogContainer.querySelector('#show-more-btn') as HTMLButtonElement;
    const closeButton = dialogContainer.querySelector('#close') as HTMLButtonElement;

    this.showTextPart(); // Mostrar primera parte

    this.showMoreButton.addEventListener('click', () => {
      this.currentPart++;
      this.showTextPart();
    });
    closeButton.addEventListener('click', () => {
      if (this.dialogElement) {
          this.dialogElement.destroy(); // Destruir al cerrar
          this.dialogElement = undefined;
      }
    });
  }

  private showTextPart(): void {
    if (!this.textElement || !this.showMoreButton) return;
    // Asegurarse que el nodo aún existe en el DOM antes de modificarlo
    if (!document.body.contains(this.textElement)) {
        console.warn("showTextPart called but textElement is not in DOM.");
        return;
    }

    this.textElement.textContent = this.textParts[this.currentPart];
    const closeButton = document.getElementById('close') as HTMLButtonElement;
    if (this.currentPart >= this.textParts.length - 1) {
      this.showMoreButton.style.display = 'none';
      announce("Dialogo de la profesora Althena: " + this.textParts[this.currentPart]);
      if (closeButton) closeButton.style.display = 'block';
    } else {
      this.showMoreButton.style.display = 'flex';
      
      if (closeButton) closeButton.style.display = 'none';
    }
  }

  private transitionToScene(sceneKey: string) {

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    
      this.scene.start(sceneKey);
    });
  }

  update() {
    if (this.cursor && this.cursor.visible && this.input.activePointer) {
      this.cursor.setPosition(this.input.activePointer.x, this.input.activePointer.y);
  }
  }
}