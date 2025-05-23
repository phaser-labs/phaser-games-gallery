import Phaser from 'phaser';

// Asegúrate que ICardGameObject y IGridConfig estén definidas en este path o ajústalo
import { ICardGameObject, IGridConfig } from '../utils/types';

import { createCard } from './createCard';


// Helper para la región ARIA Live
const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
};

export class PlayScene extends Phaser.Scene {
  cardNames: string[] = ['card-0', 'card-1', 'card-2', 'card-3', 'card-4', 'card-5'];
  cards: ICardGameObject[] = [];
  cardOpened: ICardGameObject | undefined = undefined;
  canMove: boolean = false;
  lives: number = 0;

  gridConfiguration: IGridConfig = {
    x: 113,
    y: 102,
    paddingX: 10,
    paddingY: 10
  };

  private heartsGO: Phaser.GameObjects.Image[] = [];
  private winnerTextGO: Phaser.GameObjects.Text | undefined;
  private gameOverTextGO: Phaser.GameObjects.Text | undefined;
  private volumeIconGO: Phaser.GameObjects.Image | undefined;

  // Accesibilidad
  private focusedCardIndex: number = -1;
  private keyboardFocusIndicator: Phaser.GameObjects.Graphics | undefined;
  private readonly CARDS_PER_ROW: number = 4;
  private isTitleFocused: boolean = false;
  private titleTextGO: Phaser.GameObjects.Text | undefined;
  private backgroundGO: Phaser.GameObjects.Image | undefined; // Para referenciar el background inicial

  constructor() {
    super({
      key: 'Play'
    });
  }

  init(): void {
    this.cameras.main.fadeIn(500);
    this.lives = 8;
    this.cardOpened = undefined;
    this.cards = [];
    this.heartsGO = [];
    this.canMove = false;
    this.isTitleFocused = false; // Se establecerá en true en create
    this.focusedCardIndex = -1;
    if (this.keyboardFocusIndicator) this.keyboardFocusIndicator.setVisible(false);
    if (this.titleTextGO) this.titleTextGO.destroy(); // Limpiar de reinicios previos
    if (this.backgroundGO) this.backgroundGO.destroy(); // Limpiar de reinicios previos
    this.titleTextGO = undefined;
    this.backgroundGO = undefined;
    this.volumeButton();

   
  }

