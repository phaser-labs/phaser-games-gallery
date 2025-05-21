import Phaser from 'phaser';

import { globalState } from '../utils/GlobalState'; 

import '../utils/global.css'; 

export class UIScene extends Phaser.Scene {
    private uiContainerElement?: Phaser.GameObjects.DOMElement; 
    private potionCountSpan?: HTMLElement | null;
    private arrowCountSpan?: HTMLElement | null;

    // Variable para rastrear si la UI debe estar visible
    private isVisible: boolean = false;

    constructor() {
        super('UIScene');
    }

    create() {
        const uiHTML = `
            <div id="game-ui-container">
                <div class="ui-element" id="ui-arrows">
                    <img src='assets/game-arcanum-archer/images/Collects/Project_Archery_g5149.png' alt="Flechas:" class="ui-icon">
                          <span class="ui-label">X</span>
                    <span id="arrow-count" class="ui-value" aria-label="Flechas restantes">0</span>
                </div>
                <div class="ui-element" id="ui-potions">
                    <img src='assets/game-arcanum-archer/images/Collects/potion-violet.png' alt="Pociones:" class="ui-icon">
                    <span class="ui-label">X</span>
                    <span id="potion-count" class="ui-value" aria-label="Pociones obtenidas">0</span>
                </div>
            </div>
        `;

        try {
      
            // Posición inicial
            this.uiContainerElement = this.add.dom(10, 10).createFromHTML(uiHTML);
            this.uiContainerElement.setOrigin(0, 0); 
            this.uiContainerElement.setScrollFactor(0);
            this.uiContainerElement.setDepth(10000);

            // Ocultar la UI inicialmente
            this.uiContainerElement.setVisible(false);
            this.isVisible = false;

            // Obtener referencias a los spans dentro del contenedor DOM recién creado
            const containerNode = this.uiContainerElement.node as HTMLDivElement;
            this.potionCountSpan = containerNode.querySelector('#potion-count');
            this.arrowCountSpan = containerNode.querySelector('#arrow-count');

            // Verificar si se encontraron los spans
            if (!this.potionCountSpan) {
                console.error("UI Error: Span #potion-count not found in uiHTML.");
            }
            if (!this.arrowCountSpan) {
                console.error("UI Error: Span #arrow-count not found in uiHTML.");
            }

             // Actualizar los valores iniciales (aunque esté oculta)
             this.updateUI();

        } catch (error) {
            console.error("Error creating UI DOM Element:", error);
            // No configurar listeners si la creación falló
            return;
        }
        // --- Configurar Listeners de Eventos Globales ---

        // Escuchar eventos de otras escenas para actualizar los datos
        this.game.events.on('update-ui', this.updateUI, this);
        // Escuchar evento para MOSTRAR la UI (emitido desde las escenas de niveles)
        this.game.events.on('show-ui', this.showUI, this);
        // Escuchar evento para OCULTAR la UI (emitido desde mapa o fin de juego)
        this.game.events.on('hide-ui', this.hideUI, this);


        // --- Configurar Limpieza al Apagar la Escena UI ---

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            // Eliminar listeners de eventos globales
            this.game.events.off('update-ui', this.updateUI, this);
            this.game.events.off('show-ui', this.showUI, this);
            this.game.events.off('hide-ui', this.hideUI, this);

            // Limpiar referencias internas
            this.potionCountSpan = null;
            this.arrowCountSpan = null;

            // Destruir el elemento DOM si existe (Phaser a veces lo maneja, pero es bueno ser explícito)
            if (this.uiContainerElement && this.uiContainerElement.scene) {
                 this.uiContainerElement.destroy();
            }
            this.uiContainerElement = undefined; // Limpiar referencia
        });
    }
    showUI() {
   
        if (this.uiContainerElement && !this.isVisible) {
            this.uiContainerElement.setVisible(true);
            this.isVisible = true;
        } else if (!this.uiContainerElement) {
            console.warn("Attempted to show UI, but uiContainerElement does not exist.");
        }
    }
    hideUI() {
      
        if (this.uiContainerElement && this.isVisible) {
            this.uiContainerElement.setVisible(false);
            this.isVisible = false;
        } else if (!this.uiContainerElement) {
             console.warn("Attempted to hide UI, but uiContainerElement does not exist.");
        }
    }

    updateUI() {
        // Verificar que las referencias a los spans existan antes de actualizar
        if (this.potionCountSpan) {
            // Actualizar solo el número
            this.potionCountSpan.textContent = globalState.potions.toString();
        }
        if (this.arrowCountSpan) {
            // Actualizar solo el número de flechas disponibles
            this.arrowCountSpan.textContent = globalState.availableArrows.toString();
        }
    }
}