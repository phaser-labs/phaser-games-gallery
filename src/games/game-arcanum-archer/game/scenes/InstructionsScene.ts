/* eslint-disable @typescript-eslint/no-explicit-any */
import Phaser from 'phaser';

import { globalState } from '../utils/GlobalState';

import '../utils/global.css';


interface InstructionContent {
  leftPanelHTML: string;
  rightPanelHTML: string;
}

const INSTRUCTION_DATA: Record<string, InstructionContent> = {
  manual: {
      leftPanelHTML: `
          <h1 class="game-arcanum-book-title" style="text-align: center;">Manual del Arquero</h1>
          <p class="game-arcanum-book-instructions">
              Bienvenido al Manual del Arquero. Aquí encontrarás todo lo que necesitas para saber como jugar.
          </p>
      `,
      rightPanelHTML: `
          <h1 class="game-arcanum-book-title" style="text-align: center;">Índice</h1>
          <ul class="game-arcanum-book-list">
              <li><button style="width: 80%" class="instruction-button" data-section="mouse" aria-label="Ver controles con ratón">¿Cómo jugar con el mouse?</button></li>
              <li><button style="width: 80%" class="instruction-button" data-section="teclado" aria-label="Ver controles con teclado">¿Cómo jugar con el teclado?</button></li>
          </ul>
      `
  },
  mouse: {
      leftPanelHTML: `
          <h1 class="game-arcanum-book-title" style="text-align: center;">Controles con Ratón</h1>
          <p class="game-arcanum-book-instructions">
              Apunta hacia el objetivo que creas que corresponde a la respuesta correcta, a la pregunta que te hace el profesor.
          </p>
      `,
      rightPanelHTML: `
         
          <img src="assets/game-arcanum-archer/images/Controls/mouse_left.png" alt="Controles del juego con mouse." class="game-arcanum-book-image">
          <ul class="game-arcanum-book-list">
              <li>Utiliza el mouse para apuntar.</li>
              <li>Mantiene presionado el mouse para cargar el disparo.</li>
              <li>Suelta el clic para disparar.</li>
          </ul>
          <button class="instruction-button" data-section="manual" aria-label="Volver al manual">Volver al Manual</button>
      `
  },
  teclado: {
      leftPanelHTML: `
          <h1 class="game-arcanum-book-title" style="text-align: center;">Controles con Teclado</h1>
          <ul class="game-arcanum-book-list">
            <li>Utiliza la tecla TAB para apuntar entre los diferentes target.</li>
              <li>Presiona la tecla CONTROL + ESPACIO para disparar.</li>
          </ul>
      `,
      rightPanelHTML: `
          
          <ul class="game-arcanum-book-list">
            
              <li>Si mantienes el ESPACIO cargarás el disparo.</li>
              <li>Suelta el ESPACIO para disparar.</li>
              <li>Si necesitas abrir el dialogo de ayuda presiona la tecla SHIFT + TAB</li>
          </ul>
          <button class="instruction-button" data-section="manual" aria-label="Volver al manual">Volver al Manual</button>
      `
  }
};

// Helper para la región ARIA Live
const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
};


export class Instructions extends Phaser.Scene {
  private backgroundImg!: Phaser.GameObjects.Image;
  private cursor!: Phaser.GameObjects.Image;

  private mouseEnterHandler?: () => void;
  private mouseLeaveHandler?: () => void;

  private dialogsData = globalState?.dialogs?.instruction?.tutorial?.text || [
    `¡Saludos, valiente aprendiz de arquero! Soy Althena, tu guía en el misterioso Reino Arcanum.
    En esta aventura, los sabios profesores te pondrán a prueba con sus preguntas.
    Cada respuesta correcta te dará pociones mágicas del conocimiento...`,
    `¡y con ellas te convertirás en el arquero más sabio del reino!
    Consulta siempre tu Manual del Arquero:
    Ahí encontrarás todos los secretos para apuntar y disparar.
    ¿Estás listo para tu primera lección?
    ¡El reino espera que te conviertas en un gran arquero!`
  ];
  private textParts: string[] = this.dialogsData;
  private currentPart: number = 0;
  private textElementAlthena: HTMLParagraphElement | null = null; // Renombrado para claridad
  private showMoreButtonAlthena: HTMLButtonElement | null = null; // Renombrado

