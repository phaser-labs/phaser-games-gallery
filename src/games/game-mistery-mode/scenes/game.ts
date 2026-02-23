import { Scene } from 'phaser';

import { EventBus, GAME_EVENTS } from '../event-bus';
import { GameDataMisteryMode } from '../game-mistery-mode';

import styles from '../styles/game-mistery-mode.module.css';

export class Game extends Scene {
  background!: Phaser.GameObjects.Image;
  gameText!: Phaser.GameObjects.DOMElement;
  cardText!: Phaser.GameObjects.DOMElement;
  inputText!: Phaser.GameObjects.DOMElement;
  feedBackElement!: Phaser.GameObjects.DOMElement;
  tracksUsed: number = 0;
  currentQuestionIndex: number = 0;
  giveUpButton!: HTMLButtonElement;
  giveUpButtonText!: Phaser.GameObjects.DOMElement;
  audios: { [key: string]: Phaser.Sound.BaseSound } = {};
  toggleSoundButton!: Phaser.GameObjects.DOMElement;
  totalPoints: number = 0;
  pointsPerCase: number[] = [];
  attempts: number = 4;
  gameData!: GameDataMisteryMode[];

  constructor() {
    super('Game');
  }

  preload() {
    this.load.setPath('assets/game-mistery-mode');

    //audios
    this.load.audio('reveal-card', '/audios/reveal-card.mp3');
    this.load.audio('correct', '/audios/correct.mp3');
    this.load.audio('incorrect', '/audios/incorrect.mp3');
  }

  init(data: { reset?: boolean }) {
    if (data?.reset) {
      this.tracksUsed = 0;
      this.currentQuestionIndex = 0;
      this.pointsPerCase = [];
      this.totalPoints = 0;
      this.attempts = 4;
    }
  }