  create(): void {
    this.backgroundGO = this.add
      .image(this.gridConfiguration.x - 130, this.gridConfiguration.y + 50, 'background-init')
      .setOrigin(0)
      .setScale(0.9);

       announce('Fondo del juego, con 12 cartas distribuidas en 4 filas y 3 columnas. Tienes que recoger todas las parejas.');  

    this.titleTextGO = this.add
      .text(
        this.sys.game.scale.width / 2,
        this.sys.game.scale.height / 2,
        'Juego de Memoria\nHaz clic para jugar', // Texto actualizado
        { align: 'center', strokeThickness: 4, fontSize: '36px', fontStyle: 'bold', color: '#8c7ae6' }
      )
      .setOrigin(0.5)
      .setDepth(3)
      .setInteractive();

    this.isTitleFocused = true;
    this.updateTitleFocusVisual();

    const startGameAction = () => {
      if (!this.titleTextGO || !this.titleTextGO.scene) return; // Prevenir doble ejecución o error si ya se destruyó

      this.sound.play('whoosh', { volume: 1.3 });
      this.isTitleFocused = false; 
      this.updateTitleFocusVisual(); 

      this.add.tween({
        targets: this.titleTextGO,
        ease: 'Bounce.InOut',
        y: -1000,
        onComplete: () => {
          this.titleTextGO?.destroy();
          this.titleTextGO = undefined;
          if (!this.sound.get('theme-song')?.isPlaying) {
            this.sound.play('theme-song', { loop: true, volume: 0.05 });
          }
          this.startGame();
        }
      });
      if (this.backgroundGO) {
        this.add.tween({
          targets: this.backgroundGO,
          ease: 'Bounce.InOut',
          y: -1000,
          onComplete: () => {
            this.backgroundGO?.destroy();
            this.backgroundGO = undefined;
          }
        });
      }
    };

    this.titleTextGO.on(Phaser.Input.Events.POINTER_DOWN, startGameAction);
    this.titleTextGO.on(Phaser.Input.Events.POINTER_OVER, () => {
      if (this.titleTextGO && this.titleTextGO.scene) this.titleTextGO.setColor('#9c88ff');
      this.input.setDefaultCursor('pointer');
    });
    this.titleTextGO.on(Phaser.Input.Events.POINTER_OUT, () => {
      if (this.titleTextGO && this.titleTextGO.scene) {
        if (this.isTitleFocused) {
          this.updateTitleFocusVisual(); // Reaplicar color de foco si el ratón sale
        } else {
          this.titleTextGO.setColor('#8c7ae6');
        }
      }
      this.input.setDefaultCursor('default');
    });

  // Inicializar textos de victoria/derrota pero fuera de pantalla
this.winnerTextGO = this.add
  .text(this.sys.game.scale.width / 2, -1000, '¡GANASTE!', {
    align: 'center',
    strokeThickness: 4,
    fontSize: '40px',
    fontStyle: 'bold',
    color: '#8c7ae6'
  })
  .setOrigin(0.5)
  .setDepth(3)
  .setInteractive();

this.gameOverTextGO = this.add
  .text(this.sys.game.scale.width / 2, -1000, '¡PERDISTE!\nHaz clic para \nvolver a jugar', {
    align: 'center',
    strokeThickness: 4,
    fontSize: '40px',
    fontStyle: 'bold',
    color: '#ff0000'
  })
  .setName('gameOverText')
  .setDepth(3)
  .setOrigin(0.5)
  .setInteractive();

    this.winnerTextGO.on(Phaser.Input.Events.POINTER_DOWN, () => this.handleEndGameTextClick(this.winnerTextGO));
    this.gameOverTextGO.on(Phaser.Input.Events.POINTER_DOWN, () => this.handleEndGameTextClick(this.gameOverTextGO));
    this.winnerTextGO.on(Phaser.Input.Events.POINTER_OVER, () => {
      if (this.winnerTextGO && this.winnerTextGO.scene) this.winnerTextGO.setColor('#9c88ff');
      this.input.setDefaultCursor('pointer');
    });

    this.keyboardFocusIndicator = this.add.graphics().setVisible(false).setDepth(2);
    this.keyboardFocusIndicator.lineStyle(4, 0xffff00, 1);

    // --- MANEJADORES DE EVENTOS GLOBALES DE TECLADO ---
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.isTitleFocused && this.titleTextGO && this.titleTextGO.scene) {
        startGameAction();
      } else if (!this.isTitleFocused && this.canMove) {
        this.selectFocusedCard();
      }
    });
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.isTitleFocused && this.titleTextGO && this.titleTextGO.scene) {
        startGameAction();
      } else if (!this.isTitleFocused) {
        if (this.canMove) this.selectFocusedCard();
      }
    });

    const moveCardFocusIfActive = (dx: number, dy: number) => {
      if (!this.isTitleFocused && this.canMove) { // Solo mover foco de cartas si el juego ha empezado y se puede mover
        this.moveFocus(dx, dy);
      }
    };
    this.input.keyboard?.on('keydown-UP', () => moveCardFocusIfActive(0, -1));
    this.input.keyboard?.on('keydown-DOWN', () => moveCardFocusIfActive(0, 1));
    this.input.keyboard?.on('keydown-LEFT', () => moveCardFocusIfActive(-1, 0));
    this.input.keyboard?.on('keydown-RIGHT', () => moveCardFocusIfActive(1, 0));
    this.input.keyboard?.on('keydown-W', () => moveCardFocusIfActive(0, -1));
    this.input.keyboard?.on('keydown-S', () => moveCardFocusIfActive(0, 1));
    this.input.keyboard?.on('keydown-A', () => moveCardFocusIfActive(-1, 0));
    this.input.keyboard?.on('keydown-D', () => moveCardFocusIfActive(1, 0));
    // -----------------------------------------------------------------
  }

  private updateTitleFocusVisual(): void {
    if (this.titleTextGO && this.titleTextGO.scene) { // Verificar que no esté destruido
      if (this.isTitleFocused) {
        this.titleTextGO.setColor('#8c7ae6'); 
        this.titleTextGO.setScale(1.05 * 0.5); 
                                            
                                            
        this.titleTextGO.setScale(1.05);
      } else {
        this.titleTextGO.setColor('#4f4485');
        this.titleTextGO.setScale(1);
      }
    }
  }


  private handleEndGameTextClick(textObject?: Phaser.GameObjects.Text): void {
    if (!textObject || !textObject.scene) return;
    this.sound.play('whoosh', { volume: 1.3 });
    this.add.tween({
      targets: textObject,
      ease: 'Bounce.InOut',
      y: -1000,
      onComplete: () => {
        this.restartGame();
      }
    });
  }

  restartGame(): void {
    this.cardOpened = undefined;
    this.focusedCardIndex = -1;
    if (this.keyboardFocusIndicator) this.keyboardFocusIndicator.setVisible(false);
    this.isTitleFocused = false; // Asegurar que el título no quede enfocado al reiniciar

    // Destruir objetos específicos si aún existe
    this.cards.forEach(card => card.gameObject?.destroy()); // Destruir las cartas viejas
    this.cards = [];
    this.heartsGO.forEach(heart => heart?.destroy());
    this.heartsGO = [];
    this.winnerTextGO?.destroy();
    this.winnerTextGO = undefined;
    this.gameOverTextGO?.destroy();
    this.gameOverTextGO = undefined;

    this.scene.restart(); // Esto llamará a init() y luego a create()
  }

  createGridCards(): ICardGameObject[] {
    const gridCardNames: string[] = Phaser.Utils.Array.Shuffle([...this.cardNames, ...this.cardNames]);
    // Limpiar el array `this.cards` antes de llenarlo de nuevo
    this.cards = [];

    gridCardNames.forEach((name: string, index: number) => {
      const newCard: ICardGameObject = createCard({
        scene: this,
        x: this.gridConfiguration.x + (98 + this.gridConfiguration.paddingX) * (index % this.CARDS_PER_ROW),
        y: -200,
        frontTexture: name,
        cardName: name
      });
      this.add.tween({
        targets: newCard.gameObject,
        duration: 800,
        delay: index * 100,
        onStart: () => this.sound.play('card-slide', { volume: 1.2 }),
        y: this.gridConfiguration.y + (128 + this.gridConfiguration.paddingY) * Math.floor(index / this.CARDS_PER_ROW)
      });
      this.cards.push(newCard);
    });
    return this.cards; 
  }

  createHearts(): Phaser.GameObjects.Image[] {
    this.heartsGO.forEach((h) => { if (h && h.scene) h.destroy() });
    this.heartsGO = [];
    for (let i = 0; i < this.lives; i++) {
      const heart: Phaser.GameObjects.Image = this.add
        .image(0, 20, 'heart')
        .setOrigin(0, 0.5)
        .setScale(1.5);
      heart.x = this.sys.game.config.width as number + 100;
      this.add.tween({
        targets: heart,
        ease: 'Expo.InOut',
        duration: 1000,
        delay: 500 + i * 150,
        x: 100 + 40 * i 
      });
      this.heartsGO.push(heart);
    }
    return this.heartsGO;
  }

