import Phaser from 'phaser';

import { AudioManager } from '../managers';
import { ICardData, ICardDOM } from '../utils/types';


// Helper para la región ARIA Live polite
const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = message; }, 50);
  }
};

// Helper para la región ARIA Live assertive (eventos críticos)
const announceAssertive = (message: string) => {
  const announcer = document.getElementById('game-announcer-assertive');
  if (announcer) {
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = message; }, 50);
  }
};

export class PlayScene extends Phaser.Scene {
  cardNames: string[] = [];
  private cardImgMap: Map<string, string> = new Map();
  private cardBackImg: string = '';
  /** Callback externo para reportar resultado de cada par */
  private onResult: ((isCorrect: boolean) => void) | undefined;

  /** Estado del grid DOM */
  cardsDOM: ICardDOM[] = [];
  cardOpenedDOM: ICardDOM | undefined = undefined;
  canMove: boolean = false;
  lives: number = 0;

  /** Elemento Phaser que contiene el grid de botones */
  private gridDOMElement: Phaser.GameObjects.DOMElement | undefined;
  private currentCols: number = 4;

  private heartsGO: Phaser.GameObjects.Image[] = [];
  private winnerTextGO: Phaser.GameObjects.DOMElement | undefined;
  private gameOverTextGO: Phaser.GameObjects.DOMElement | undefined;
  private audioManager!: AudioManager;

  // Navegación por teclado
  private focusedCardIndex: number = -1;
  private isTitleFocused: boolean = false;
  private titleTextGO: Phaser.GameObjects.DOMElement | undefined;
  private backgroundGO: Phaser.GameObjects.Image | undefined;
  private titleBtnplayGO: Phaser.GameObjects.DOMElement | undefined;

  constructor() {
    super({
      key: 'Play'
    });
  }

  init(): void {
    this.cameras.main.fadeIn(500);
    this.lives = 8;
    this.cardOpenedDOM = undefined;
    this.cardsDOM = [];
    this.heartsGO = [];
    this.canMove = false;
    this.focusedCardIndex = -1;
    this.isTitleFocused = false;

    if (this.audioManager) {
      this.audioManager.destroy();
    }

    // Leer datos de cartas desde el registro de Phaser
    const cardData: ICardData[] = this.game.registry.get('cardData') ?? [];
    const backEntry = cardData.find(c => c.name === 'card-back');
    this.cardBackImg = backEntry?.img ?? 'assets/game-memory-card/cards/card-back.png';
    this.cardImgMap = new Map(cardData.map(c => [c.name, c.img]));
    this.cardNames = cardData
      .filter(c => c.name !== 'card-back')
      .map(c => c.name);

    // Leer callback onResult desde el registro
    this.onResult = this.game.registry.get('onResult') ?? undefined;

    if (this.gridDOMElement) {
      this.gridDOMElement.destroy();
      this.gridDOMElement = undefined;
    }
    if (this.titleTextGO) this.titleTextGO.destroy();
    if (this.backgroundGO) this.backgroundGO.destroy();
    this.titleTextGO = undefined;
    this.backgroundGO = undefined;
  }

