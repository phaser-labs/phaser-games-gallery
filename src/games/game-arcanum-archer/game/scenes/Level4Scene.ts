
import Phaser from 'phaser';

import { globalState } from '../utils/GlobalState';

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

export class Level4 extends Phaser.Scene {
  // Variables de la escena
  private bgScene!: Phaser.GameObjects.Image;
  private crosshair!: Phaser.GameObjects.Image;
  private bow!: Phaser.GameObjects.Image;
  private loadedArrow!: Phaser.GameObjects.Image;
  private trajectoryLine!: Phaser.GameObjects.Graphics;
  private isDrawingTrajectory: boolean = false;
  private currentLevelKey: string = 'level4';

  // Sistema de disparo
  private isCharging: boolean = false;
  private chargeTime: number = 0;
  private maxChargeTime: number = 1000;
  private minPower: number = 300;
  private maxPower: number = 800;
  private baseBowScale: number = 0.6;

  //Pool de flechas
  private arrowPool!: Phaser.GameObjects.Group;
  private levelMaxArrows: number = 5; // <-- SE DEFINE CUÁNTOS DISPAROS TIENE EL JUGADOR

  //Sonidos
  private shootSound!: Phaser.Sound.BaseSound;
  private reloadSound!: Phaser.Sound.BaseSound;

  //Dialogos
  private dialogsData = globalState?.dialogs?.Level4?.question?.text || [
    `H-hola, perdón, es que…
Me llamo Camille. Soy profesora aquí... Aunque muchos dicen que enseño con el corazón más que con palabras.
T-te haré una preguntita.
Si la respondes, te daré mi Poción de la Comprensión.
Es para que entiendas mejor a los demás… y a ti también. 🫖 +1`
  ];
  private textParts: string[] = this.dialogsData;
  private currentPart: number = 0;
  private textElement: HTMLParagraphElement | null = null;
  private showMoreButton: HTMLButtonElement | null = null;

  private bgDialog!: Phaser.GameObjects.DOMElement;
  private dialogContainer!: HTMLDivElement;
  private dialogHTML!: string; // Para guardar el HTML original

  private openButton!: Phaser.GameObjects.DOMElement; // Botón para abrir el diálogo

  // Variables para el manejo de advertencias
  private isWarningActive: boolean = false; // Para evitar múltiples advertencias del warning de flechas

  // Variables para Accesibilidad
  private focusedTargetIndex: number = -1; // -1 = ninguno, 0 = primer target
  private keyboardFocusIndicator!: Phaser.GameObjects.Graphics; // Indicador visual
  private keyboardChargeSource: boolean = false; // Para saber si la carga fue iniciada por teclado
  private previouslyFocusedElement: HTMLElement | null = null; // Para restaurar foco al cerrar diálogos
  private isDialogActive: boolean = false; // Para controlar el flujo de input

event?: KeyboardEvent; // Para manejar eventos personalizados, puede ser undefined
 isMuted: boolean = false;
    volumeButton!: Phaser.GameObjects.Image;
  constructor() {
    super('gameLevel4Scene');
  }

  preload() {}

  init() {
    // Inicializar el estado del juego
    this.game.events.emit('show-ui'); // Mostrar la UI para esta escena
    this.game.canvas.setAttribute('tabindex', '0'); // Permitir que el canvas reciba foco

    // Iniciar el estado de flechas
    globalState.maxArrows = this.levelMaxArrows;
    globalState.availableArrows = this.levelMaxArrows;

    announce(`Nivel iniciado con ${globalState.maxArrows} flechas.`);
  }