  // --- Referencias a los contenedores DOM de las instrucciones ---
  private bookContainerDOM!: Phaser.GameObjects.DOMElement;    // Panel izquierdo
  private bookContainer2DOM!: Phaser.GameObjects.DOMElement;   // Panel derecho (menú/detalles)
  private althenaDialogDOM!: Phaser.GameObjects.DOMElement;    // Diálogo de Althena
  isMuted: boolean = false;
  volumeButton!: Phaser.GameObjects.Image;
  // --- Estado actual de la sección de instrucciones ---
  private activeSectionKey: string = 'manual'; // Sección inicial

  
   constructor() {
    super('InstructionsScene');
  }

  preload() {}

  create() {
    this.game.events.emit('hide-ui'); // Ocultar la UI para esta escena
    this.cameras.main.setBackgroundColor('#000');

    this.activeSectionKey = 'manual'; // Resetear a la sección inicial

    this.game.canvas.setAttribute('tabindex', '0');

    if (globalState.gameFinished) {
      const gameCanvas = this.sys.game.canvas;

      this.cursor = this.add.image(0, 0, 'cursor').setDepth(9999);
      this.cursor.setOrigin(0, 0).setScale(1.5);

      this.mouseEnterHandler = () => {
        this.cursor.setVisible(true);
      };

      this.mouseLeaveHandler = () => {
        this.cursor.setVisible(false);
      };

      gameCanvas.addEventListener('mouseenter', this.mouseEnterHandler);
      gameCanvas.addEventListener('mouseleave', this.mouseLeaveHandler);
    }
this.btnMusic(); // Botón de música
    // instrucciones dentro del libro
    this.backgroundImg = this.add.image(-58, 0, 'backgroundBook');
    this.backgroundImg.setOrigin(0, 0).setScale(0.54);

 // --- Crear los contenedores DOM ---
 this.bookContainerDOM = this.add.dom(50, 60, 'div').setOrigin(0, 0);
 (this.bookContainerDOM.node as HTMLDivElement).classList.add('game-arcanum-book-container', 'instructions-left-panel');

 this.bookContainer2DOM = this.add.dom(420, 60, 'div').setOrigin(0, 0);
 (this.bookContainer2DOM.node as HTMLDivElement).classList.add('game-arcanum-book-container', 'instructions-right-panel');

 // --- Renderizar contenido inicial y configurar listeners ---
 this.renderInstructionPanels();

 // --- Diálogo de Althena ---
 this.createAlthenaDialog(); // Asumo que esta función ya maneja su propio DOM

  }