  create() {
    this.gameData = this.registry.get('game-data');

    if (!this.gameData || this.gameData.length === 0) {
      console.error('No hay casos');
      return;
    }
    const bgKey = this.registry.get('global-background') || 'background-1';

    this.add.image(512, 384, bgKey);

    this.createTextGame();
    this.createGameCard();
    this.createInput();
    this.createTrack();
    this.createToggleSound();

    //audios
    this.audios['reveal-card'] = this.sound.add('reveal-card').setVolume(0.05);
    this.audios['correct'] = this.sound.add('correct').setVolume(0.05);
    this.audios['incorrect'] = this.sound.add('incorrect').setVolume(0.05);

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates the text game UI component
   * @private
   */
  private createTextGame() {
    const { width } = this.scale;
    const container = document.createElement('header');
    container.id = 'game-text-container';
    container.className = styles['header-game'];

    container.innerHTML = `
  <div class="${styles['header-container']}">
  <div class="${styles['header-game-top']}">
    <span>Juego de pistas</span>
    <div>Caso abierto</div>
  </div>
  <div class="${styles['header-game-title']}">
  <h1>Descubre el personaje</h1>
  <p>
    Explora de quien se trata con las pistas. 
    Cuantas menos uses, mejor detective seras!
  </p> <hr/></div>
  <p class="${styles['header-game-ronda']}">Ronda <strong>${this.currentQuestionIndex + 1}</strong> de ${this.gameData.length}</p>
  </div>
 
`;

    this.gameText = this.add
      .dom(width / 2, 150, container)
      .setOrigin(0.5, 0.5)
      .setDepth(6);
  }

  /**
   * Creates the game card UI component for the current question
   * @private
   */
  private createGameCard() {
    const { width } = this.scale;

    const cards = document.createElement('section');
    cards.className = styles['game-mistery-mode-cards'];

    const cardContainer = document.createElement('div');
    cardContainer.className = styles['game-card-container'];

    const firstQuestion = this.gameData[this.currentQuestionIndex];

    const colors = ['card-yellow', 'card-beige', 'card-gray', 'card-grid', 'card-light'];

    let unlockedIndex = 0;

    firstQuestion.tracks.forEach((track, index) => {
      const card = document.createElement('div');
      card.className = `${styles['mistery-card']} ${styles[colors[index]]}`;

      const title = document.createElement('div');
      title.className = styles['card-title'];
      title.textContent = track.name.toUpperCase();

      const placeholder = document.createElement('div');
      placeholder.className = styles['card-placeholder'];
      placeholder.textContent = 'Toca para revelar';

      const text = document.createElement('div');
      text.className = styles['card-text'];
      text.textContent = track.text;

      const button = document.createElement('button');
      button.className = styles['reveal-btn'];
      button.ariaLabel = `Revelar`;
      button.innerHTML = '👀';

      if (index !== 0) {
        button.disabled = true;
      }

      button.addEventListener('click', () => {
        if (index === unlockedIndex) {
          this.audios['reveal-card'].play();
          text.classList.add(styles['visible']);
          placeholder.style.display = 'none';
          button.disabled = true;

          this.tracksUsed++;

          if (this.tracksUsed === 5) {
            this.createGiveUpButton();
            const feedbackMessage = document.getElementById('feedback-message');
            if (feedbackMessage) {
              feedbackMessage.textContent = '⚠️ Has usado todas las pistas';
              feedbackMessage.className = `${styles['feedback-message']} ${styles['neutral']}`;
            }

            if (this.giveUpButton) {
              this.giveUpButton.style.display = 'inline-block';
            }
          }

          const tracksUsedElement = document.getElementById('tracks-used-count');
          if (tracksUsedElement) {
            tracksUsedElement.textContent = this.tracksUsed.toString();
          }

          if (this.tracksUsed === 1) {
            const input = document.querySelector(`.${styles['guess-input']}`) as HTMLInputElement;

            if (input) {
              input.disabled = false;
              input.focus();
            }
          }

          unlockedIndex++;

          const nextButton = cardContainer.children[unlockedIndex]?.querySelector(
            `.${styles['reveal-btn']}`
          ) as HTMLButtonElement;

          if (nextButton) {
            nextButton.disabled = false;
          }
        }
      });

      card.appendChild(title);
      card.appendChild(button);
      card.appendChild(placeholder);
      card.appendChild(text);

      cardContainer.appendChild(card);
    });

    cards.appendChild(cardContainer);

    this.cardText = this.add
      .dom(width / 2, 380, cards)
      .setOrigin(0.5, 0.5)
      .setDepth(6);
  }

  /**
   * Creates the input component for the current question
   * @private
   */
  private createInput() {
    const { width } = this.scale;

    const phaserContainer = document.createElement('div');

    const wrapper = document.createElement('div');
    wrapper.className = styles['input-container'];

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Escribe tu respuesta...';
    input.className = styles['guess-input'];
    input.disabled = true;

    const submitButton = document.createElement('button');
    submitButton.className = styles['submit-btn'];
    submitButton.disabled = true;

    input.addEventListener('input', () => {
      submitButton.disabled = input.value.trim() === '' || this.tracksUsed === 0;

      const feedbackMessage = document.getElementById('feedback-message');
      if (feedbackMessage && feedbackMessage.classList.contains(styles['incorrect'])) {
        feedbackMessage.textContent = '';
        feedbackMessage.className = `${styles['feedback-message']} ${styles['neutral']}`;
      }
    });

    submitButton.addEventListener('click', () => {
      this.attempts--;
      this.updateAttemptsDisplay();

      const inputValue = input.value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const answerValue = this.gameData[this.currentQuestionIndex].answer
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const correctAnswer = inputValue === answerValue;
      this.onResult(correctAnswer);

      if (correctAnswer) {
        this.setPointsForCurrentCase();
        this.audios['correct'].play();
        input.disabled = true;
        submitButton.disabled = true;
        this.attempts = 4;
        this.updateAttemptsDisplay();
      } else {
        if (this.attempts <= 0) {
          this.showGameOverModal();
          return;
        }
        this.audios['incorrect'].play();
      }
      this.showFeedbackModal(correctAnswer, this.tracksUsed);
    });

    submitButton.innerHTML = `
    <div class="${styles['submit-btn-content']}">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 5px;">
        <path d="M2 2l12 6-12 6V9l8-2-8-2V2z"/>
      </svg>
      <span>Enviar</span>
    </div>
  `;

    wrapper.appendChild(input);
    wrapper.appendChild(submitButton);
    phaserContainer.appendChild(wrapper);

    this.inputText = this.add
      .dom(width / 2, 570, phaserContainer)
      .setOrigin(0.5, 0.5)
      .setDepth(6);
  }

  /**
   * Creates the track component for the current question
   * @private
   */
  private createTrack() {
    const { width } = this.scale;

    const container = document.createElement('div');

    const trackCounter = document.createElement('div');
    trackCounter.className = styles['track-counter'];
    trackCounter.innerHTML = `
    <div class="${styles['stat-item']}">
      <span class="${styles['stat-icon']}">🔍</span>
      <span class="${styles['stat-label']}">PISTAS</span>
      <span class="${styles['stat-value']}">
        <strong id="tracks-used-count">${this.tracksUsed}</strong>/5
      </span>
    </div>
    <div class="${styles['stat-divider']}"></div>
    <div class="${styles['stat-item']} ${styles['lives-item']}">
      <span class="${styles['stat-icon']}">⚡</span>
      <span class="${styles['stat-label']}">VIDAS</span>
      <span class="${styles['stat-value']} ${styles['lives-value']}" id="lives-container">
        ${this.attempts}
      </span>
    </div>
  `;

    // container.appendChild(feedback);
    container.appendChild(trackCounter);

    this.feedBackElement = this.add
      .dom(width / 3.6, 640, container)
      .setOrigin(0.5, 0.5)
      .setDepth(6);
  }

  private updateAttemptsDisplay() {
    const livesContainer = document.getElementById('lives-container');
    if (livesContainer) {
      livesContainer.textContent = `${this.attempts}`;

      // Animación de cambio
      livesContainer.classList.add(styles['lives-pulse']);
      setTimeout(() => {
        livesContainer.classList.remove(styles['lives-pulse']);
      }, 300);
    }
  }
  private showFeedbackModal(isCorrect: boolean, tracksUsed?: number) {
    const overlay = document.createElement('div');
    overlay.className = styles['feedback-modal-overlay'];
    overlay.id = 'feedback-modal';

    const headerClass = isCorrect ? 'feedback-modal-header-correct' : 'feedback-modal-header-incorrect';
    const answerClass = isCorrect ? 'feedback-modal-answer-correct' : 'feedback-modal-answer-incorrect';
    const detailClass = isCorrect ? 'feedback-modal-detail-correct' : 'feedback-modal-detail-incorrect';
    const answerText = isCorrect ? '✓ Respuesta Correcta' : '✗ Respuesta Incorrecta';
    const buttonText = isCorrect ? 'Continuar →' : 'Seguir Intentando';

    let detailText = '';
    if (isCorrect) {
      detailText = `🔍 Muy bien detective, has resuelto el misterio con ${tracksUsed} ${tracksUsed === 1 ? 'pista' : 'pistas'} usadas. ¡Sigue así para el siguiente caso!`;
    } else {
      detailText = `🕵️ La respuesta no es correcta. Sigue investigando con las pistas disponibles. ¡Tú puedes!`;
    }

    const points = this.calculatePoints(this.tracksUsed);
    const modalContent = document.createElement('div');
    modalContent.className = styles['feedback-modal-content'];

    modalContent.innerHTML = `
    <div class="${styles[headerClass]}">
      <h2>${isCorrect ? '¡CASO RESUELTO!' : 'CASO FALLIDO'}</h2>
    </div>
    <div class="${styles['feedback-modal-body']}">
      <div class="${styles[answerClass]}">
        <span class="${styles['feedback-modal-icon']}">${isCorrect ? '🏆' : '🔍'}</span>
        <strong>${answerText}</strong>
      </div>
      <div class="${styles[detailClass]}">
        ${detailText} ${isCorrect ? `Has ganado <strong>${points}</strong> puntos para este caso.` : ''}
      </div>
    </div>
    <div class="${styles['feedback-modal-footer']}">
      <button class="${styles['feedback-modal-button']}" id="continue-btn">${buttonText}</button>
    </div>
  `;

    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);

    const closeModal = () => {
      const modal = document.getElementById('feedback-modal');
      if (modal) {
        modal.remove();
      }
    };

    const goToNextQuestion = () => {
      if (this.currentQuestionIndex === this.gameData.length - 1) {
        this.changeScene();
        return;
      }

      this.currentQuestionIndex++;
      this.tracksUsed = 0;
      this.attempts = 4;
      this.updateAttemptsDisplay();

      this.updateRondaDisplay();

      if (this.cardText) this.cardText.destroy();
      this.createGameCard();

      const tracksUsedElement = document.getElementById('tracks-used-count');
      if (tracksUsedElement) tracksUsedElement.textContent = '0';

      const feedbackMessage = document.getElementById('feedback-message');
      if (feedbackMessage) {
        feedbackMessage.textContent = '';
        feedbackMessage.className = `${styles['feedback-message']} ${styles['neutral']}`;
      }

      const input = document.querySelector(`.${styles['guess-input']}`) as HTMLInputElement;
      const submitButton = document.querySelector(`.${styles['submit-btn']}`) as HTMLButtonElement;

      if (input) {
        input.value = '';
        input.disabled = true;
      }
      if (submitButton) submitButton.disabled = true;

      if (this.giveUpButton) {
        this.giveUpButton.style.display = 'none';
      }
    };

    const restartCurrentQuestion = () => {
      this.tracksUsed = 0;

      if (this.cardText) this.cardText.destroy();
      this.createGameCard();

      const tracksUsedElement = document.getElementById('tracks-used-count');
      if (tracksUsedElement) tracksUsedElement.textContent = '0';

      const feedbackMessage = document.getElementById('feedback-message');
      if (feedbackMessage) {
        feedbackMessage.textContent = '';
        feedbackMessage.className = `${styles['feedback-message']} ${styles['neutral']}`;
      }

      const input = document.querySelector(`.${styles['guess-input']}`) as HTMLInputElement;
      const submitButton = document.querySelector(`.${styles['submit-btn']}`) as HTMLButtonElement;

      if (input) {
        input.value = '';
        input.disabled = true;
      }
      if (submitButton) submitButton.disabled = true;

      if (this.giveUpButton) {
        this.giveUpButton.style.display = 'none';
      }
    };

    // Event listeners
    document.getElementById('close-modal')?.addEventListener('click', () => {
      closeModal();
      if (!isCorrect) {
        restartCurrentQuestion();
      }
    });

    document.getElementById('continue-btn')?.addEventListener('click', () => {
      closeModal();
      if (isCorrect) {
        goToNextQuestion();
      } else {
        restartCurrentQuestion();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
        if (!isCorrect) {
          restartCurrentQuestion();
        }
      }
    });
  }

