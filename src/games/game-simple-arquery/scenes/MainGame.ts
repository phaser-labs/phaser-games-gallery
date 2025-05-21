import Phaser from 'phaser';

import PhaserGame from '../main/main';
import { globalState } from '../utils/globalState';
import { Question } from '../utils/types';

// Constantes para configuración
const TARGET_LINE_Y = 230;
const BOW_LINE_Y = 500;
const TARGET_VERTICAL_OFFSET = 0;
const ARROW_SPEED = -300;
const BOW_MOVE_SPEED = 600;

// Helper para la región ARIA Live
const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
};

export class MainScene extends Phaser.Scene {
  // Propiedades de la escena
  private backgroundImg!: Phaser.GameObjects.Image;
  private questionsContainer?: Phaser.GameObjects.DOMElement;
  private bowImage!: Phaser.GameObjects.Image;
  private targetsGroup!: Phaser.Physics.Arcade.Group;
  private arrowsGroup!: Phaser.Physics.Arcade.Group;

  // Datos de la pregunta actual
  private currentQuestionIndex!: number;
  private currentQuestion!: Question;
  private correctLetter!: 'a' | 'b' | 'c' | 'd';

  private gameEvents!: Phaser.Events.EventEmitter;

  // accesibilidad por teclado
  private focusableLetterButtons: HTMLButtonElement[] = [];
  private currentFocusIndex: number = -1;
  private keyboardNavigationActive: boolean = false;

  constructor() {
    super('MainScene');
  }

  init(data: { questionIndex?: number }) {
    this.currentQuestionIndex = data.questionIndex !== undefined ? data.questionIndex : 0;
    const questionFromState = globalState.questions[this.currentQuestionIndex];

    if (questionFromState) {
      this.currentQuestion = questionFromState;
      this.correctLetter = this.currentQuestion.correctAnswer;
    } else {
      console.error(`MainScene Error: Pregunta no encontrada para el índice ${this.currentQuestionIndex}.`);
      if (this.gameEvents) this.gameEvents.emit('error', 'Pregunta no encontrada');
      this.scene.start('PreloadScene');
      return;
    }

    const phaserGameInstance = this.game as PhaserGame;
    if (phaserGameInstance && phaserGameInstance.gameEvents) {
      this.gameEvents = phaserGameInstance.gameEvents;
const gameEvents = phaserGameInstance.gameEvents;
gameEvents.emit('gameInit');
      
    } else {
      console.error('MainScene Error: gameEvents no está disponible!');
      this.scene.start('PreloadScene');
      return;
    }

    // Resetea el estado de foco para la nueva escena/pregunta
    this.focusableLetterButtons = [];
    this.currentFocusIndex = -1;
    this.keyboardNavigationActive = false;
  }