  create() {
    this.init(); // Llamar a la función init para inicializar el estado del juego
     this.btnMusic(); // Botón de música
    // --- Reiniciar estado al crear la escena ---
    this.focusedTargetIndex = -1; // Asegurar que no hay foco inicial
    this.keyboardChargeSource = false;
    this.previouslyFocusedElement = null;
    this.isDialogActive = false; // Dialogo no activo al inicio
    this.isWarningActive = false; // Reiniciar estado de advertencia

    // Asegurarse de que las referencias DOM se limpian si la escena se reinicia
    if (this.bgDialog) this.bgDialog.destroy();
    this.bgDialog = null as unknown as Phaser.GameObjects.DOMElement;
    this.dialogContainer = null as unknown as HTMLDivElement;
    this.currentPart = 0;

    // Configuración inicial
    this.bgScene = this.add.image(0, -10, 'background-4');
    this.bgScene.setOrigin(0, 0).setScale(0.4);
    this.input.mouse?.disableContextMenu();

    // this.input.setDefaultCursor("none");

    // --- Hacer el Canvas Focuseable ---
    this.game.canvas.setAttribute('tabindex', '0'); // Permite recibir foco con Tab

    // Sonidos
    this.shootSound = this.sound.add('shoot');
    this.reloadSound = this.sound.add('reload');

    // Mirilla
    this.crosshair = this.add.image(0, 0, 'crosshair').setDepth(9999).setScale(0.5);

    // Ocultar mirilla si no se usa el ratón (se mostrará en pointermove)
    this.crosshair.setVisible(false);
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.crosshair.setPosition(pointer.x, pointer.y).setVisible(true);
      // Si el puntero está dentro de la escena, mostrar la mirilla
    });
    this.input.on('pointerover', () => this.crosshair.setVisible(true));

    // dialogo

    // Llamar a la función para agregar la pregunta al array
    this.addQuestionToDialogs();
    this.textParts = [...this.dialogsData]; // Copia de seguridad del texto original

    this.dialogHTML = `
      <div id="level4-dialog-content" class="game-arcanum-dialog-content" role="dialog" aria-modal="true" aria-labelledby="level4-dialog-title" aria-describedby="dialog-text2">
      <img src="assets/game-arcanum-archer/images/Characters/z86KPD.png" alt="Ilustración del Profesora Camille." class="game-arcanum-book-image1">
      <div class="game-arcanum-book-text">
        <p id="dialog-text2" class="lastText"></p>
       </div>
        <div class="game-arcanum-book-text2" style="top: -30%;">
        <p id="level4-dialog-title">Profesora Camille</p>
        </div>
        <button id="show-more-btn" aria-label="Continuar diálogo." class="game-arcanum-btn-more"><img alt="" src="https://img.icons8.com/?size=100&id=11759&format=png&color=3b2c29" width="35px" heigth="25px"></button>
        <button id="close" aria-label="Cerrar diálogo." class="game-arcanum-btn-close" ></button>
      </div>`;

    // Crear diálogo inicial
    this.createDialog();

    // Botón para abrir el diálogo
    this.openButton = this.add
      .dom(300, 514)
      .createFromHTML(
        `
    <button id="open-dialog-button" class="game-arcanum-btn-open hidden" aria-label="Abrir diálogo del Profesora Camille.">
        Abrir Diálogo
    </button>
`
      )
      .setOrigin(0.5, 0.5);

    const openButtonElement = this.openButton.node.querySelector('#open-dialog-button') as HTMLButtonElement;

    if (openButtonElement) {
      this.openButton.addListener('click').on('click', () => {
        if (this.isDialogActive) return; // Evitar abrir si ya está abierto
        this.currentPart = 0; // Reiniciar al texto inicial
        this.recreateDialog();
        openButtonElement.classList.add('hidden'); // Ocultar el botón después de abrir
      });
    } else {
      console.error('Open dialog button element not found');
    }

    // === CREACION DE TARGETS Y APLICAR ANIMACIÓN INICIAL

 
    if (!this.anims.exists('rabbit-walk')) {
      this.anims.create({
        key: 'rabbit-walk',
        frames: this.anims.generateFrameNumbers('rabbitTarget', {
          frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        }),
        frameRate: 2,
        repeat: -1
      });
    }

    if (!this.anims.exists('bird-fly')) {
      this.anims.create({
        key: 'bird-fly',
        frames: this.anims.generateFrameNumbers('birdTarget', {
          frames: [9, 10, 11]
        }),
        frameRate: 5,
        repeat: -1
      });
    }


    globalState.targets = []; // Limpiar targets anteriores

    // Encuentra la pregunta del nivel 4 ANTES de crear los targets
    const level4QuestionData = globalState.questions.find((q) => q.id === 'level-4');
    // Valida que la pregunta exista y tenga opciones
    if (!level4QuestionData || !level4QuestionData.options || level4QuestionData.options.length < 4) {
      console.error('¡Datos de la pregunta del Nivel 4 no encontrados o incompletos!');
      return; // Detener la creación si faltan datos
    }

    // Define las posiciones y ASOCIA explícitamente el índice de la opción
    const targetsPositions = [
      {
        x: 146,
        y: 320,
        id: 'target_1',
        size: 2.0,
        texture: 'birdTarget',
        optionIndex: 0
      },
      {
        x: 680,
        y: 180,
        id: 'target_2',
        size: 1.2,
        texture: 'birdTarget',
        optionIndex: 1
      },
      {
        x: 410,
        y: 100,
        id: 'target_3',
        size: 1.0,
        texture: 'birdTarget',
        optionIndex: 2
      },
      {
        x: 300,
        y: 445,
        id: 'target_4',
        size: 1.8,
        texture: 'rabbitTarget',
        optionIndex: 3
      }
    ];
    // Validar que el número de targets coincida con el número de opciones
    if (targetsPositions.length !== level4QuestionData.options.length) {
      console.warn('El número de targets definidos no coincide con el número de opciones de la pregunta.');
    }

    targetsPositions.forEach((pos, loopIndex) => {
      // Se crea el sprite
      const targetSprite = this.physics.add.sprite(pos.x, pos.y, pos.texture).setScale(pos.size);
      targetSprite.setImmovable(true);
      targetSprite.body?.setAllowGravity(false);
      targetSprite.setName(pos.id); // Asigna el ID al nombre
      targetSprite.setData('targetType', pos.texture);
      targetSprite.setData('optionIndex', pos.optionIndex);
      targetSprite.setData('loopIndex', loopIndex); // Guardar el índice del bucle para referencia de foco

      // Asignamos las animaciones segun sea el caso de la key
       switch (pos.texture) {
     
        case 'rabbitTarget':
          this.time.delayedCall(1000, () => {
            targetSprite.play('rabbit-walk');
          });
          break;
        // No hacer nada, es estático
        case 'birdTarget':
          { targetSprite.play('bird-fly');
  
            const originalX = targetSprite.x; // Guardar la X inicial
            const moveDistance = 400; // Cuánto se mueve a la izquierda (ajusta según necesites)
            const offScreenX = originalX - moveDistance; // Calcula la X objetivo izquierda
            const walkDuration = 5000; // Duración para cada tramo (ajusta)
    
            // Crear una función que encadene los movimientos
            const createMovementChain = () => {
              // 1. Mover a la izquierda
              this.tweens.add({
                targets: targetSprite,
                x: offScreenX,
                duration: walkDuration,
                ease: 'Linear',
                onUpdate: () => {
                  // --- NUEVO: Actualizar posición del botón DOM ---
                  // Verificar que el botón DOM aún exista y esté activo
                  if (labelButtonDOM && labelButtonDOM.node && labelButtonDOM.active) {
                    // Calcular la Y relativa actual (por si la altura del sprite cambia o Y cambia)
                    const currentButtonY = targetSprite.y - targetSprite.displayHeight / 2 - 25;
                    labelButtonDOM.setPosition(targetSprite.x, currentButtonY);
                  }
                  // --- FIN NUEVO ---
                },
                onComplete: () => {
                  // 2. Voltear sprite a la derecha
                  targetSprite.setFlipX(true);
    
                  // 3. Mover a la derecha (volver al original)
                  this.tweens.add({
                    targets: targetSprite,
                    x: originalX,
                    duration: walkDuration,
                    ease: 'Linear',
                    onUpdate: () => {
                      // --- NUEVO: Actualizar posición del botón DOM (también aquí) ---
                      if (labelButtonDOM && labelButtonDOM.node && labelButtonDOM.active) {
                        const currentButtonY = targetSprite.y - targetSprite.displayHeight / 2 - 25;
                        labelButtonDOM.setPosition(targetSprite.x, currentButtonY);
                      }
                      // --- FIN NUEVO ---
                    },
                    onComplete: () => {
                      // 4. Voltear sprite a la izquierda y reiniciar
                      targetSprite.setFlipX(false);
                      // Solo reiniciar si el target todavía está activo (evita loops si ya fue golpeado)
                      if (targetSprite.active) {
                         createMovementChain(); // Reiniciar la secuencia
                      }
                    }
                  });
                }
              });
            };
    
            // Iniciar la cadena de movimientos
            if (targetSprite.active) { // Solo iniciar si está activo al crear
                 createMovementChain();
            }
            break; }
      case 'bearTarget':
        targetSprite.play('bear-walk');
        break;
        default:
          console.warn(`Textura desconocida para animación inicial: ${pos.texture}`);
      }

      // Se obtiene la letra de la opción (A, B, C, D o 1, 2, 3, 4) del array optionsIndex
      const optionLetter = level4QuestionData.optionsIndex[pos.optionIndex];
      const optionText = level4QuestionData.options[pos.optionIndex];
      const buttonX = targetSprite.x;
      const buttonY = targetSprite.y - targetSprite.displayHeight / 2 - (-70);

      const labelButtonDOM = this.add.dom(buttonX, buttonY).createFromHTML(`
        <button
          class="target-label-button"
          data-target-id="${pos.id}"
          data-loop-index="${loopIndex}"
          aria-label="Opción ${optionText.substring(3)}"
        >
          ${optionLetter}
        </button>
      `);

      labelButtonDOM.setOrigin(0.5, 0.5);

      labelButtonDOM.setDepth(targetSprite.depth + 1);

      targetSprite.setData('labelButton', labelButtonDOM); // Guardar referencia al elemento Phaser DOM

      // --- Añadir data para accesibilidad ---
      targetSprite.setData('optionLetter', optionLetter); // Guardar la letra para anuncios
      targetSprite.setData('optionText', level4QuestionData.options[pos.optionIndex]); // Texto completo opción
      targetSprite.setData('isCorrect', pos.optionIndex === level4QuestionData.correctIndex); // Si es la correcta

      // --- Configurar Interacción del Botón DOM ---
      const buttonElement = labelButtonDOM.node.querySelector('button');
      if (buttonElement) {
        buttonElement.addEventListener('click', () => {
          const buttonIndex = parseInt(buttonElement.dataset.loopIndex || '-1');
          if (buttonIndex !== -1) {
            this.focusedTargetIndex = buttonIndex;
            this.updateFocusVisual();
          }
        });

        // Cuando el botón recibe foco (vía Tab), también actualizamos el indicador visual del juego
        buttonElement.addEventListener('focus', () => {
          const buttonIndex = parseInt(buttonElement.dataset.loopIndex || '-1');
          if (buttonIndex !== -1 && this.focusedTargetIndex !== buttonIndex) {
            // Solo si cambia
            this.focusedTargetIndex = buttonIndex;
            this.updateFocusVisual(); // Actualizar indicador visual
            announce(`Objetivo ${optionLetter} enfocado.`);
          }
        });
      }
      // Agregar al estado global
      globalState.targets.push({
        id: pos.id,
        sprite: targetSprite,
        position: { x: pos.x, y: pos.y },
        size: pos.size
      });
    });

    // Arco
    this.bow = this.add.image(700, 400, 'first-person').setOrigin(0.5, 0.5).setScale(this.baseBowScale);

    // Flecha cargada (siempre visible)
    this.loadedArrow = this.add.image(this.bow.x, this.bow.y, 'arrow').setOrigin(0.2, 0.5).setScale(0.3).setDepth(9);

    // Configuración del pool de flechas
    this.arrowPool = this.add.group({
      classType: Phaser.GameObjects.Image,
      maxSize: 5, // Tamaño del pool (cuántas flechas pueden existir a la vez, no cuántos disparos)
      runChildUpdate: true, // Importante para que las flechas fuera de pantalla se limpien
      createCallback: (arrow) => {
        (arrow as Phaser.GameObjects.Image).setTexture('arrow').setScale(0.3).setOrigin(0.2, 0.5).setDepth(10);
      }
    });

    // Línea de trayectoria (solo raton)
    this.trajectoryLine = this.add.graphics();
    this.trajectoryLine.setDepth(8); // Debajo de la flecha

    // Física
    this.physics.world.setBounds(0, 0, 800, 600);

    // Eventos

    // RATÓN
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
      if (this.isDialogActive || this.isWarningActive) return; // No interactuar si hay modal activo

      if(!pointer)  console.log(pointer);

      if (globalState.availableArrows > 0) {
        this.keyboardChargeSource = false; // Carga por ratón
        this.isCharging = true;
        this.isDrawingTrajectory = true; // Dibujar trayectoria con ratón
        this.chargeTime = 0;
        this.reloadSound.play();
      } else {
        this.warnAnyArrow();
      }
    });

    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
      if (this.isDialogActive || this.isWarningActive) return;
      if (this.isCharging && !this.keyboardChargeSource) {
        // Solo si fue carga por ratón
        this.shootArrowMouse(pointer.x, pointer.y);
      }
      this.isCharging = false;
      this.isDrawingTrajectory = false;
      this.trajectoryLine.clear();
      this.bow.setScale(this.baseBowScale); // Resetear escala arco
      this.loadedArrow.setScale(0.2); // Resetear escala flecha cargada
      // No advertir aquí, shootArrowMouse/Keyboard lo maneja
    });

    // --- Eventos Teclado ---
    this.input.keyboard?.on('keydown-TAB', (event: KeyboardEvent) => {
      if (this.isDialogActive || this.isWarningActive) return;
      if (document.activeElement !== this.game.canvas) return; // Solo actuar si el canvas TIENE el foco

      event.preventDefault(); // Prevenir que Tab salga del canvas automáticamente

      // Encontrar el ÍNDICE LÓGICO (0-3) del PRIMER target ACTIVO
      const firstActiveLogicalIndex = globalState.targets.findIndex((t) => t.sprite?.active);

      // Encontrar el ÍNDICE LÓGICO (0-3) del ÚLTIMO target ACTIVO
      let lastActiveLogicalIndex = -1;
      for (let i = globalState.targets.length - 1; i >= 0; i--) {
        if (globalState.targets[i]?.sprite?.active) {
          lastActiveLogicalIndex = i;
          break;
        }
      }

      if (firstActiveLogicalIndex === -1) {
        // No hay targets activos, permitir que Tab salga del canvas hacia otros elementos
        const openButton = this.openButton?.node?.querySelector('#open-dialog-button') as HTMLButtonElement;
        if (openButton && !openButton.classList.contains('hidden')) {
          openButton.focus();
        }

        return;
      }

      if (event.shiftKey) {
        // Shift + Tab desde el Canvas: Ir al ÚLTIMO target activo
        this.focusTargetButtonByIndex(lastActiveLogicalIndex);
      } else {
        // Tab normal desde el Canvas: Ir al PRIMER target activo
        this.focusTargetButtonByIndex(firstActiveLogicalIndex);
      }
    });

    this.input?.keyboard?.on('keydown-SPACE', (_event: KeyboardEvent) => {
      if (this.isDialogActive || this.isWarningActive || this.isCharging) return;
      this.event = _event; // Guardar el evento para usarlo en el anuncio
      if (this.focusedTargetIndex !== -1 && globalState.availableArrows > 0) {
        this.keyboardChargeSource = true;
        this.isCharging = true;
        this.isDrawingTrajectory = false; // No dibujar trayectoria con teclado
        this.chargeTime = 0;
        this.reloadSound.play();
      } else if (globalState.availableArrows <= 0) {
        this.warnAnyArrow();
      } else if (this.focusedTargetIndex === -1) {
        announce('Selecciona un objetivo con la tecla TAB primero.');
      }
    });

    this.input?.keyboard?.on('keyup-SPACE', (_event: KeyboardEvent) => {
      if (this.isDialogActive || this.isWarningActive || !this.isCharging || !this.keyboardChargeSource) {
        return;
      }
      this.event = _event;
      this.shootArrowKeyboard();

      this.isCharging = false;
      this.keyboardChargeSource = false;
      this.bow.setScale(this.baseBowScale);
      this.loadedArrow.setScale(0.3);
    });

    this.input?.keyboard?.on('keydown-ESC', (_event: KeyboardEvent) => {
      this.event = _event;
      if (this.isDialogActive) {
        this.closeDialog();
      } else if (this.isWarningActive) {
        this.closeWarnDialog();
      } else if (this.isCharging && this.keyboardChargeSource) {
        // Cancelar carga de teclado
        this.isCharging = false;
        this.keyboardChargeSource = false;
        this.chargeTime = 0;
        this.bow.setScale(this.baseBowScale);
        this.loadedArrow.setScale(0.2);
      }
    });

    // Configurar colisiones
    this.physics.add.collider(
      this.arrowPool,
      globalState.targets.map((t) => t.sprite),
      (arrowObj, targetObj) => {
        const hitTarget = globalState.targets.find((t) => t.sprite === targetObj && t.sprite?.active);
        if (hitTarget) {
          // Pasar la LETRA y si fue CORRECTO a handleTargetHit para los anuncios
          this.handleTargetHit(arrowObj as Phaser.Physics.Arcade.Image, targetObj as Phaser.Physics.Arcade.Image);
        } else {
          // Limpiar flecha si el target ya no existe (ya fue golpeado y destruido)
          const arrowImage = arrowObj as Phaser.Physics.Arcade.Image;
          if (arrowImage) {
            // Comprobación extra por si acaso
            this.killArrow(arrowImage);
          }
        }
      },
      undefined,
      this
    );

    // Se Emite el evento para actualizar la UI al iniciar el nivel
    this.time.delayedCall(10, () => this.game.events.emit('update-ui'));
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
  // --- Helper para limpiar flechas ---
  private killArrow(arrow: Phaser.Physics.Arcade.Image) {
    arrow.setActive(false).setVisible(false);
    if (arrow.body) {
      // Verificar si el cuerpo existe
      arrow.body.stop();
      arrow.body.enable = false;
    }
    this.arrowPool.killAndHide(arrow); // Devuelve al pool
  }

  // --- Actualizar Indicador Visual de Foco ---
  private updateFocusVisual(): void {
    this.keyboardFocusIndicator?.clear();
  }

  // Función para mostrar advertencia de flechas
  private warnAnyArrow(): void {
    if (this.isWarningActive) return; // Ya está activa

    this.isWarningActive = true;
    this.isDialogActive = true; // Tratarla como un modal también para input
    announce('¡Oh no! Te has quedado sin flechas. Volviendo al mapa.');
    this.previouslyFocusedElement = document.activeElement as HTMLElement; // Guardar foco actual

    // Crear DOM Element
    const containerWarn = this.add
      .dom(400, 300)
      .createFromHTML(
        `
       <div id="warn-dialog" class="game-arcanum-warn-content" role="alertdialog" aria-modal="true" aria-labelledby="warn-title" aria-describedby="warn-desc">
          <h2 id="warn-title" class="game-arcanum-warn-text">¡Oh no, sin Flechas!</h2>
          <p id="warn-desc">Te has quedado sin flechas, ¿Quieres volver a intentar?.</p>
          <button id="close-warn" aria-label="Volver al mapa" class="game-arcanum-btn-warn">Volver al Mapa</button>
       </div>
      `
      )
      .setOrigin(0.5, 0.5)
      .setDepth(9999);

    // Buscar botón DENTRO del nodo recién creado
    const warnNode = containerWarn.node as HTMLDivElement;
    const closeWarnButton = warnNode.querySelector('#close-warn') as HTMLButtonElement;

    if (closeWarnButton) {
      // Enfocar el botón
      this.time.delayedCall(50, () => closeWarnButton.focus()); // Pequeño delay para asegurar que esté en el DOM

      // Listener para cerrar
      const closeHandler = () => {
        containerWarn.destroy(); // Destruir el DOM
        this.isWarningActive = false;
        this.isDialogActive = false;
        // Restaurar foco
        if (this.previouslyFocusedElement) {
          this.previouslyFocusedElement.focus();
          this.previouslyFocusedElement = null;
        } else {
          this.game.canvas.focus(); // Foco de vuelta al canvas si no había nada antes
        }
        this.scene.start('mapScene'); // Ir al mapa
      };

      closeWarnButton.addEventListener('click', closeHandler);
      // Podríamos añadir listener para ESC aquí también si queremos que cierre la advertencia
      // this.input.keyboard.once('keydown-ESC', closeHandler); // Cuidado con listeners duplicados si se abre/cierra rápido

      // --- Trampa de foco ---
      warnNode.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          // Aquí solo hay un botón, así que Tab debería quedarse en él
          e.preventDefault();
        }
      });
    } else {
      console.error('No se encontró el botón #close-warn.');
      // Recuperación: destruir el diálogo y volver al mapa igualmente
      this.time.delayedCall(1000, () => {
        containerWarn.destroy();
        this.isWarningActive = false;
        this.isDialogActive = false;
        if (this.previouslyFocusedElement) this.previouslyFocusedElement.focus();
        else this.game.canvas.focus();
        this.scene.start('mapScene');
      });
    }
  }
  // Función para cerrar la advertencia (si es necesario llamarla desde ESC) ---
  private closeWarnDialog(): void {
    const warnDialog = document.getElementById('warn-dialog');
    if (warnDialog) {
      const closeButton = warnDialog.querySelector('#close-warn') as HTMLButtonElement;
      if (closeButton) {
        closeButton.click(); // Simular clic en el botón para ejecutar toda la lógica de cierre
      } else {
        // Fallback si no se encuentra el botón
        const containerWarn = this.children.list.find(
          (child) => child instanceof Phaser.GameObjects.DOMElement && child.node.id === 'warn-dialog'
        );
        if (containerWarn) containerWarn.destroy();
        this.isWarningActive = false;
        this.isDialogActive = false;
        if (this.previouslyFocusedElement) this.previouslyFocusedElement.focus();
        else this.game.canvas.focus();
        this.scene.start('mapScene');
      }
    }
  }
  // Función para crear el diálogo
  private createDialog(): void {
    if (this.bgDialog) return; // Evitar crear duplicados si ya existe

    this.isDialogActive = true; // Marcar como activo
    this.previouslyFocusedElement = document.activeElement as HTMLElement; // Guardar foco

    this.bgDialog = this.add
      .dom(20, 460, 'div', {
        /* estilos si es necesario */
      })
      .createFromHTML(this.dialogHTML) // Usar la variable con ARIA
      .setDepth(10)
      .setOrigin(0, 0);

    this.dialogContainer = this.bgDialog.node as HTMLDivElement;
    this.dialogContainer.style.height = 'auto'; // Ajustar altura automáticamente? O mantener fija.
    this.dialogContainer.classList.add('game-arcanum-dialog-container'); // Clase principal

    // Configurar elementos y eventos DENTRO del nodo creado
    this.textElement = this.dialogContainer.querySelector('#dialog-text2') as HTMLParagraphElement;
    this.showMoreButton = this.dialogContainer.querySelector('#show-more-btn') as HTMLButtonElement;
    const closeButton = this.dialogContainer.querySelector('#close') as HTMLButtonElement;
    const dialogContentElement = this.dialogContainer.querySelector('.game-arcanum-dialog-content') as HTMLElement | null;
 // -------------------------------------------------

    if (!this.textElement || !this.showMoreButton || !closeButton || !dialogContentElement) {
      console.error('Error al encontrar elementos dentro del diálogo HTML.');
      this.closeDialog(); // Intentar cerrar si falló la creación
      return;
    }

    // Enfocar el primer elemento interactivo (botón 'más' o 'cerrar' si es el último)
    this.time.delayedCall(10, () => {
      if (this.showMoreButton && this.showMoreButton.style.display !== 'none') {
        this.showMoreButton.focus();
      } else {
        closeButton.focus();
      }
    });

    this.showTextPart(); // Mostrar texto

    // Evento para el botón de mostrar más
    this.showMoreButton.addEventListener('click', () => {
      this.currentPart++;
      this.showTextPart();
      announce('Diálogo actualizado.'); // Anunciar cambio
      // Devolver foco al botón 'más' si aún es visible, o al de cerrar
      this.time.delayedCall(10, () => {
        if (this.showMoreButton && this.showMoreButton.style.display !== 'none') {
          this.showMoreButton.focus();
        } else {
          closeButton.focus();
        }
      });
    });

    // Evento para el botón de cerrar
    closeButton.addEventListener('click', () => {
      this.closeDialog();
    });

    // --- Trampa de foco para el diálogo ---
    dialogContentElement.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = Array.from(
          dialogContentElement.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null && !el.hasAttribute('disabled')); // Solo visibles y no deshabilitados

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
        // Si no es el primero o último, el navegador maneja el tab normal dentro del grupo
      }
    });

    this.time.delayedCall(1000, () => {
      announce('Diálogo abierto.'); // Anunciar que se abrió
    });
  }
  // Función centralizada para cerrar diálogo ---
  private closeDialog(): void {
    if (!this.isDialogActive || this.isWarningActive) return; // No cerrar si no está activo o si es la advertencia

    const dialogContainer = this.dialogContainer; // Guardar referencia antes de limpiar
    const openButtonElement = this.openButton?.node?.querySelector('#open-dialog-button') as HTMLButtonElement;

    // Animación de salida (si existe)
    if (dialogContainer) {
      dialogContainer.classList.add('btnHidden'); // Asumiendo que esta clase anima la salida
      // Esperar a que termine la animación antes de destruir y restaurar foco
      dialogContainer.addEventListener(
        'animationend',
        () => {
          this.destroyDialog(); // Destruir después de animar
          if (openButtonElement) {
            openButtonElement.classList.remove('hidden'); // Mostrar botón de abrir
            openButtonElement.focus(); // Poner foco en el botón de abrir
          } else if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus(); // Restaurar foco previo
          } else {
            this.game.canvas.focus(); // Foco al canvas como último recurso
          }
          this.previouslyFocusedElement = null; // Limpiar
        },
        { once: true }
      ); // Asegurar que solo se ejecute una vez
    } else {
      // Si no hay animación o contenedor, destruir y restaurar inmediatamente
      this.destroyDialog();
      if (openButtonElement) {
        openButtonElement.classList.remove('hidden');
        openButtonElement.focus();
      } else if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
      } else {
        this.game.canvas.focus();
      }
      this.previouslyFocusedElement = null;
    }
    announce('Diálogo cerrado.');
  }
  // Función para destruir el diálogo
  private destroyDialog(): void {
    if (this.bgDialog) {
      // Quitar listeners explícitamente si es necesario (aunque destroy debería hacerlo)
      this.bgDialog.destroy();
    }
    // Limpiar referencias
    this.bgDialog = null as unknown as Phaser.GameObjects.DOMElement;
    this.dialogContainer = null as unknown as HTMLDivElement;
    this.textElement = null;
    this.showMoreButton = null;
    this.isDialogActive = false; // Marcar como inactivo
  }
  // Función para recrear el diálogo -- Se utiliza para crear el diálogo de nuevo
  private recreateDialog(): void {
    if (!this.bgDialog) {
      // Solo si NO existe
      this.createDialog(); // Llama a la función modificada con manejo de foco y ARIA
      // Asegúrate que el botón de abrir se oculte aquí también si createDialog no lo hace
      const openButtonElement = this.openButton?.node?.querySelector('#open-dialog-button') as HTMLButtonElement;
      if (openButtonElement) {
        openButtonElement.classList.add('hidden');
      }
    }
  }
  // Función para agregar la pregunta al array dialogsData
  private addQuestionToDialogs(): void {
    if (globalState.questions.length > 0) {
      const question = globalState.questions.find((q) => q.id === 'level-4');
      if (question) {
        const questionText = `<span class="game-arcanum-question">${question.question}</span>`;
        this.dialogsData.push(questionText);
        // Agregar las opciones como un string con una clase especial
        const optionsText = `<span class="game-arcanum-options">${question.options.join(', ')}</span>`;
        this.dialogsData.push(optionsText);
      }
    }
  }
  // Función para mostrar la parte del texto actual
  private showTextPart(): void {
    if (!this.textElement || !this.showMoreButton || !this.dialogContainer) return;

    // Buscar el botón de cerrar DENTRO del contenedor actual
    const closeButton = this.dialogContainer.querySelector('#close') as HTMLButtonElement;
    if (!closeButton) return; // Salir si no se encuentra

    if (this.currentPart < 0 || this.currentPart >= this.textParts.length) {
      console.warn('Invalid currentPart index in showTextPart:', this.currentPart);
      this.currentPart = 0; // Resetear por seguridad
    }

    this.textElement.innerHTML = this.textParts[this.currentPart];

    const isLastPart = this.currentPart >= this.textParts.length - 1;
    this.showMoreButton.style.display = isLastPart ? 'none' : 'flex';
    closeButton.style.display = isLastPart ? 'block' : 'none';

    // Mover el foco al botón apropiado después de actualizar el texto
    this.time.delayedCall(5, () => {
      if (isLastPart) {
        closeButton.focus();
      } else {
        this.showMoreButton?.focus();
      }
    });
  }
  // Función para manejar la colisión entre flecha y objetivo
  private handleTargetHit(arrowObj: Phaser.Physics.Arcade.Image, targetObj: Phaser.Physics.Arcade.Image): void {
    const arrow = arrowObj as Phaser.Physics.Arcade.Image;
    const target = targetObj as Phaser.Physics.Arcade.Image;

    // Prevenir procesamiento múltiple
    if (!target.active) {
      this.killArrow(arrow);
      return;
    }

    // --- PASO 1: Desactivar flecha ---
    this.killArrow(arrow);

    // --- PASO 2: Obtener datos ---
    const hitOptionIndex = target.getData('optionIndex') as number;
    const targetId = target.name;
    const optionLetter = target.getData('optionLetter') as string;
    const isCorrect = target.getData('isCorrect') as boolean;
    const hitLoopIndex = target.getData('loopIndex') as number;
    const level4Question = globalState.questions.find((q) => q.id === 'level-4'); // Correcto para Level4
    const labelButtonDOM = target.getData('labelButton') as Phaser.GameObjects.DOMElement | null;

    // --- PASO 3: Validar datos ---
    if (
      level4Question === undefined ||
      hitOptionIndex === undefined ||
      optionLetter === undefined ||
      isCorrect === undefined ||
      hitLoopIndex === undefined
    ) {
      console.error(`Error: Datos incompletos en handleTargetHit para target ${targetId}. ID de pregunta buscado: 'level-4'`);

      // Limpieza de emergencia y salida
      if (labelButtonDOM) labelButtonDOM.destroy();
      if (target.active) {
        if (target.body) target.body.enable = false;
        target.destroy();
      }
      this.refocusAfterTargetHit(hitLoopIndex);
      this.time.delayedCall(500, () => this.scene.start('mapScene'));
      return;
    }

    // --- PASO 4: Destruir Botón DOM Asociado (Siempre) ---
    if (labelButtonDOM) {
      labelButtonDOM.destroy();
      target.setData('labelButton', null); // Limpiar referencia
    }

    // --- PASO 5: Procesar si fue Correcto o Incorrecto ---
    const levelFeedback = globalState.feedbacks[this.currentLevelKey];
    const defaultFeedback = globalState.feedbacks.default;
    let feedbackMessage: string;
    this.sound.play('hit', { volume: 0.2 }); // Sonido de impacto

    // --- PASO 6: Procesar si fue Correcto o Incorrecto ---
    if (isCorrect) {
      // --- CORRECTO ---
this.sound.play('getPotion', { volume: 0.01 }); // Sonido de acierto

      // Destruir el sprite del target CORRECTO inmediatamente
      if (target.active) {
        target.setActive(false).setVisible(false);
        if (target.body) target.body.enable = false;
        target.destroy(); // Destruir ahora
      }

      // Mostrar feedback visual de recompensa
      this.showRewardFeedback('potion_icon', target.x, target.y  + 80);

      // Actualizar estado global
      const rewardData = level4Question.reward;
      let rewardText = '';
      if (rewardData) {
        globalState.potions += rewardData.amount;
        rewardText = rewardData.description || `${rewardData.amount} ${rewardData.type}`;
        this.game.events.emit('update-ui');
        if (this.sound.get('reward_sound')) this.sound.play('reward_sound', { volume: 0.5 });
      }
      announce(`¡Correcto! Objetivo ${optionLetter} alcanzado. ${rewardText}. Nivel completado.`);

      // Seleccionar Mensaje de Feedback Correcto
      feedbackMessage = levelFeedback?.correct || defaultFeedback?.correct || '¡Correcto!';
      this.game.events.emit('show-feedback', { type: 'correct', message: feedbackMessage });

      // Marcar nivel como completado
      if (!globalState.completedLevels.includes('level-4')) { // Usar ID correcto
        globalState.completedLevels.push('level-4');
      }

      // Transición al mapa (limpieza de OTROS targets se hace aquí)
      this.time.delayedCall(4000, () => {
        globalState.targets.forEach((tInfo) => {
          if (tInfo.sprite && tInfo.sprite.scene) { // Solo destruir los que aún existen
             const otherButton = tInfo.sprite.getData('labelButton') as Phaser.GameObjects.DOMElement;
             if (otherButton) otherButton.destroy();
             tInfo.sprite.destroy();
          }
        });
        globalState.targets = [];
        this.keyboardFocusIndicator?.clear();
        this.scene.start('mapScene');
      });

    } else {
      // --- INCORRECTO ---

      // 1. Detener cualquier animación o tween existente
    

      // 2. Sacudir pantalla
      this.cameras.main.shake(200, 0.01);

      // 3. Tint rojo
      target.setTint(0xff0000);

      // 4. Marcar como INACTIVO para la lógica del juego (refocus, nuevas colisiones)
      target.setActive(false);
      // PERO mantenerlo VISIBLE para ver la animación de caída
      target.setVisible(true);

      // 5. Habilitar física y hacer caer (MÉTODO PREFERIDO)
      if (target.body) {
        const body = target.body as Phaser.Physics.Arcade.Body;
        body.enable = true;             // Asegurarse que la física esté activa
        body.setAllowGravity(true);     // La gravedad lo afectará
        body.setCollideWorldBounds(false); // Permitir caer fuera
        // Darle un pequeño empujón inicial (ajustar valores)
        body.setVelocity(Phaser.Math.Between(-40, 40), Phaser.Math.Between(80, 180));
        body.setAngularVelocity(Phaser.Math.Between(-150, 150)); // Hacerlo girar

        // *** NO programar destrucción aquí ***
        // La destrucción se manejará en el update al salir de la pantalla

      } else {
        // Fallback con Tween (si no tiene cuerpo físico)
        console.warn(`Target ${targetId} no tiene body físico. Usando Tween para caída.`);
        this.tweens.add({
            targets: target,
            y: this.cameras.main.scrollY + this.cameras.main.height + target.displayHeight, // Asegurar que va BIEN abajo
            alpha: 0.5, // Desvanecer un poco, no completamente
            angle: target.angle + Phaser.Math.Between(-90, 90),
            duration: 2000, // Duración más larga
            ease: 'Sine.easeIn',
            onComplete: () => {
                // Solo destruir si todavía existe y está en la escena
                if (target.scene) {
                    target.destroy();
                }
            }
        });
      }

      // 6. Emitir Feedback y Anuncio
      feedbackMessage = levelFeedback?.incorrect || defaultFeedback?.incorrect || '¡Incorrecto! Intenta de nuevo.';
      this.game.events.emit('show-feedback', { type: 'incorrect', message: feedbackMessage });

      let announceMsg = `Incorrecto`;
      if (globalState.availableArrows > 0) {
        globalState.availableArrows--;
        announceMsg += ` Flecha perdida. Quedan ${globalState.availableArrows}.`;
        this.game.events.emit('update-ui');
      } else {
        announceMsg += ` Ya no tenías más flechas.`;
      }
      announce(announceMsg);

      // 7. Reajustar foco (ignora el target caído porque está inactivo)
      this.refocusAfterTargetHit(hitLoopIndex);

      // 8. Comprobar si se quedó sin flechas
      if (globalState.availableArrows <= 0) {
        this.time.delayedCall(1500, () => { // Aumentar delay un poco
          if (this.scene.isActive() && globalState.availableArrows <= 0 && !this.isWarningActive) {
            this.warnAnyArrow();
          }
        });
      }
    }
} 
  // Helper para reajustar foco después de que un target es golpeado ---
  private refocusAfterTargetHit(hitLoopIndex: number): void {

    // Filtrar para obtener solo los targets que AÚN están activos
    const currentlyActiveTargetsInfo = globalState.targets
      .map((t, index) => ({
        // Mapear para incluir el índice original 0-3
        sprite: t.sprite, // Mantener referencia al sprite
        originalIndex: index // Guardar índice original (0-3)
      }))
      .filter((t) => t.sprite?.active); // Filtrar solo los activos

    let nextLogicalIndex = -1; // El índice ORIGINAL (0-3) que queremos enfocar

    if (currentlyActiveTargetsInfo.length === 0) {
      // --- Caso: No quedan targets activos ---
      nextLogicalIndex = -1;
      announce('No quedan más objetivos.');
      this.game.canvas.focus(); // Foco al canvas como fallback
    } else {
      // --- Caso: Sí quedan targets activos, encontrar el siguiente ---

      let bestCandidateIndex = -1;
      let minDistance = Infinity;

      currentlyActiveTargetsInfo.forEach((activeInfo) => {
        // activeInfo.originalIndex es el índice 0-3 de este target activo
        const distance = Math.abs(activeInfo.originalIndex - hitLoopIndex);

        // Ponderar para preferir el siguiente en caso de empate
        let weightedDistance = distance;
        if (activeInfo.originalIndex < hitLoopIndex) {
          // Si el target activo está *antes* del golpeado, hacerlo ligeramente menos preferible
          weightedDistance += 0.1;
        }

        // Actualizar el mejor candidato
        if (weightedDistance < minDistance) {
          minDistance = weightedDistance;
          bestCandidateIndex = activeInfo.originalIndex; // Guardar el índice 0-3
        }
        // No necesitamos manejar el empate explícitamente aquí si la ponderación funciona
      });

      // Si encontramos un candidato cercano
      if (bestCandidateIndex !== -1) {
        nextLogicalIndex = bestCandidateIndex;
      } else {
        // Fallback MUY improbable si la lógica anterior falló: enfocar el primero activo
        nextLogicalIndex = currentlyActiveTargetsInfo[0]?.originalIndex ?? -1;
        console.warn(`Refocus fallback: Setting next logical index to ${nextLogicalIndex}`);
      }

      // Doble chequeo: Si por alguna razón el índice elegido ya no está activo
      // (lo cual no debería pasar con el filtro), o es -1, forzar al primero activo.
      const chosenTargetIsActive = globalState.targets[nextLogicalIndex]?.sprite?.active;
      if (nextLogicalIndex === -1 || !chosenTargetIsActive) {
        if (currentlyActiveTargetsInfo.length > 0) {
          nextLogicalIndex = currentlyActiveTargetsInfo[0].originalIndex;
          console.warn(`Refocus double-check: Forcing focus to first active index ${nextLogicalIndex}`);
        } else {
          // Si incluso el primero no es válido (no debería pasar), resetear
          nextLogicalIndex = -1;
          console.error('Refocus double-check failed: No valid active target found.');
        }
      }
    }

    // --- Actualizar estado y mover foco del navegador ---
    this.focusedTargetIndex = nextLogicalIndex; // Actualizar índice lógico interno (puede ser -1)
    this.updateFocusVisual(); // Actualizar el indicador visual del juego (maneja el caso -1)

    if (this.focusedTargetIndex !== -1) {
      // Enfocar el botón del target correspondiente usando el índice lógico (0-3)
      this.focusTargetButtonByIndex(this.focusedTargetIndex); // focusTargetButtonByIndex usa el índice lógico
      // Anunciar el nuevo target seleccionado (asegúrate que no anuncie si el índice es -1)
      const focusedTargetData = globalState.targets[this.focusedTargetIndex]?.sprite?.getData('optionLetter');
      if (focusedTargetData) {
        // Verificar que exista y que el índice sea válido

        this.time.delayedCall(1500, () => {
          announce(`Objetivo ${focusedTargetData} seleccionado.`); // Anunciar letra
        });
      } else if (this.focusedTargetIndex !== -1) {
        // Si el índice es válido pero no se pudo obtener la letra (raro)
        announce(`Objetivo ${this.focusedTargetIndex + 1} seleccionado.`); // Anunciar número
      }
    } else {
      // Si focusedTargetIndex terminó siendo -1 (no quedan activos o error)
      // El foco ya se movió al canvas arriba si no quedaban activos
      this.keyboardFocusIndicator?.clear(); // Asegurarse de limpiar el indicador
    }
  }

  //  Helper para enfocar un botón de target por su índice en la lista activa ---
  private focusTargetButtonByIndex(logicalIndex: number): void {
    if (logicalIndex >= 0 && logicalIndex < globalState.targets.length) {
      const targetInfo = globalState.targets[logicalIndex];

      // Comprobar si el sprite existe y está activo ANTES de intentar enfocar
      if (!targetInfo?.sprite || !targetInfo.sprite.active) {
        console.warn(`Target at logical index ${logicalIndex} is not active. Cannot focus its button.`);
        // <<< NO HACER NADA AQUÍ >>>
        // Dejar que el foco permanezca donde estaba (probablemente el canvas o el botón anterior).
        // El usuario tendrá que tabular de nuevo para encontrar el siguiente activo.
        return;
      }

      // Intentar obtener el botón
      const buttonDOMElement = targetInfo.sprite.getData('labelButton') as Phaser.GameObjects.DOMElement | null;
      const buttonElement = buttonDOMElement?.node?.querySelector('button');

      if (buttonElement) {
        buttonElement.focus(); // Mover foco del navegador al botón
       
      } else {
        // Si el botón no existe (raro si el sprite está activo)
        console.warn(`Button element not found for ACTIVE target at logical index ${logicalIndex}.`);
        // <<< NO HACER NADA AQUÍ >>>
        // Dejar el foco donde estaba.
      }
    } else {
      // Índice lógico fuera de rango
      console.warn(`Invalid logical index ${logicalIndex} passed to focusTargetButtonByIndex.`);
      // <<< NO HACER NADA AQUÍ >>>
      // Dejar el foco donde estaba.
    }
  }

  // función para mostrar feedback visual simple
  private showRewardFeedback(content: string, x: number, y: number, color: string = '#ffffff') {
    let feedbackObject: Phaser.GameObjects.GameObject;

    // Si la clave existe como textura, es una imagen, si no, es texto
    if (this.textures.exists(content)) {
      feedbackObject = this.add.image(x, y, content).setScale(0.5).setAlpha(0).setDepth(9999);
    } else {
      feedbackObject = this.add
        .text(x, y, content, { font: '24px Arial', color: color, stroke: '#000', strokeThickness: 4 })
        .setOrigin(0.5)
        .setAlpha(0);
    }

    // Animación simple de aparecer y desaparecer flotando hacia arriba
    this.tweens.add({
      targets: feedbackObject,
      y: y - 50, // Mover hacia arriba
      alpha: 1, // Hacer visible
      duration: 800, // Duración de aparición
      ease: 'Power1',
      yoyo: true, // Hacer que vuelva (para el alpha)
      hold: 500, // Mantener visible por un tiempo
      onComplete: () => {
        feedbackObject.destroy(); // Destruir al final
      }
    });
  }

  // función para disparar flechas con ratón
  private shootArrowMouse(targetX: number, targetY: number) {
    if (globalState.availableArrows <= 0) {
      this.warnAnyArrow(); // Mostrar advertencia si intentan disparar sin flechas
      return;
    }
    const newArrow = this.arrowPool.get(this.bow.x, this.bow.y) as Phaser.Physics.Arcade.Image | null;
    if (!newArrow) {
      /* ... warning ... */ return;
    }

    // Configurar flecha
    newArrow.setActive(true).setVisible(true).setRotation(this.loadedArrow.rotation);
    this.physics.add.existing(newArrow);
    const body = newArrow.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false).setCollideWorldBounds(false); // Permitir salir de pantalla

    // Calcular potencia basada en tiempo de carga
    const power = Phaser.Math.Linear(
      this.minPower,
      this.maxPower,
      Phaser.Math.Clamp(this.chargeTime / this.maxChargeTime, 0, 1)
    );

    // Calcular dirección basada en puntero
    const dx = targetX - this.bow.x;
    const dy = targetY - this.bow.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      // Evitar división por cero
      body.setVelocity((dx / distance) * power, (dy / distance) * power);
    } else {
      body.setVelocity(0, -power); // Disparar hacia arriba si la distancia es 0
    }

    // --- Consecuencias comunes ---
    this.handleShootConsequences();
  }
  // Disparo con Teclado
  private shootArrowKeyboard() {

    // --- Validación 1: Flechas disponibles ---
    if (globalState.availableArrows <= 0) {
      this.warnAnyArrow(); // Muestra advertencia de falta de flechas
      return; // No continuar
    }

    // --- Validación 2: Objetivo lógico enfocado ---
    // Verifica si nuestra variable interna indica que hay un objetivo seleccionado
    if (this.focusedTargetIndex === -1) {
      announce('Selecciona un objetivo con TAB antes de disparar.');
      return; // No continuar
    }

    // --- Obtener estado actual  ---
    // Re-evaluar QUÉ targets están REALMENTE activos AHORA MISMO
    const currentActiveTargets = globalState.targets.filter((t) => t.sprite?.active);
    const activeTargetCount = currentActiveTargets.length;
    // Capturar el índice lógico que tenemos en este preciso instante
    const currentFocusedLogicalIndex = this.focusedTargetIndex;

    if (
      currentFocusedLogicalIndex < 0 ||
      currentFocusedLogicalIndex >= globalState.targets.length ||
      !globalState.targets[currentFocusedLogicalIndex]?.sprite?.active
    ) {
      console.error(
        `>>> ERROR: Índice de foco (${currentFocusedLogicalIndex}) inválido o target en ese índice no está activo! Active count: ${activeTargetCount}`
      );
      // Resetear estado lógico y visual
      this.focusedTargetIndex = -1;
      this.updateFocusVisual();
      announce('Error al disparar. Selecciona un objetivo de nuevo.');

      // Intentar re-enfocar el PRIMER botón activo como fallback
      const firstActiveLogicalIndex = globalState.targets.findIndex((t) => t.sprite?.active);
      if (firstActiveLogicalIndex !== -1) {
        this.focusTargetButtonByIndex(firstActiveLogicalIndex);
      } else {
        this.game.canvas.focus();
      }
      return;
    }

    const targetInfo = globalState.targets[currentFocusedLogicalIndex];
    const targetSprite = targetInfo.sprite;

    // Obtener una flecha del pool
    const newArrow = this.arrowPool.get(this.bow.x, this.bow.y) as Phaser.Physics.Arcade.Image | null;
    if (!newArrow) {
      console.warn('No se pudo obtener flecha del pool.');
      return; // No se puede disparar si no hay flecha disponible
    }

    // Configurar la flecha (activar, física)
    newArrow.setActive(true).setVisible(true);
    this.physics.add.existing(newArrow);
    const body = newArrow.body as Phaser.Physics.Arcade.Body;
    if (!body) {
      console.error('>>> ERROR: Flecha obtenida del pool no tiene cuerpo físico.');
      this.arrowPool.killAndHide(newArrow);
      return;
    }
    body.setAllowGravity(false).setCollideWorldBounds(false);

    // Calcular potencia basada en tiempo de carga
    const power = Phaser.Math.Linear(
      this.minPower,
      this.maxPower,
      Phaser.Math.Clamp(this.chargeTime / this.maxChargeTime, 0, 1)
    );

    // Calcular dirección HACIA el centro del target enfocado
    const targetX = targetSprite.x;
    const targetY = targetSprite.y;
    const dx = targetX - this.bow.x;
    const dy = targetY - this.bow.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Rotar la flecha para que apunte al objetivo
    newArrow.setRotation(angle);

    // Aplicar velocidad a la flecha
    if (distance > 0) {
      body.setVelocity((dx / distance) * power, (dy / distance) * power);
    } else {
      body.setVelocity(0, -power);
    }

    this.handleShootConsequences();
  }

  // Acciones comunes después de disparar ---
  private handleShootConsequences(): void {
    globalState.availableArrows--;
    this.game.events.emit('update-ui');
    this.shootSound.play();
    /*  announce(`Flecha disparada. Quedan ${globalState.availableArrows}.`); */

    // Resetear carga
    this.chargeTime = 0;

    // Comprobar si esta fue la última flecha DESPUÉS de disparar
    if (globalState.availableArrows <= 0 && !this.isWarningActive) {
      this.time.delayedCall(1000, () => {
        // Verificar de nuevo por si acaso golpeó el target correcto en ese tiempo
        if (globalState.availableArrows <= 0 && !this.isWarningActive && this.scene.isActive()) {
          this.warnAnyArrow();
        }
      });
    }
  }

  update(_time: number, delta: number) {
    // Actualizar mirilla (solo el raton)
    this.crosshair.setPosition(this.input.activePointer.x, this.input.activePointer.y);

    // --- Rotación Arco/Flecha (Solo Ratón) ---
    if (!this.isDialogActive && !this.keyboardChargeSource && this.input.activePointer.primaryDown) {
      const angle = Phaser.Math.Angle.Between(
        this.bow.x,
        this.bow.y,
        this.input.activePointer.x,
        this.input.activePointer.y
      );
      // Aplicar rotación
      this.loadedArrow.setRotation(angle); // Flecha apunta al cursor
      this.bow.setRotation(angle + Math.PI / 2);

      // Dibujar trayectoria predictiva (Solo Ratón)
      if (this.isDrawingTrajectory && this.isCharging) {
        this.trajectoryLine.clear();
        this.trajectoryLine.lineStyle(3, 0xff0000, 0.5);
        const startPoint = new Phaser.Math.Vector2(this.bow.x, this.bow.y);
        const endPoint = new Phaser.Math.Vector2(this.input.activePointer.x, this.input.activePointer.y);
        const powerFactor = Phaser.Math.Clamp(this.chargeTime / this.maxChargeTime, 0, 1);
        const predictedLength = Phaser.Math.Linear(50, 250, powerFactor);
        const direction = endPoint.clone().subtract(startPoint).normalize();
        const predictedEnd = startPoint.clone().add(direction.scale(predictedLength));
        this.trajectoryLine.strokeLineShape(
          new Phaser.Geom.Line(startPoint.x, startPoint.y, predictedEnd.x, predictedEnd.y)
        );
      }
    } else if (this.keyboardChargeSource && this.focusedTargetIndex !== -1) {
      // --- Rotación Arco/Flecha (Solo Teclado) ---
      // Apuntar al objetivo enfocado
      const activeTargets = globalState.targets.filter((t) => t.sprite?.active);
      if (this.focusedTargetIndex < activeTargets.length) {
        const targetSprite = activeTargets[this.focusedTargetIndex].sprite;
        if (targetSprite) {
          const angle = Phaser.Math.Angle.Between(this.bow.x, this.bow.y, targetSprite.x, targetSprite.y);
          this.loadedArrow.setRotation(angle);
          this.bow.setRotation(angle + Math.PI / 2);
        }
      }
      this.trajectoryLine.clear(); // No mostrar trayectoria con teclado
    }

    // --- Animación de Carga ---
    if (this.isCharging) {
      this.chargeTime += delta;
      this.chargeTime = Phaser.Math.Clamp(this.chargeTime, 0, this.maxChargeTime);
      // Escala basada en la carga (aplicar a ambos modos)
      const chargeRatio = this.chargeTime / this.maxChargeTime;
      const bowScaleFactor = 1 + chargeRatio * 0.3;
      const arrowScaleFactor = 1 + chargeRatio * 0.1;
      this.bow.setScale(this.baseBowScale * bowScaleFactor);
      this.loadedArrow.setScale(0.2 * arrowScaleFactor);
    }

    // --- Limpieza de Flechas Fuera de Pantalla ---
    this.arrowPool.getChildren().forEach((arrowObj) => {
      const arrow = arrowObj as Phaser.Physics.Arcade.Image;
      if (!arrow.active) return; // Saltar inactivas

      if (arrow.body && arrow.body.enable) {
        if (!this.physics.world.bounds.contains(arrow.x, arrow.y)) {
          this.killArrow(arrow);
        }
      }
    });
  }

  shutdown() {
    // Limpiar listeners de teclado para evitar fugas si la escena se reinicia
    this.input.keyboard?.off('keydown-TAB');
    this.input.keyboard?.off('keydown-SPACE');
    this.input.keyboard?.off('keyup-SPACE');
    this.input.keyboard?.off('keydown-ESC');

    // Limpiar listeners de puntero
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_UP);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.POINTER_OVER);

    // Destruir elementos gráficos creados
    if (this.keyboardFocusIndicator) this.keyboardFocusIndicator.destroy();
    if (this.trajectoryLine) this.trajectoryLine.destroy();

    // Destruir DOM elements si aún existen
    if (this.bgDialog) this.bgDialog.destroy();
    const warnDialog = this.children.list.find(
      (child) => child instanceof Phaser.GameObjects.DOMElement && child.node.id === 'warn-dialog'
    );
    if (warnDialog) warnDialog.destroy();
    if (this.openButton) this.openButton.destroy();

    // Limpiar referencias
    this.bgDialog = null as unknown as Phaser.GameObjects.DOMElement;
    this.dialogContainer = null as unknown as HTMLDivElement;
    this.textElement = null;
    this.showMoreButton = null;
    this.previouslyFocusedElement = null;

    globalState.targets.forEach((tInfo) => {
      if (tInfo.sprite) {
        const button = tInfo.sprite.getData('labelButton') as Phaser.GameObjects.DOMElement;
        if (button) button.destroy();
        // Destruir sprite si aún existe
        if (tInfo.sprite.scene) tInfo.sprite.destroy();
      }
    });
    this.event = undefined; // Limpiar referencia al evento de teclado
    globalState.targets = []; // Vaciar el array
  }
}