  private showDetailModal(detail: string) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = styles['modal-overlay'];
    overlay.id = 'detail-modal';

    // Crear contenido del modal
    const modalContent = document.createElement('div');
    modalContent.className = styles['modal-content'];

    modalContent.innerHTML = `
    <div class="${styles['modal-header']}">
      <h2>Detalles</h2>
      <button class="${styles['modal-close']}" id="close-modal">×</button>
    </div>
    <div class="${styles['modal-body']}">
      <div class="${styles['modal-detail']}">
        ${detail}
      </div>
    </div>
    <div class="${styles['modal-footer']}">
      <button class="${styles['modal-button']}" id="continue-btn">Seguir intentando</button>
    </div>
  `;

    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);

    // Función para cerrar modal y reiniciar la misma pregunta
    const closeModalAndRestart = () => {
      const modal = document.getElementById('detail-modal');
      if (modal) {
        modal.remove();
      }

      // Reiniciar la misma pregunta
      this.tracksUsed = 0;

      if (this.cardText) this.cardText.destroy();
      this.createGameCard();

      const tracksUsedElement = document.getElementById('tracks-used-count');
      if (tracksUsedElement) tracksUsedElement.textContent = '0';

      const feedbackMessage = document.getElementById('feedback-message');
      if (feedbackMessage) {
        feedbackMessage.textContent = '';
        feedbackMessage.className = `${styles['feedback-message']} ${styles['neutral']}`;
      }

      const input = document.querySelector(`.${styles['guess-input']}`) as HTMLInputElement;
      const submitButton = document.querySelector(`.${styles['submit-btn']}`) as HTMLButtonElement;

      if (input) {
        input.value = '';
        input.disabled = true;
      }
      if (submitButton) submitButton.disabled = true;

      // Ocultar botón de ayuda
      if (this.giveUpButton) {
        this.giveUpButton.style.display = 'none';
      }
    };

    document.getElementById('close-modal')?.addEventListener('click', closeModalAndRestart);
    document.getElementById('continue-btn')?.addEventListener('click', closeModalAndRestart);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModalAndRestart();
      }
    });
  }

  private showGameOverModal() {
    const overlay = document.createElement('div');
    overlay.className = styles['gameover-modal-overlay'];
    overlay.id = 'gameover-modal';

    const modalContent = document.createElement('div');
    modalContent.className = styles['gameover-modal-content'];

    modalContent.innerHTML = `
    <div class="${styles['gameover-modal-header']}">
      <h2>CASO CERRADO</h2>
    </div>
    <div class="${styles['gameover-modal-body']}">
      <div class="${styles['gameover-icon']}">💔</div>
      <h3 class="${styles['gameover-title']}">HAS PERDIDO</h3>
      <p class="${styles['gameover-subtitle']}">
        No lograste resolver todos los casos<br>
        Los misterios quedaron sin resolver
      </p>

      <div class="${styles['gameover-stats']}">
        <div class="${styles['gameover-stat-item']}">
          <span class="${styles['gameover-stat-label']}">Casos completados:</span>
          <span class="${styles['gameover-stat-value']}">${this.currentQuestionIndex}/${this.gameData.length}</span>
        </div>
        <div class="${styles['gameover-stat-item']}">
          <span class="${styles['gameover-stat-label']}">Puntos obtenidos:</span>
          <span class="${styles['gameover-stat-value']}">${this.totalPoints}</span>
        </div>
      </div>

      <div class="${styles['gameover-quote']}">
        <p> "Un buen detective aprende de sus errores.<br>¿Inténtalo de nuevo?"</p>
      </div>
    </div>
    <div class="${styles['gameover-footer']}">
      <button class="${styles['gameover-button']}" id="menu-btn">Reiniciar</button>
    </div>
  `;

    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);

    document.getElementById('menu-btn')?.addEventListener('click', () => {
      this.attempts = 4;
      overlay.remove();
      this.scene.start('Game', { reset: true });
      this.scene.start('MainMenu');
    });
  }

  private createGiveUpButton() {
    const buttonContainer = document.createElement('div');
    const giveUpButton = document.createElement('button');
    giveUpButton.ariaLabel = 'Ayuda';
    giveUpButton.className = styles['giveup-btn'];

    giveUpButton.innerHTML = `
    <div class="${styles['submit-btn-content']}">
<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" style="margin-right:5px;">
  <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
  <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z" fill="currentColor"/>
  <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
  <path d="M12 6a4 4 0 0 0-4 4h2a2 2 0 0 1 4 0c0 1-1 2-2 3h-1v2h2v-1c2-1 3-2 3-4a4 4 0 0 0-4-4z" fill="currentColor"/>
</svg>
      <span>Ayuda</span>
    </div>
  `;

    giveUpButton.style.display = 'none';
    this.giveUpButton = giveUpButton;

    giveUpButton.addEventListener('click', () => {
      const currentQuestion = this.gameData[this.currentQuestionIndex];
      this.showDetailModal(currentQuestion.detail);

      const input = document.querySelector(`.${styles['guess-input']}`) as HTMLInputElement;
      const submitButton = document.querySelector(`.${styles['submit-btn']}`) as HTMLButtonElement;

      if (input) input.disabled = true;
      if (submitButton) submitButton.disabled = true;

      giveUpButton.style.display = 'none';
    });

    buttonContainer.appendChild(giveUpButton);

    this.giveUpButtonText = this.add.dom(850, 610, buttonContainer).setOrigin(0.5, 0.5).setDepth(6);
  }

  private createToggleSound() {
    const { width } = this.scale;
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'toggle-sound-container';

    const toggleSoundButton = document.createElement('button');
    toggleSoundButton.ariaLabel = 'Alternar sonido';
    toggleSoundButton.className = styles['toggle-sound'];

    let isSoundOn = true;

    const soundOnIcon = `
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
      <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.889l.707.707z"/>
      <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
    </svg>
  `;

    const soundOffIcon = `
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
      <path d="M10.5 1.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-1 0V2a.5.5 0 0 1 .5-.5z"/>
      <path d="M13.5 1.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-1 0V2a.5.5 0 0 1 .5-.5z"/>
    </svg>
  `;

    toggleSoundButton.innerHTML = `
    <div class="${styles['toggle-btn-sound']}">
      ${soundOnIcon}
    </div>
  `;

    toggleSoundButton.addEventListener('click', () => {
      isSoundOn = !isSoundOn;

      toggleSoundButton.innerHTML = `
      <div class="${styles['toggle-btn-sound']}">
        ${isSoundOn ? soundOnIcon : soundOffIcon}
      </div>
    `;

      this.sound.setMute(!isSoundOn);

      EventBus.emit('toggle-sound', isSoundOn);
    });

    buttonContainer.appendChild(toggleSoundButton);

    this.toggleSoundButton = this.add
      .dom(width / 2 + 450, 700, buttonContainer)
      .setOrigin(0.5, 0.5)
      .setDepth(6);
  }

  private calculatePoints(tracksUsed: number): number {
    switch (tracksUsed) {
      case 1:
        return 20;
      case 2:
        return 15;
      case 3:
        return 10;
      case 4:
        return 5;
      case 5:
        return 1;
      default:
        return 0;
    }
  }

  private setPointsForCurrentCase() {
    const points = this.calculatePoints(this.tracksUsed);
    this.pointsPerCase[this.currentQuestionIndex] = points;
    this.totalPoints += points;
  }

  private updateRondaDisplay() {
    const rondaElement = document.querySelector(`.${styles['header-game-ronda']}`);
    if (rondaElement) {
      rondaElement.innerHTML = `Ronda <strong>${this.currentQuestionIndex + 1}</strong> de ${this.gameData.length}`;
    }
  }

  private onResult(result: boolean) {
    EventBus.emit(GAME_EVENTS.RESULT, result);
  }
  changeScene() {
    EventBus.off(GAME_EVENTS.RESULT);
    this.scene.start('FinishGame', {
      totalPoints: this.totalPoints,
      pointsPerCase: this.pointsPerCase,
      totalCases: this.gameData.length
    });
  }
}
