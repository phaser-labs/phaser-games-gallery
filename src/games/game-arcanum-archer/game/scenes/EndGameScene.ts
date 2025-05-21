import Phaser from "phaser";

import { globalState } from "../utils/GlobalState"; // Importa globalState

import '../utils/global.css';

// Helper para la región ARIA Live
const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
};
export class EndGame extends Phaser.Scene {
  private cursor!: Phaser.GameObjects.Image;
  private dialogsData = globalState?.dialogs?.endgame?.indication?.text || [`Oh, joven aprendiz… has superado cada reto y escuchado a todos nuestros maestros. ¡Bien hecho!
Confío en que hayas aprendido algo nuevo… o recordado lo esencial.
Recuerda: el verdadero poder está en el conocimiento.
Hasta la próxima, aprendiz.` ];
  private textParts: string[] = this.dialogsData;
  private currentPart: number = 0;
  private textElement: HTMLParagraphElement | null = null;
  private showMoreButton: HTMLButtonElement | null = null;
  private dialogElement?: Phaser.GameObjects.DOMElement;
  private titleElement?: Phaser.GameObjects.DOMElement;
  private mouseEnterHandler?: () => void;
  private mouseLeaveHandler?: () => void;


  constructor() {
    super("endGameScene");
  }

  preload() {}

  create() {
    this.game.events.emit('hide-ui'); // Ocultar la UI para esta escena
    this.cameras.main.setBackgroundColor("#000");
    this.add.image(0, 0, "backgroundEnd").setScale(0.8).setOrigin(0, 0);

    // --- Configuración del Cursor (igual que en MapScene) ---
    this.input.mouse?.disableContextMenu();
    this.input.setDefaultCursor('none');
    this.cursor = this.add.image(0, 0, 'cursor').setDepth(9999);
    // No necesitas setOrigin(0,0) si tu imagen de cursor ya está diseñada así
    this.cursor.setOrigin(0, 0).setScale(1.5); // Ajusta escala si es necesario
    this.cursor.setVisible(false); // Empezar oculto

    const gameCanvas = this.sys.game.canvas;
    this.mouseEnterHandler = () => this.cursor.setVisible(true);
    this.mouseLeaveHandler = () => this.cursor.setVisible(false);
    gameCanvas.addEventListener('mouseenter', this.mouseEnterHandler);
    gameCanvas.addEventListener('mouseleave', this.mouseLeaveHandler);
    // --- Fin Configuración Cursor ---

    // Diálogo
    this.createDialog();

    // Título - Guardar referencia
    this.titleElement = this.add.dom(250, 150, 'h1', null, '¡Has Ganado!')
        .setOrigin(0, 0); // Centrar título es más común

        announce("Has ganado"); // mensaje del announcer
    const titleNode = this.titleElement.node as HTMLHeadingElement;
    titleNode.classList.add('game-arcanum-map-title'); // Usa tu clase CSS

    // Escuchar UN solo clic en cualquier parte de la escena
    this.input.once('pointerdown', () => {

      // 1. Resetear el estado global
      globalState.resetForNewGame(); // Llama al método que creamos

      // 2. Iniciar transición a la escena del menú
      this.transitionToScene("menuScene"); 
    }, this); 

    // --- NUEVO: Fade In al entrar ---
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  shutdown() {

    // Limpiar título
    if (this.titleElement) {
        this.titleElement.destroy();
        this.titleElement = undefined;
    }
    // Limpiar diálogo
    if (this.dialogElement) {
       this.dialogElement.destroy();
       this.dialogElement = undefined;
    }
    // Limpiar referencias internas del diálogo
    this.textElement = null;
    this.showMoreButton = null;

    // Limpiar listeners del canvas
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

  private createDialog(): void {
    this.dialogElement = this.add.dom(20, 450, 'div').setDepth(10).setOrigin(0, 0);
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

    this.showTextPart();

    this.showMoreButton.addEventListener('click', () => {
      this.currentPart++;
      this.showTextPart();
    });
    closeButton.addEventListener('click', () => {
      if (this.dialogElement) {
          this.dialogElement.destroy();
          this.dialogElement = undefined;
      }
    });
  }

  private showTextPart(): void {
    // ... (tu código de showTextPart está bien) ...
    if (!this.textElement || !this.showMoreButton) return;
    if (!document.body.contains(this.textElement)) {
        console.warn("showTextPart called but textElement is not in DOM.");
        return;
    }
    this.textElement.textContent = this.textParts[this.currentPart];
    const closeButton = document.getElementById('close') as HTMLButtonElement;
    if (this.currentPart >= this.textParts.length - 1) {
      this.showMoreButton.style.display = 'none';
      if (closeButton) closeButton.style.display = 'block';
    } else {
      this.showMoreButton.style.display = 'flex';
      announce(this.textParts[this.currentPart]); // Anunciar el texto actual
      if (closeButton) closeButton.style.display = 'none';
    }
  }

  private transitionToScene(sceneKey: string) {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // shutdown() se llamará automáticamente antes de empezar la nueva escena
      this.scene.start(sceneKey);
    });
  }

  update() {
    // Actualizar cursor personalizado si está visible
    if (this.cursor && this.cursor.visible && this.input.activePointer) {
      this.cursor.setPosition(this.input.activePointer.x, this.input.activePointer.y);
    }
  }
}