  create() {
    if (!this.currentQuestion) {
      console.error('MainScene: No se pudo crear la escena porque currentQuestion no está definida.');
      return;
    }

    this.backgroundImg = this.add.image(0, 0, 'background').setOrigin(0, 0);
    this.backgroundImg.displayWidth = this.cameras.main.width;
    this.backgroundImg.displayHeight = this.cameras.main.height;
    this.backgroundImg.setDepth(-10);

    this.questionsBar();
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

    this.targetsGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    this.arrowsGroup = this.physics.add.group({ allowGravity: false });

    this.createTargets();
    this.createBow();
    this.setupInput(); // Input de mouse Y TECLADO
    this.setupCollisions();

    this.gameEvents.on('showEndScene', this.handleShowEndScene, this);
    this.gameEvents.emit('phaserStartsGame');
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    if (this.focusableLetterButtons.length > 0) {
      this.changeFocus(0);
    }
  }
  private handleShowEndScene() {
    this.scene.start('EndScene');
  }
  // Función para crear los Objetivos
  private createTargets() {
    this.focusableLetterButtons = []; // Limpiar el arreglo de botones
    const options = Object.entries(this.currentQuestion.options);
    const numTargets = options.length;
    const screenWidth = this.cameras.main.width;
    const margin = screenWidth * 0.15;
    const usableWidth = screenWidth - margin * 2;
    const spacing = numTargets > 1 ? usableWidth / (numTargets - 1) : 0;

    options.forEach(([key, textContent], index) => {
      const targetX = numTargets === 1 ? screenWidth / 2 : margin + index * spacing;
      const targetY = TARGET_LINE_Y + TARGET_VERTICAL_OFFSET;

      const target = this.targetsGroup.create(targetX, targetY, 'target') as Phaser.Physics.Arcade.Sprite;
      target.setOrigin(0.5, 0.5).setDepth(1);
      target.setData('optionKey', key);
      target.setData('optionText', textContent);
      target.setData('originalX', targetX);

      // --- Botón DOM para la letra ---
      const letterButtonDomY = targetY - target.displayHeight / 2 - 35; 
      const letterButtonDom = this.add
        .dom(targetX - 15, letterButtonDomY, 'button')
        .setOrigin(0.5, 0.5);

      const letterButtonNode = letterButtonDom.node as HTMLButtonElement;
      letterButtonNode.classList.add('game-arquery-option-letter');
      letterButtonNode.textContent = key.toUpperCase();
      letterButtonNode.ariaLabel = `Opción ${key.toUpperCase()}: ${textContent.toString()}`;
      letterButtonNode.title = textContent.toString();
      letterButtonNode.tabIndex = 0;

      letterButtonNode.addEventListener('click', () => {
        this.fireArrow();
        this.keyboardNavigationActive = false; // Desactivar modo teclado si se usa mouse
      });

      // Listener de foco para los botones DOM
      letterButtonNode.addEventListener('focus', () => {
        this.keyboardNavigationActive = true; // Activar modo que se usa el teclado
        this.currentFocusIndex = this.focusableLetterButtons.indexOf(letterButtonNode);
        this.moveBowToTargetX(targetX, true);
      });
      // Imagen cord
      this.add
        .image(targetX, targetY + target.displayHeight / 2 - 80, 'cord')
        .setOrigin(0.5, 0)
        .setScale(0.4)
        .setDepth(0);

      // Texto para la opción
      const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
        fontSize: '18px',
        color: '#333333',
        align: 'left',
        fontStyle: 'bold',
        wordWrap: { width: 180, useAdvancedWrap: true }
      };

      const textBackgroundWidth = 200;
      const textBackgroundHeight = 120;
      const textContainerY = targetY + target.displayHeight / 2 + textBackgroundHeight / 2 + 25;

      const backgroundRectX = targetX - textBackgroundWidth / 2;
      const backgroundRectY = textContainerY - textBackgroundHeight / 2;
      const borderRadius = 10;

      const backgroundRect = this.add.graphics().setDepth(target.depth);
      backgroundRect.fillStyle(0xf9f9dc);
      backgroundRect.fillRoundedRect(
        backgroundRectX,
        backgroundRectY,
        textBackgroundWidth,
        textBackgroundHeight,
        borderRadius
      );
      backgroundRect.lineStyle(3, 0xdb8c64, 1);
      backgroundRect.strokeRoundedRect(
        backgroundRectX,
        backgroundRectY,
        textBackgroundWidth,
        textBackgroundHeight,
        borderRadius
      );

      const phaserTextOption = this.add
        .text(targetX, textContainerY - 5, textContent.toString(), textStyle)
        .setOrigin(0.5, 0.5);
      phaserTextOption.setDepth(target.depth + 1);
    });
  }

  private createBow() {
    const bowX = this.cameras.main.width / 2;
    const bowY = BOW_LINE_Y;
    this.bowImage = this.add.image(bowX, bowY, 'bow').setOrigin(0.5, 1);
    this.bowImage.setScale(0.7).setDepth(10);
  }

  private setupInput() {
    // --- INPUT DEL MOUSE ---
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
      // Si el mouse se mueve, desactivamos la navegación por teclado y quitamos el foco visual
      if (this.keyboardNavigationActive) {
        this.keyboardNavigationActive = false;
        this.removeFocusVisuals();
        if (this.currentFocusIndex !== -1 && this.focusableLetterButtons[this.currentFocusIndex]) {
          this.focusableLetterButtons[this.currentFocusIndex].blur();
        }
        this.currentFocusIndex = -1;
      }
      const bowHalfWidth = (this.bowImage.width * this.bowImage.scaleX) / 2;
      this.bowImage.x = Phaser.Math.Clamp(pointer.x, bowHalfWidth, this.cameras.main.width - bowHalfWidth);
    });

    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // Si se hace clic con el mouse, asumimos que no se está usando el teclado
      this.keyboardNavigationActive = false;
      this.removeFocusVisuals();
      this.fireArrow();
    });

    // --- INPUT DEL TECLADO ---
    this.input.keyboard?.on('keydown-LEFT', () => {
      this.navigateFocus(-1);
    });
    this.input.keyboard?.on('keydown-RIGHT', () => {
      this.navigateFocus(1);
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.keyboardNavigationActive && this.currentFocusIndex !== -1) {
        this.fireArrow();
      }
    });
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.keyboardNavigationActive && this.currentFocusIndex !== -1) {
        this.fireArrow();
      }
    });
  }
  // Manejo de la navegación por teclado
  private navigateFocus(direction: number) {
    if (this.focusableLetterButtons.length === 0) return;
    this.keyboardNavigationActive = true; // Marcar que se está usando el teclado

    let newFocusIndex = this.currentFocusIndex + direction;

    if (newFocusIndex >= this.focusableLetterButtons.length) {
      newFocusIndex = 0; // Volver al primero
    } else if (newFocusIndex < 0) {
      newFocusIndex = this.focusableLetterButtons.length - 1; // Ir al último
    }
    this.changeFocus(newFocusIndex);
  }
  private changeFocus(newIndex: number) {
    if (newIndex === this.currentFocusIndex || !this.focusableLetterButtons[newIndex]) return;

    // Quitar foco visual del anterior
    this.removeFocusVisuals();

    this.currentFocusIndex = newIndex;
    const newFocusedButton = this.focusableLetterButtons[this.currentFocusIndex];

    if (newFocusedButton) {
      newFocusedButton.focus();
    }
  }

  private removeFocusVisuals() {
    this.focusableLetterButtons.forEach((btn) => btn.classList.remove('focused-by-keyboard'));
  }

  private moveBowToTargetX(targetX: number, smooth: boolean = false) {
    if (smooth) {
      this.tweens.add({
        targets: this.bowImage,
        x: targetX,
        duration: (Math.abs(this.bowImage.x - targetX) / BOW_MOVE_SPEED) * 1000,
        ease: 'Sine.easeInOut'
      });
    } else {
      this.bowImage.x = targetX;
    }
  }

  private fireArrow() {
    const arrowStartY = this.bowImage.y - this.bowImage.height * this.bowImage.scaleY * 0.5;

    const arrow = this.arrowsGroup.create(this.bowImage.x, arrowStartY, 'arrow') as Phaser.Physics.Arcade.Sprite;

    if (!arrow.body) {
      console.error('¡La flecha no tiene cuerpo físico!');
    }
    arrow.setOrigin(0.5, 1);
    arrow.setScale(0.9);
    arrow.setDepth(this.bowImage.depth - 1);
    arrow.setVisible(true);
    arrow.setVelocityY(ARROW_SPEED);

    this.sound.play('arrowSound');
  }

  private setupCollisions() {
    // Detectar colisión entre flechas y objetivos
    this.physics.add.overlap(this.arrowsGroup, this.targetsGroup, this.handleArrowHitTarget, undefined, this);
  }

  // Función para cuando una flecha golpea un target
  private handleArrowHitTarget: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    arrowGameObject,
    targetGameObject
  ) => {
    const arrowSprite = arrowGameObject as Phaser.Physics.Arcade.Sprite;
    const targetSprite = targetGameObject as Phaser.Physics.Arcade.Sprite;

    arrowSprite.disableBody(true, true);

    this.sound.play('arrowHit', { volume: 0.5 });

    const hitOptionKey = targetSprite.getData('optionKey') as string;

    if (hitOptionKey === this.correctLetter) {
      this.sound.play('correct', { volume: 0.5 });
      if (this.gameEvents) {
        this.gameEvents.emit('feedback-modal', { type: 'success' });
        this.time.delayedCall(300, () => {
          if (this.gameEvents) this.gameEvents.emit('correctAnswer');
        });
      }
      this.tweens.add({
        targets: targetSprite,
        scale: targetSprite.scale * 1.2,
        alpha: 0,
        ease: 'Power2',
        duration: 300,
        onComplete: () => {}
      });
    } else {
      this.sound.play('incorrect', { volume: 0.2 });
      if (this.gameEvents) {
        this.gameEvents.emit('feedback-modal', { type: 'wrong' });
      }
      this.cameras.main.shake(100, 0.005);
      this.tweens.add({
        targets: targetSprite,
        x: {
          from: targetSprite.x - 5,
          to: targetSprite.x + 5,
          duration: 50,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: 2
        },
        onComplete: () => {
          targetSprite.setX(targetSprite.getData('originalX'));
        }
      });
    }
  };

  // --- Barra de Preguntas ---
  private questionsBar() {
    if (this.questionsContainer) {
      this.questionsContainer.destroy();
    }

    announce(`Pregunta ${this.currentQuestionIndex + 1} de ${globalState.questions.length}`);

    this.time.delayedCall(1000, () => {
      announce(`Pregunta es ${currentQuestion.question}`);
    });

    this.questionsContainer = this.add.dom(0, 8, 'div').setOrigin(0.5, 0).setDepth(20);
    this.questionsContainer.node.classList.add('game-arquery-questions-container');

    const currentQuestion = globalState.questions[this.currentQuestionIndex];

    if (currentQuestion) {
      const questionHTML = `
        <div class="game-arquery-questions-content">
          <p class="question-text">${currentQuestion.question}</p>
        </div>
      `;

      this.questionsContainer.node.innerHTML = questionHTML;
    } else {
      console.warn(`No se encontró la pregunta en el índice: ${this.currentQuestionIndex}`);
      this.questionsContainer.node.innerHTML = `
        <div class="game-arquery-questions-content">
          <p>Error: Pregunta no encontrada.</p>
        </div>
      `;
    }
  }

  update() {
    this.arrowsGroup.children.each((arrowObject) => {
      const arrow = arrowObject as Phaser.Physics.Arcade.Sprite;
      if (arrow && arrow.body && arrow.y < -arrow.displayHeight) {
        arrow.destroy();
      }
      return null;
    });
  }
  private shutdown() {
    if (this.gameEvents) {
      this.gameEvents.off('showEndScene', this.handleShowEndScene, this);
    }
    this.input.off('pointermove');
    this.input.off('pointerdown');
    // Limpiar listeners de teclado globales de Phaser
    this.input.keyboard?.off('keydown-LEFT');
    this.input.keyboard?.off('keydown-RIGHT');
    this.input.keyboard?.off('keydown-SPACE');
    this.input.keyboard?.off('keydown-ENTER');
    // Limpiar listeners de input de mouse
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
  }
}