private volumeButton(): void {
// Si ya existe un botón, solo actualizamos su estado visual
if (this.volumeIconGO && this.volumeIconGO.scene) {
// Comprobar que no esté destruido

// Actualizar textura y alfa basado en el estado actual de mute
if (this.sound.mute) {
this.volumeIconGO.setTexture('volume-icon');
this.volumeIconGO.setAlpha(0.5);
} else {
this.volumeIconGO.setAlpha(1);
this.volumeIconGO.setTexture('volume-icon_off');
}
return; 
}
const initialTexture = this.sound.mute ? 'volume-icon_off' : 'volume-icon';
const initialAlpha = this.sound.mute ? 0.5 : 1;

this.volumeIconGO = this.add
  .image(35, 35, initialTexture)
  .setName('volume-icon')
  .setInteractive()
  .setScale(0.06)
  .setAlpha(initialAlpha)
  .setDepth(5);

// Evento POINTER_DOWN para alternar el mute
this.volumeIconGO.on(Phaser.Input.Events.POINTER_DOWN, () => {
  if (!this.volumeIconGO || !this.volumeIconGO.scene) return; // Chequeo de seguridad
  // Alternar el estado de mute
  this.sound.mute = !this.sound.mute;

  // Actualizar la apariencia del botón según el nuevo estado de mute
  if (this.sound.mute) {
    this.volumeIconGO.setTexture('volume-icon');
        this.volumeIconGO.setAlpha(1);
    this.sound.mute = false; // Si también quieres afectar el volumen global
  } else {
    this.volumeIconGO.setTexture('volume-icon_off');
     this.volumeIconGO.setAlpha(0.5);
    this.sound.mute = true;

  }
});

this.volumeIconGO.on(Phaser.Input.Events.POINTER_OVER, () => {
  this.input.setDefaultCursor('pointer');
});

this.volumeIconGO.on(Phaser.Input.Events.POINTER_OUT, () => {
  this.input.setDefaultCursor('default');
});
}

  private updateKeyboardFocusVisual(): void {
    if (!this.keyboardFocusIndicator || !this.keyboardFocusIndicator.scene) return;

    if (this.focusedCardIndex >= 0 && this.focusedCardIndex < this.cards.length) {
      const card = this.cards[this.focusedCardIndex];
      if (card && card.gameObject && card.gameObject.scene) {
        const plane = card.gameObject as Phaser.GameObjects.Plane;
        const width = plane.displayWidth;
        const height = plane.displayHeight;
        const x = plane.x - width * plane.originX;
        const y = plane.y - height * plane.originY;

         if (this.keyboardFocusIndicator) {
           this.keyboardFocusIndicator.clear();
         }
        this.keyboardFocusIndicator.lineStyle(4, 0xffff00, 1);
        this.keyboardFocusIndicator.strokeRect(x, y, width, height);
        this.keyboardFocusIndicator.setVisible(true);
      } else {
        this.keyboardFocusIndicator.setVisible(false);
      }
    } else {
      this.keyboardFocusIndicator.setVisible(false);
    }
  }

  private moveFocus(dx: number, dy: number): void {
    if (this.cards.length === 0) { // No hay cartas para enfocar
        this.focusedCardIndex = -1;
        this.updateKeyboardFocusVisual();
        return;
    }

    let newIndex = this.focusedCardIndex;
    const numCards = this.cards.length;

    if (newIndex === -1) { // Si no hay foco, empezar en la primera carta
      newIndex = 0;
    } else {
      const currentRow = Math.floor(newIndex / this.CARDS_PER_ROW);
      const currentCol = newIndex % this.CARDS_PER_ROW;

      if (dx !== 0) { // Movimiento horizontal
        let newCol = currentCol + dx;
        // Permitir "wrap-around" en la fila
        if (newCol < 0) newCol = this.CARDS_PER_ROW - 1;
         if (newCol >= this.CARDS_PER_ROW) newCol = 0;
        newIndex = currentRow * this.CARDS_PER_ROW + newCol;

        // O sin wrap-around, solo clamp en la fila
         newCol = Phaser.Math.Clamp(newCol, 0, this.CARDS_PER_ROW - 1);
         newIndex = currentRow * this.CARDS_PER_ROW + newCol;
         // Asegurar que el nuevo índice no exceda el total de cartas si la última fila no está llena
         newIndex = Math.min(newIndex, numCards -1);

      }
      if (dy !== 0) { // Movimiento vertical
        const newRow = currentRow + dy;
        // newIndex = newRow * this.CARDS_PER_ROW + currentCol; // Esto puede ir a un índice no existente si la columna no existe en esa fila

        // Calcular el nuevo índice y luego hacer clamp
        const potentialNewIndex = newRow * this.CARDS_PER_ROW + currentCol;
        if (potentialNewIndex >= 0 && potentialNewIndex < numCards) {
            newIndex = potentialNewIndex;
        } else if (potentialNewIndex < 0) { // Intenta ir a la última fila, misma columna
            const lastRow = Math.floor((numCards -1) / this.CARDS_PER_ROW);
            newIndex = lastRow * this.CARDS_PER_ROW + currentCol;
            if (newIndex >= numCards) newIndex = numCards -1; // Si esa columna no existe en la última fila
        } else { // Intenta ir a la primera fila, misma columna
            newIndex = currentCol; // Esto es 0 * CARDS_PER_ROW + currentCol
            if (newIndex >= numCards) newIndex = 0; // Si la primera fila no tiene esa columna (improbable para col 0)
        }
      }
    }
    // Clamp final para asegurar que está dentro del array de cartas existentes
    this.focusedCardIndex = Phaser.Math.Clamp(newIndex, 0, numCards - 1);
    this.updateKeyboardFocusVisual();
  }

  private selectFocusedCard(): void {
    if (this.focusedCardIndex < 0 || this.focusedCardIndex >= this.cards.length) return;
    const card = this.cards[this.focusedCardIndex];
    if (card && card.gameObject && card.gameObject.scene) {
      this.handleCardInteraction(card);
    }
  }

  private handleCardInteraction(card: ICardGameObject): void {
    if (!this.canMove || !card || !card.gameObject || !card.gameObject.scene) {
        if(!this.canMove && card && this.cardOpened?.gameObject !== card.gameObject) {
            // Si no se puede mover pero se intenta voltear una carta diferente a la abierta (ej. durante animación de otra)
            // no hacer nada y no cambiar canMove.
        } else {
            this.canMove = true; // Permitir movimiento si la interacción fue inválida o sobre la misma carta
        }
        return;
    }

    this.canMove = false;

    if (this.cardOpened) {
      if (this.cardOpened.gameObject === card.gameObject) {
        this.canMove = true;
        return;
      }
      card.flip(() => {
        if (!this.cardOpened || !this.cardOpened.gameObject.scene) { // cardOpened pudo ser destruida
          this.canMove = true;
          this.checkGameEndConditions();
          return;
        }
        if (this.cardOpened.cardName === card.cardName) {
          this.sound.play('card-match');
          // Guardar referencia para el filtro
          const openedCardGameObject = this.cardOpened.gameObject;
          const currentCardGameObject = card.gameObject;

          this.cardOpened.destroy();
          card.destroy();

          this.cards = this.cards.filter(c => c.gameObject !== openedCardGameObject && c.gameObject !== currentCardGameObject);

          if (this.focusedCardIndex !== -1 &&
             (this.cards[this.focusedCardIndex]?.gameObject === openedCardGameObject ||
              this.cards[this.focusedCardIndex]?.gameObject === currentCardGameObject ||
              !this.cards[this.focusedCardIndex])) { // Si la carta enfocada fue una de las destruidas o el array cambió
                this.focusedCardIndex = (this.cards.length > 0) ? Math.min(this.focusedCardIndex, this.cards.length - 1) : -1;
                if (this.focusedCardIndex === -1 && this.cards.length > 0) this.focusedCardIndex = 0; // Enfocar la primera si hay
          }
          this.cardOpened = undefined;
          this.canMove = true;
        } else {
          this.sound.play('card-mismatch', { volume: 1.5 });
          this.cameras.main.shake(100, 0.005); // Reducir un poco la intensidad del shake
          this.cameras.main.flash(150, 255, 0, 0, false); // Flash más sutil

          this.lives -= 1;
          const lastHeart = this.heartsGO.pop();
          if (lastHeart && lastHeart.scene) {
            this.add.tween({ targets: lastHeart, alpha: 0, duration: 300, onComplete: () => lastHeart.destroy() });
          }
          card.flip();
          if (this.cardOpened && this.cardOpened.gameObject.scene) { // Asegurar que cardOpened no fue destruida
              this.cardOpened.flip(() => {
                this.cardOpened = undefined;
                this.canMove = true;
                this.checkGameEndConditions(); // Mover aquí para que se chequee después de que canMove sea true
              });
          } else {
              this.cardOpened = undefined;
              this.canMove = true;
          }
        }
        if(this.canMove) this.updateKeyboardFocusVisual(); // Actualizar foco si el jugador ya puede mover
        this.checkGameEndConditions();
      });
    } else {
      card.flip(() => {
        this.canMove = true;
        this.updateKeyboardFocusVisual(); // Actualizar foco después de voltear la primera carta
      });
      this.cardOpened = card;
    }
  }

  private checkGameEndConditions(): void {
    if (!this.canMove && this.lives > 0 && this.cards.length > 0) {
        // Si no se puede mover pero el juego no ha terminado, no hacer nada aún
        return;
    }
    if (this.lives === 0 && this.gameOverTextGO && this.gameOverTextGO.scene) {
      this.sound.play('whoosh', { volume: 1.3 });
      this.add.tween({ targets: this.gameOverTextGO, ease: 'Bounce.Out', y: this.sys.game.scale.height / 2 });
      this.canMove = false;
      this.clearKeyboardFocus();
    } else if (this.cards.length === 0 && this.winnerTextGO && this.winnerTextGO.scene) {
      this.sound.play('whoosh', { volume: 1.3 });
      this.sound.play('victory');
      this.add.tween({ targets: this.winnerTextGO, ease: 'Bounce.Out', y: this.sys.game.scale.height / 2 });
      this.canMove = false;
      this.clearKeyboardFocus();
    }
  }

  private clearKeyboardFocus(): void {
    this.focusedCardIndex = -1;
    if (this.keyboardFocusIndicator && this.keyboardFocusIndicator.scene) {
      this.keyboardFocusIndicator.setVisible(false);
    }
  }