  private renderInstructionPanels(): void {
    if (!this.bookContainerDOM?.node || !this.bookContainer2DOM?.node) {
        console.error("Contenedores de instrucciones no encontrados para renderizar.");
        return;
    }

    const leftPanelNode = this.bookContainerDOM.node as HTMLDivElement;
    const rightPanelNode = this.bookContainer2DOM.node as HTMLDivElement;

    const currentInstructionData = INSTRUCTION_DATA[this.activeSectionKey];

    if (!currentInstructionData) {
        console.error(`No se encontraron datos para la sección: ${this.activeSectionKey}`);
        leftPanelNode.innerHTML = "<p>Error: Contenido no disponible.</p>";
        rightPanelNode.innerHTML = ""; // Limpiar panel derecho
        return;
    }

    // Actualizar contenido de ambos paneles
    leftPanelNode.innerHTML = currentInstructionData.leftPanelHTML;
    rightPanelNode.innerHTML = currentInstructionData.rightPanelHTML;

    // --- Añadir listeners a los botones DENTRO de rightPanelNode DESPUÉS de actualizar innerHTML ---
    rightPanelNode.querySelectorAll('.instruction-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetButton = event.currentTarget as HTMLButtonElement;
            const sectionKey = targetButton.dataset.section; // Usamos data-section

            if (sectionKey && INSTRUCTION_DATA[sectionKey]) {
                this.activeSectionKey = sectionKey;
                this.renderInstructionPanels(); // Volver a renderizar TODO para actualizar ambos paneles y listeners
            } else {
                console.warn(`Sección no válida: ${sectionKey}`);
            }
        });
    });
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
  }
  private createAlthenaDialog(): void {
    // Destruir diálogo previo si existe
    if (this.althenaDialogDOM) {
        this.althenaDialogDOM.destroy();
    }

    this.althenaDialogDOM = this.add.dom(20, 450, 'div').setDepth(10).setOrigin(0, 0);
    const dialogContainerNode = this.althenaDialogDOM.node as HTMLDivElement;
    dialogContainerNode.classList.add('game-arcanum-dialog-container');

    dialogContainerNode.innerHTML = `
      <div class="game-arcanum-dialog-content">
        <img src="assets/game-arcanum-archer/images/Characters/r_BINe.png" alt="Personaje Althena." class="game-arcanum-book-image1">
        <div class="game-arcanum-book-text">
          <p style="margin-top:1rem;" id="althena-dialog-text" aria-live="polite"></p> 
        </div>
        <div aria-live="polite" class="game-arcanum-book-text2">
          <p>Profesora Althena</p>
        </div>
        <button id="althena-show-more-btn" aria-label="Continuar diálogo." class="game-arcanum-btn-more"><img src="https://img.icons8.com/?size=100&id=11759&format=png&color=3b2c29" width="35px" height="25px"></button>
        <button id="althena-closeDialog-btn" aria-label="Iniciar juego." class="game-arcanum-btn-continue" style="display:none;">Iniciar</button>
      </div>`;

    this.textElementAlthena = dialogContainerNode.querySelector('#althena-dialog-text') as HTMLParagraphElement;
    this.showMoreButtonAlthena = dialogContainerNode.querySelector('#althena-show-more-btn') as HTMLButtonElement;
    const closeButtonAlthena = dialogContainerNode.querySelector('#althena-closeDialog-btn') as HTMLButtonElement;

    if (!this.textElementAlthena || !this.showMoreButtonAlthena || !closeButtonAlthena) {
        console.error("Elementos del diálogo de Althena no encontrados después de la creación.");
        return;
    }
    this.currentPart = 0; // Resetear para el diálogo de Althena
    this.showAlthenaTextPart();

    this.showMoreButtonAlthena.addEventListener('click', () => {
      this.currentPart++;
      this.showAlthenaTextPart();
    });

    closeButtonAlthena.addEventListener('click', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('mapScene');
      });
    });
  }

  private showAlthenaTextPart(): void {
    if (!this.textElementAlthena || !this.showMoreButtonAlthena) return;
    this.textElementAlthena.textContent = this.textParts[this.currentPart];

    const closeButton = document.getElementById('althena-closeDialog-btn') as HTMLButtonElement;
    if (this.currentPart >= this.textParts.length - 1) {
      this.showMoreButtonAlthena.style.display = 'none';
      if (closeButton) closeButton.style.display = 'flex';
      announce(this.textParts[this.currentPart]);
    } else {
      this.showMoreButtonAlthena.style.display = 'flex';
      announce("Dialogo de la profesora Althena: " + this.textParts[this.currentPart]);
      
      if (closeButton) closeButton.style.display = 'none';
    }
  }

  private cleanupPreviousDOM(): void {
    // Destruye los contenedores principales si existen de una ejecución anterior
    if (this.bookContainerDOM) this.bookContainerDOM.destroy();
    if (this.bookContainer2DOM) this.bookContainer2DOM.destroy();
    if (this.althenaDialogDOM) this.althenaDialogDOM.destroy();

    this.bookContainerDOM = null as any;
    this.bookContainer2DOM = null as any;
    this.althenaDialogDOM = null as any;
    this.textElementAlthena = null;
    this.showMoreButtonAlthena = null;
    
  }

  shutdown() {
    this.cleanupPreviousDOM();

    if (this.mouseEnterHandler && this.sys.game.canvas) {
      this.sys.game.canvas.removeEventListener('mouseenter', this.mouseEnterHandler);
    }
    if (this.mouseLeaveHandler && this.sys.game.canvas) {
      this.sys.game.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }
    this.mouseEnterHandler = undefined;
    this.mouseLeaveHandler = undefined;
    this.shutdown();
  }


  update() {
    if (this.cursor && this.cursor.visible && this.input.activePointer) {
      this.cursor.setPosition(this.input.activePointer.x, this.input.activePointer.y);
    }
  }
}