  create(): void {
    const { width } = this.scale;
    // Inicializar AudioManager
    this.audioManager = new AudioManager(this, {
      musicKey: 'theme-song',
      x: width as number - 40,
      y: 45,
      depth: 5,
      volume: 0.05
    });

    this.add.image(0, 0, 'background').setOrigin(0);

    this.backgroundGO = this.add
      .image(0, 15, 'background-init')
      .setOrigin(0);

       announce(`Fondo del juego, con ${this.cardNames.length * 2} cartas distribuidas. Tienes que recoger todas las parejas.`);  

    this.titleTextGO = this.add
      .dom(
        this.sys.game.scale.width / 2 - 2,
        this.sys.game.scale.height / 2 - 100
      )
      .createFromHTML(`
        <div class="memory-title-text">
          <h1>Juego de Memoria</h1>
        </div>
      `)
      .setOrigin(0.5);

     this.titleBtnplayGO = this.add.dom(
        this.sys.game.scale.width / 2,
        this.sys.game.scale.height / 2 + 90
      ).createFromHTML(`
        <button class="memory-title-play_btn" tabindex="0">
          <span class="memory-title-play_btn-text">Presiona para jugar</span>
        </button>
      `).setOrigin(0.5);

    this.isTitleFocused = true;
    this.updateTitleFocusVisual();

    const startGameAction = () => {
      if (!this.titleTextGO || !this.titleTextGO.scene || !this.titleBtnplayGO) return;

      this.audioManager.play('whoosh', { volume: 1.3 });
      this.isTitleFocused = false; 
      this.updateTitleFocusVisual(); 

      this.add.tween({
        targets: this.titleTextGO,
        ease: 'Bounce.InOut',
        y: -1000,
        onComplete: () => {
          this.titleTextGO?.destroy();
          this.titleTextGO = undefined;
          // La música ya está sonando desde el AudioManager
          this.startGame();
        }
      });
            this.add.tween({
        targets: this.titleBtnplayGO,
        ease: 'Bounce.InOut',
        y: -1000,
        onComplete: () => {
          this.titleBtnplayGO?.destroy();
          this.titleBtnplayGO = undefined;
          // La música ya está sonando desde el AudioManager  
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

    this.titleBtnplayGO.addListener('click');
    this.titleBtnplayGO.on('click', startGameAction);
    
    const titleElement = this.titleBtnplayGO.node as HTMLElement;
    titleElement.addEventListener('mouseenter', () => {
      titleElement.classList.add('hover');
      this.input.setDefaultCursor('pointer');
    });
    titleElement.addEventListener('mouseleave', () => {
      titleElement.classList.remove('hover');
      this.input.setDefaultCursor('default');
    });

  // Inicializar textos de victoria/derrotacion pero fuera de pantalla
    this.winnerTextGO = this.add
      .dom(this.sys.game.scale.width / 2, -1000)
      .createFromHTML(`
        <div class="memory-winner-text" tabindex="0">
          <h2>¡GANASTE!</h2>
          <p>Haz clic para volver a jugar</p>
        </div>
      `)
      .setOrigin(0.5)
      .setDepth(3);

    this.gameOverTextGO = this.add
      .dom(this.sys.game.scale.width / 2, -1000)
      .createFromHTML(`
        <div class="memory-gameover-text" tabindex="0">
          <h2>¡PERDISTE!</h2>
          <p>Haz clic para volver a jugar</p>
        </div>
      `)
      .setOrigin(0.5)
      .setDepth(3);

    this.winnerTextGO.addListener('click');
    this.gameOverTextGO.addListener('click');
    this.winnerTextGO.on('click', () => this.handleEndGameTextClick(this.winnerTextGO));
    this.gameOverTextGO.on('click', () => this.handleEndGameTextClick(this.gameOverTextGO));

    const winnerElement = this.winnerTextGO.node as HTMLElement;
    const gameOverElement = this.gameOverTextGO.node as HTMLElement;
    winnerElement.addEventListener('mouseenter', () => {
      winnerElement.classList.add('hover');
      this.input.setDefaultCursor('pointer');
    });
    winnerElement.addEventListener('mouseleave', () => {
      winnerElement.classList.remove('hover');
      this.input.setDefaultCursor('default');
    });
    gameOverElement.addEventListener('mouseenter', () => {
      gameOverElement.classList.add('hover');
      this.input.setDefaultCursor('pointer');
    });
    gameOverElement.addEventListener('mouseleave', () => {
      gameOverElement.classList.remove('hover');
      this.input.setDefaultCursor('default');
    });

    // eventos del teclado
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.isTitleFocused && this.titleTextGO && this.titleTextGO.scene) {
        startGameAction();
      } else if (!this.isTitleFocused && this.canMove) {
        this.selectFocusedCardDOM();
      }
    });
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.isTitleFocused && this.titleTextGO && this.titleTextGO.scene) {
        startGameAction();
      } else if (!this.isTitleFocused && this.canMove) {
        this.selectFocusedCardDOM();
      }
    });

    const moveCardFocusIfActive = (dx: number, dy: number) => {
      if (!this.isTitleFocused && this.canMove) {
        this.moveFocusDOM(dx, dy);
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
    if (this.titleTextGO && this.titleTextGO.scene) {
      const titleElement = this.titleTextGO.node as HTMLElement;
      if (this.isTitleFocused) {
        titleElement.classList.add('focused');
      } else {
        titleElement.classList.remove('focused');
      }
    }
  }


  private handleEndGameTextClick(textObject?: Phaser.GameObjects.DOMElement): void {
    if (!textObject || !textObject.scene) return;
    this.audioManager.play('whoosh', { volume: 1.3 });
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
    this.cardOpenedDOM = undefined;
    this.focusedCardIndex = -1;
    this.isTitleFocused = false;

    // Destruir grid DOM
    if (this.gridDOMElement) {
      this.gridDOMElement.destroy();
      this.gridDOMElement = undefined;
    }
    this.cardsDOM = [];
    this.heartsGO.forEach(heart => heart?.destroy());
    this.heartsGO = [];
    this.winnerTextGO?.destroy();
    this.winnerTextGO = undefined;
    this.gameOverTextGO?.destroy();
    this.gameOverTextGO = undefined;

    this.scene.restart();
  }

  /** Actualiza el contador de vidas oculto para lectores de pantalla */
  private updateLivesAnnouncer(): void {
    const el = document.getElementById('lives-counter');
    if (el) el.textContent = `Vidas restantes: ${this.lives}`;
  }

  private calculateGridCols(totalCards: number): number {
    const rows = totalCards > 14 ? 3 : 2;
    return Math.ceil(totalCards / rows);
  }

  private calculateCardSize(
    cols: number,
    rows: number,
    gap: number
  ): { width: number; height: number } {
    const { width, height } = this.scale;
    const heartsAreaHeight = 60;
    const availW = width - gap * (cols + 1);
    const availH = height - heartsAreaHeight - gap * (rows + 1);
    const cardW = Math.floor(availW / cols);
    const cardH = Math.floor(availH / rows);
    const aspect = 98 / 128;
    if (cardW / cardH > aspect) {
      return { width: Math.floor(cardH * aspect), height: cardH };
    }
    return { width: cardW, height: Math.floor(cardW / aspect) };
  }


  createGridCardsDOM(): ICardDOM[] {
    // Destruir grid previo si existe
    if (this.gridDOMElement) {
      this.gridDOMElement.destroy();
      this.gridDOMElement = undefined;
    }
    this.cardsDOM = [];

    const shuffled: string[] = Phaser.Utils.Array.Shuffle([
      ...this.cardNames,
      ...this.cardNames
    ]) as string[];
    const totalCards = shuffled.length;
    const gap = 10;

    this.currentCols = this.calculateGridCols(totalCards);
    const rows = Math.ceil(totalCards / this.currentCols);
    const { width: cardW, height: cardH } = this.calculateCardSize(
      this.currentCols,
      rows,
      gap
    );

    const gridW = this.currentCols * cardW + (this.currentCols - 1) * gap;
    const gridH = rows * cardH + (rows - 1) * gap;

    // html del grid
    const buttonsHTML = shuffled
      .map(
        (name, i) => `
        <button
          class="memory-card-btn"
          data-name="${name}"
          data-index="${i}"
          aria-label="Carta ${i + 1} de ${totalCards}, boca abajo"
          aria-pressed="false"
          style="width:${cardW}px; height:${cardH}px;"
        >
          <div class="memory-card-inner">
            <div class="memory-card-back">
              <img src="${this.cardBackImg}" alt="" aria-hidden="true" />
            </div>
            <div class="memory-card-face">
              <img src="${this.cardImgMap.get(name) ?? ''}" alt="" aria-hidden="true" />
            </div>
          </div>
        </button>`
      )
      .join('');

    const containerHTML = `
      <div
        class="memory-card-grid"
        role="grid"
        aria-label="Grid de cartas de memoria: ${rows} filas, ${this.currentCols} columnas, ${totalCards / 2} pares"
        aria-rowcount="${rows}"
        aria-colcount="${this.currentCols}"
        style="
          grid-template-columns: repeat(${this.currentCols}, ${cardW}px);
          gap: ${gap}px;
          width: ${gridW}px;
          height: ${gridH}px;
        "
      >
        ${buttonsHTML}
      </div>`;

    // Posicionar el grid centrado en el canvas (bajo los corazones)
    const { width, height } = this.scale;
    const heartsAreaHeight = 60;
    const cx = width / 2;
    const cy = heartsAreaHeight + (height - heartsAreaHeight) / 2;

    this.gridDOMElement = this.add
      .dom(cx, cy)
      .createFromHTML(containerHTML)
      .setOrigin(0.5);

    // Recuperar botones y construir ICardDOM
    const buttons = Array.from(
      this.gridDOMElement.node.querySelectorAll<HTMLButtonElement>('.memory-card-btn')
    );

    buttons.forEach((btn, i) => {
      const cardName = btn.dataset.name!;

      // Animación de entrada (slide-in desde arriba)
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(-40px)';
      const delay = 60 + i * 70;
      setTimeout(() => {
        this.audioManager.play('card-slide', { volume: 0.8 });
        btn.style.transition = `opacity 0.4s ease ${delay}ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`;
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
      }, 50);

      const card: ICardDOM = {
        button: btn,
        cardName,
        isFaceUp: false,
        isMatched: false,
        flip(callbackComplete?: () => void) {
          if (!this.isFaceUp) {
            btn.classList.add('face-up');
            btn.setAttribute('aria-pressed', 'true');
            btn.setAttribute('aria-label', `Carta ${i + 1} de ${totalCards}, ${cardName}`);
            this.isFaceUp = true;
          } else {
            btn.classList.remove('face-up');
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('aria-label', `Carta ${i + 1} de ${totalCards}, boca abajo`);
            this.isFaceUp = false;
          }
          if (callbackComplete) {
            setTimeout(callbackComplete, 460);
          }
        },
        destroy() {
          this.isMatched = true;
          btn.classList.add('matched');
          btn.setAttribute('aria-hidden', 'true');
          btn.disabled = true;
        }
      };

      btn.addEventListener('click', () => {
        if (!this.canMove || card.isMatched) return;
        // Actualizar foco del teclado al botón clickeado
        const idx = this.cardsDOM.findIndex(c => c.button === btn);
        if (idx !== -1) this.focusedCardIndex = idx;
        this.handleCardInteractionDOM(card);
      });

      this.cardsDOM.push(card);
    });

    return this.cardsDOM;
  }

  createHearts(): Phaser.GameObjects.Image[] {
    this.heartsGO.forEach((h) => { if (h && h.scene) h.destroy(); });
    this.heartsGO = [];
    this.updateLivesAnnouncer();

    const { width } = this.scale;
    const heartSpacing = 40;
    const heartScale = 1.5;
    // Centrar la fila de corazones horizontalmente
    const totalHeartsWidth = (this.lives - 1) * heartSpacing;
    const startX = Math.round(width / 2 - totalHeartsWidth / 2);

    for (let i = 0; i < this.lives; i++) {
      const heart: Phaser.GameObjects.Image = this.add
        .image(width + 100, 30, 'heart')
        .setOrigin(0.5, 0.5)
        .setScale(heartScale);
      this.add.tween({
        targets: heart,
        ease: 'Expo.InOut',
        duration: 1000,
        delay: 500 + i * 120,
        x: startX + heartSpacing * i
      });
      this.heartsGO.push(heart);
    }
    return this.heartsGO;
  }

  // Navegación por teclado

  private moveFocusDOM(dx: number, dy: number): void {
    const numCards = this.cardsDOM.length;
    if (numCards === 0) return;

    // Sin foco previo: ir a la primera carta activa
    if (this.focusedCardIndex === -1) {
      const first = this.cardsDOM.findIndex(c => !c.isMatched);
      if (first !== -1) {
        this.focusedCardIndex = first;
        this.cardsDOM[first].button.focus();
      }
      return;
    }

    const currentRow = Math.floor(this.focusedCardIndex / this.currentCols);
    const currentCol = this.focusedCardIndex % this.currentCols;
    const maxRow = Math.ceil(numCards / this.currentCols) - 1;

    let newIndex = -1;

    if (dx !== 0) {
      // Recorrer la fila en la dirección indicada saltando cartas emparejadas
      let col = currentCol + dx;
      while (col >= 0 && col < this.currentCols) {
        const idx = currentRow * this.currentCols + col;
        if (idx < numCards && !this.cardsDOM[idx].isMatched) {
          newIndex = idx;
          break;
        }
        col += dx;
      }
    }

    if (dy !== 0) {
      // Recorrer la columna en la dirección indicada saltando cartas emparejadas
      let row = currentRow + dy;
      while (row >= 0 && row <= maxRow) {
        const idx = row * this.currentCols + currentCol;
        if (idx < numCards && !this.cardsDOM[idx].isMatched) {
          newIndex = idx;
          break;
        }
        row += dy;
      }
    }

    if (newIndex !== -1) {
      this.focusedCardIndex = newIndex;
      this.cardsDOM[newIndex].button.focus();
    }
  }

  private selectFocusedCardDOM(): void {
    if (this.focusedCardIndex < 0 || this.focusedCardIndex >= this.cardsDOM.length) return;
    const card = this.cardsDOM[this.focusedCardIndex];
    // ignorar cartas ya emparejadas
    if (card && !card.isMatched) {
      this.handleCardInteractionDOM(card);
    }
  }

  private handleCardInteractionDOM(card: ICardDOM): void {
    if (!this.canMove || card.isMatched) return;

    // Ignorar si se hace clic en la carta ya abierta
    if (this.cardOpenedDOM && this.cardOpenedDOM.button === card.button) {
      return;
    }

    this.canMove = false;

    if (this.cardOpenedDOM) {
      const openedCard = this.cardOpenedDOM;

      // Voltear la segunda carta y verificar coincidencia al completar
      card.flip(() => {
        if (openedCard.cardName === card.cardName) {
          // ¡Par encontrado!
          this.audioManager.play('card-match');
          openedCard.destroy();
          card.destroy();

          this.onResult?.(true);

          const matchedCount = this.cardsDOM.filter(c => c.isMatched).length / 2;
          const totalPairs = this.cardNames.length;
          const remaining = totalPairs - matchedCount;
          announce(
            remaining > 0
              ? `¡Par encontrado! ${openedCard.cardName}. Quedan ${remaining} pares.`
              : `¡Último par encontrado! ${openedCard.cardName}.`
          );

          this.cardOpenedDOM = undefined;
          this.canMove = true;
          this.checkGameEndConditions();
        } else {
          // No coinciden — penalización
          this.audioManager.play('card-mismatch', { volume: 1.5 });
          this.cameras.main.shake(100, 0.005);
          this.cameras.main.flash(150, 255, 0, 0, false);

          this.onResult?.(false);

          this.lives -= 1;
          this.updateLivesAnnouncer();
          announceAssertive(`Las cartas no coinciden. Te quedan ${this.lives} vida${this.lives !== 1 ? 's' : ''}.`);

          const lastHeart = this.heartsGO.pop();
          if (lastHeart && lastHeart.scene) {
            this.add.tween({
              targets: lastHeart,
              alpha: 0,
              duration: 300,
              onComplete: () => lastHeart.destroy()
            });
          }

          // Mostrar ambas cartas brevemente antes de voltear de nuevo
          setTimeout(() => {
            card.flip();
            openedCard.flip(() => {
              this.cardOpenedDOM = undefined;
              this.canMove = true;
              this.checkGameEndConditions();
            });
          }, 700);
        }
      });
    } else {
      // Primera carta del turno
      announce(`Volteaste la carta ${card.cardName}. Busca su pareja.`);
      card.flip(() => {
        this.canMove = true;
      });
      this.cardOpenedDOM = card;
    }
  }

  private checkGameEndConditions(): void {
    if (this.lives === 0 && this.gameOverTextGO && this.gameOverTextGO.scene) {
      announceAssertive('¡Juego terminado! No te quedan vidas. Haz clic o presiona Enter para volver a jugar.');
      this.audioManager.play('whoosh', { volume: 1.3 });
      this.add.tween({
        targets: this.gameOverTextGO,
        ease: 'Bounce.Out',
        y: this.sys.game.scale.height / 2,
        onComplete: () => {
          (this.gameOverTextGO?.node as HTMLElement)?.focus();
        }
      });
      this.canMove = false;
      this.focusedCardIndex = -1;
    } else if (this.cardsDOM.length > 0 && this.cardsDOM.every(c => c.isMatched) && this.winnerTextGO && this.winnerTextGO.scene) {
      announceAssertive('¡Felicidades! ¡Ganaste! Encontraste todos los pares. Haz clic o presiona Enter para volver a jugar.');
      this.audioManager.play('whoosh', { volume: 1.3 });
      this.audioManager.play('victory');
      this.add.tween({
        targets: this.winnerTextGO,
        ease: 'Bounce.Out',
        y: this.sys.game.scale.height / 2,
        onComplete: () => {
          (this.winnerTextGO?.node as HTMLElement)?.focus();
        }
      });
      this.canMove = false;
      this.focusedCardIndex = -1;
    }
  }
  startGame(): void {
    this.isTitleFocused = false;
    this.heartsGO = this.createHearts();
    this.cardsDOM = this.createGridCardsDOM();

    if (this.cardsDOM.length === 0) {
      this.canMove = true;
      return;
    }

    // Dar tiempo a que termine la animación de entrada de las cartas
    const totalCards = this.cardsDOM.length;
    const entryDelay = 60 + totalCards * 70 + 600;
    this.time.delayedCall(entryDelay, () => {
      this.canMove = true;
      // Enfocar la primera carta para navegación con teclado
      this.focusedCardIndex = 0;
      this.cardsDOM[0]?.button.focus();
    });
  }
}