private getInteractiveChildren(): Phaser.GameObjects.GameObject[] {
const interactive: Phaser.GameObjects.GameObject[] = [];
this.children.each((child: Phaser.GameObjects.GameObject) => {
if (child.input?.enabled) {
interactive.push(child);
}
});
return interactive;
}

  startGame(): void {
    this.isTitleFocused = false; // Asegurar que el título ya no esté enfocado
    this.heartsGO = this.createHearts();
    this.cards = this.createGridCards(); // createGridCards ahora actualiza this.cards directamente

    if (this.cards.length === 0) { // Caso borde: no se crearon cartas
        this.canMove = true; // O manejar un estado de error
        return;
    }

    this.add.image(-220, -60, 'background').setOrigin(0, 0).setScale(0.2).setDepth(-1);

    if (this.cards.length > 0) {
      this.focusedCardIndex = 0;
      this.updateKeyboardFocusVisual();
    }

    // Dar tiempo para que las cartas entren
    this.time.delayedCall(800 + 200 * (this.cardNames.length * 2), () => { // Usar el total de cartas para el delay
      this.canMove = true;
    });

this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
  if (this.canMove) {
    // Chequear si el puntero está sobre algún objeto interactivo general
    const activeGOs = this.input.manager.hitTest(pointer, this.getInteractiveChildren(), this.cameras.main);
    if (activeGOs.length > 0) {
      this.input.setDefaultCursor('pointer');
    } else {
      this.input.setDefaultCursor('default');
    }
  }
});

 this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
  if (!this.canMove || this.cards.length === 0) return;
  const hitCards = this.input.manager.hitTest(pointer, this.cards.map((c) => c.gameObject), this.cameras.main);
  if (hitCards.length > 0) {
    const hitCardPlane = hitCards[0] as Phaser.GameObjects.Plane;
    const card = this.cards.find((c) => c.gameObject === hitCardPlane);
    if (card) {
      // Al hacer clic con el ratón, actualizamos el foco del teclado a esa carta
      const clickedCardIndex = this.cards.findIndex(c => c.gameObject === card.gameObject);
      if (clickedCardIndex !== -1) {
          this.focusedCardIndex = clickedCardIndex;
          this.updateKeyboardFocusVisual();
           this.keyboardFocusIndicator?.clear();
          
      }
      this.handleCardInteraction(card); // Usar la función refactorizada
    } else { this.canMove = true; }  this.keyboardFocusIndicator?.clear();
  } else { this.canMove = true; }
});
  }
}