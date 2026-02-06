import { Scene } from 'phaser';

import { EventBus, GAME_EVENTS } from '../event-bus';
import { Options } from '../types/types';

export class Game extends Scene {
  camera!: Phaser.Cameras.Scene2D.Camera;
  background!: Phaser.GameObjects.TileSprite;
  airplane!: Phaser.Physics.Arcade.Image;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  optionElements: Phaser.GameObjects.DOMElement[] = [];
  questionText!: Phaser.GameObjects.DOMElement;
  scoreText!: Phaser.GameObjects.DOMElement;
  livesText!: Phaser.GameObjects.DOMElement;
  canCollide = true;
  currentQuestionIndex = 0;
  soundGame!: Phaser.Sound.BaseSound;
  correctSound!: Phaser.Sound.BaseSound;
  incorrectSound!: Phaser.Sound.BaseSound;
  soundButton!: Phaser.GameObjects.Image;
  isMuted = false;
  private soundButtonHTML!: HTMLButtonElement;
  questions!: Options[];

  constructor() {
    super('Game');
  }

  create() {
    this.questions = this.registry.get('questions');

    if (!this.questions || this.questions.length === 0) {
      console.error('No hay preguntas');
      return;
    }

    const canvas = this.game.canvas;
    canvas.setAttribute('tabindex', '0');
    canvas.focus();

    this.currentQuestionIndex = 0;
    this.canCollide = true;
    this.optionElements = [];
    this.registry.set('score', 0);
    this.registry.set('lives', 3);

    this.soundGame = this.sound.add('game-audio', { volume: 0.2 });
    this.correctSound = this.sound.add('correct', { volume: 0.4 });
    this.incorrectSound = this.sound.add('incorrect', { volume: 0.4 });

    this.soundGame.play();

    this.soundButtonHTML = document.createElement('button');

    const botonHTML = this.soundButtonHTML;
    botonHTML.tabIndex = 0;
    botonHTML.id = 'sound-button';
    botonHTML.style.position = 'absolute';
    botonHTML.style.left = '-150px';
    botonHTML.style.top = '600px';
    botonHTML.style.padding = '10px';
    botonHTML.style.border = 'none';
    botonHTML.style.background = 'transparent';
    botonHTML.style.cursor = 'pointer';

    const imgHTML = document.createElement('img');
    imgHTML.id = 'sound-icon';
    imgHTML.src = 'assets/quiz-flight/images/sound-on.png';
    imgHTML.width = 40;
    imgHTML.height = 40;
    imgHTML.alt = 'Sound Toggle';

    botonHTML.appendChild(imgHTML);

    const gameContainer = document.getElementById('game-quiz-flight');

    if (!gameContainer) {
      console.error('game-quiz-flight not found');
      return;
    }

    gameContainer.appendChild(botonHTML);

    botonHTML.addEventListener('click', () => {
      this.toggleSound();

      this.game.canvas.focus();
    });

    botonHTML.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        botonHTML.click();

        this.game.canvas.focus();
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    this.scene.stop('MainMenu');
    this.camera = this.cameras.main;
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(0x87ceeb);

    try {
      const selectedBg = this.registry.get('selectedBackground') || 'background';

      this.background = this.add.tileSprite(width / 2, height / 2, width, height, selectedBg);
    } catch (e) {
      console.error('Error creando fondo:', e);
      this.add.rectangle(width / 2, height / 2, width, height, 0x87ceeb).setDepth(0);
    }

    try {
      this.airplane = this.physics.add
        .image(200, height / 2, 'airplane')
        .setScale(0.3)
        .setDepth(10)
        .setVisible(true);

      if (this.airplane.body) {
        (this.airplane.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      }
      this.airplane.setCollideWorldBounds(true);
      console.log('Avión creado');
    } catch (e) {
      console.error('Error creando avión:', e);
      this.airplane = this.physics.add.image(100, height / 2, '__DEFAULT');
      this.add.triangle(100, height / 2, 0, -30, 60, 0, 0, 30, 0xff0000);
    }

    const panelWidth = width - 40;
    const panelHeight = 90;
    const panelX = 20;
    const panelY = 40;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x4fa3d1, 0.25);
    shadow.fillRoundedRect(panelX + 5, panelY + 6, panelWidth, panelHeight, 28);
    shadow.setDepth(4);

    const panel = this.add.graphics();

    panel.fillStyle(0xffffff, 0.92);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 28);

    panel.lineStyle(2, 0x7ec8ff, 0.9);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 28);

    panel.lineStyle(1, 0x4fa3d1, 0.25);
    panel.beginPath();
    panel.moveTo(panelX + 30, panelY + panelHeight - 24);
    panel.lineTo(panelX + panelWidth - 30, panelY + panelHeight - 24);
    panel.strokePath();

    panel.setDepth(5);

    this.createQuestionText();

    const scorePanelWidth = width - 40;
    const scorePanelHeight = 46;
    const scorePanelX = 20;
    const scorePanelY = height - scorePanelHeight - 10;

    const scoreShadow = this.add.graphics();
    scoreShadow.fillStyle(0x4fa3d1, 0.25);
    scoreShadow.fillRoundedRect(scorePanelX + 4, scorePanelY + 5, scorePanelWidth, scorePanelHeight, 24);
    scoreShadow.setDepth(4);

    const scorePanel = this.add.graphics();
    scorePanel.fillStyle(0xffffff, 0.92);
    scorePanel.fillRoundedRect(scorePanelX, scorePanelY, scorePanelWidth, scorePanelHeight, 24);

    scorePanel.lineStyle(2, 0x7ec8ff, 0.9);
    scorePanel.strokeRoundedRect(scorePanelX, scorePanelY, scorePanelWidth, scorePanelHeight, 24);

    scorePanel.setDepth(5);

    this.createScoreText();
    this.createLivesText();

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.createOptions();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdown, this);

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates the question text element for the game.
   * The element is a <div> element with the text "X: <question>".
   * The element is styled with a blue color, a bold font, and centered.
   * The element is added to the scene at the center of the panel, with a y-coordinate of 85 pixels.
   * The element is given a depth of 6, so it appears on top of other elements in the scene.
   */
  private createQuestionText() {
    const { width } = this.scale;

    const questionElement = document.createElement('div');
    questionElement.id = 'game-question';

    questionElement.innerHTML = `
    <div style="
      font-family: 'Arial Rounded MT Bold', Arial, sans-serif;
      font-size: 22px;
      color: #021a2b;
      text-align: center;
      line-height: 1.4;

      width: ${width - 120}px;
      height: 65px;

      overflow-y: auto;
      overflow-x: hidden;

      padding: 6px 12px;
      box-sizing: border-box;

      pointer-events: auto;
      user-select: none;
    ">
      ${this.currentQuestionIndex + 1}: ${this.questions[this.currentQuestionIndex].question}
    </div>
  `;

    this.questionText = this.add
      .dom(width / 2, 85, questionElement)
      .setOrigin(0.5, 0.5)
      .setDepth(6);
  }

  // Create score text as HTML element
  private createScoreText() {
    const { height } = this.scale;
    const scorePanelHeight = 46;
    const scorePanelY = height - scorePanelHeight - 10;

    // Crear elemento HTML para el puntaje
    const scoreElement = document.createElement('div');
    scoreElement.id = 'game-score';
    scoreElement.innerHTML = `
      <div style="
        font-family: 'Arial Rounded MT Bold', Arial, sans-serif;
        font-size: 22px;
        color: #2b6f9c;
        text-shadow: 0 2px 0 #a8d9ff;
        margin: 0;
        padding: 0;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
      ">
        ⭐ Puntos: ${this.registry.get('score')}
      </div>
    `;

    // Posicionar en el lado izquierdo del panel de puntuación
    this.scoreText = this.add
      .dom(46, scorePanelY + scorePanelHeight / 2, scoreElement)
      .setOrigin(0, 0.5)
      .setDepth(6);
  }

  /**
   * Creates the lives text element for the Game scene.
   * The element is a <div> element with the text "❤️ X" where X is the number of lives remaining.
   * The element is styled with a red color, a bold font, and a text shadow.
   * The element is added to the scene at the right side of the score panel, with a y-coordinate of scorePanelY + scorePanelHeight / 2.
   * The element is given a depth of 6, so it appears on top of other elements in the scene.
   */
  private createLivesText() {
    const { width, height } = this.scale;
    const scorePanelHeight = 46;
    const scorePanelY = height - scorePanelHeight - 10;

    // Crear elemento HTML para las vidas
    const livesElement = document.createElement('div');
    livesElement.id = 'game-lives';
    livesElement.innerHTML = `
      <div style="
        font-family: 'Arial Rounded MT Bold', Arial, sans-serif;
        font-size: 22px;
        color: #ff6b6b;
        text-shadow: 0 2px 0 #ffd6d6;
        margin: 0;
        padding: 0;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
      ">
       ${this.getHearts()}
      </div>
    `;

    // Posicionar en el lado derecho del panel de puntuación
    this.livesText = this.add
      .dom(width - 46, scorePanelY + scorePanelHeight / 2, livesElement)
      .setOrigin(1, 0.5)
      .setDepth(6);
  }

  update() {
    if (this.background) {
      this.background.tilePositionX += 1.5;
    }

    const speed = 300;
    const minY = 140;
    const maxY = this.scale.height - 110;

    if (this.cursors.up?.isDown) {
      this.airplane.setVelocityY(-speed);
      this.airplane.setAngle(-10);
    } else if (this.cursors.down?.isDown) {
      this.airplane.setVelocityY(speed);
      this.airplane.setAngle(10);
    } else if (this.input.activePointer.isDown) {
      const pointerY = this.input.activePointer.y;
      const airplaneY = this.airplane.y;
      const distance = pointerY - airplaneY;

      if (distance > 5) {
        this.airplane.setVelocityY(speed);
        this.airplane.setAngle(10);
      } else if (distance < -5) {
        this.airplane.setVelocityY(-speed);
        this.airplane.setAngle(-10);
      } else {
        this.airplane.setVelocityY(0);
        this.airplane.setAngle(0);
      }
    } else if (this.input.activePointer.velocity.y !== 0) {
      const pointerY = this.input.activePointer.y;
      const airplaneY = this.airplane.y;
      const distance = pointerY - airplaneY;

      const followSpeed = Math.min(Math.abs(distance) * 0.5, speed * 0.7);

      if (distance > 15) {
        this.airplane.setVelocityY(followSpeed);
        this.airplane.setAngle(8);
      } else if (distance < -15) {
        this.airplane.setVelocityY(-followSpeed);
        this.airplane.setAngle(-8);
      } else {
        this.airplane.setVelocityY(0);
        this.airplane.setAngle(0);
      }
    } else {
      this.airplane.setVelocityY(0);
      this.airplane.setAngle(0);
    }

    if (this.airplane.y < minY) {
      this.airplane.y = minY;
      this.airplane.setVelocityY(0);
    } else if (this.airplane.y > maxY) {
      this.airplane.y = maxY;
      this.airplane.setVelocityY(0);
    }

    this.optionElements.forEach((option, index) => {
      option.x -= 2;

      if (option.x < this.airplane.x - 100) {
        this.repositionOption(index);
      }

      if (
        this.canCollide &&
        Phaser.Geom.Rectangle.Overlaps(
          new Phaser.Geom.Rectangle(
            this.airplane.x - this.airplane.displayWidth / 2,
            this.airplane.y - this.airplane.displayHeight / 2,
            this.airplane.displayWidth,
            this.airplane.displayHeight
          ),
          new Phaser.Geom.Rectangle(
            option.x - (option.node as HTMLElement).offsetWidth / 2,
            option.y - (option.node as HTMLElement).offsetHeight / 2,
            (option.node as HTMLElement).offsetWidth,
            (option.node as HTMLElement).offsetHeight
          )
        )
      ) {
        this.handleCollision(option);
      }
    });
  }

  /**
   * Creates the options for the current question.
   * It destroys all the existing options and creates new ones based on the current question.
   * It also sets the correct and id data attributes for each option.
   * @private
   */
  createOptions() {
    const { width } = this.scale;
    const currentQuestion = this.questions[this.currentQuestionIndex];

    this.optionElements.forEach((element) => element.destroy());
    this.optionElements = [];

    for (let i = 0; i < this.questions[this.currentQuestionIndex].answers.length; i++) {
      if (i < currentQuestion.answers.length) {
        const answer = currentQuestion.answers[i];

        const x = width + 150 + i * 220;
        const y = 180 + i * 140;

        const optionElement = document.createElement('div');
        optionElement.className = 'game-option';
        optionElement.dataset.correct = answer.correct.toString();
        optionElement.dataset.id = answer.id.toString();
        optionElement.innerHTML = `
  <div style="
    font-size: 18px;
    color: #0f2f44;
    background-color: #ffffff;
    padding: 12px 20px;
    text-align: center;
    font-weight: bold;
    border-radius: 8px;
    box-shadow: 0 4px 0 #9ecae8;
    text-shadow: 0 1px 0 #ffffff;
    cursor: pointer;
    user-select: none;

    min-width: 200px;
    max-width: 400px;

    max-height: 80px;
    overflow-y: auto;
    overflow-x: hidden;

    line-height: 1.3;
  ">
    ${answer.text}
  </div>
`;

        const optionDOM = this.add.dom(x, y, optionElement).setOrigin(0.5, 0.5).setDepth(15);

        this.optionElements.push(optionDOM);
      }
    }
  }

  /**
   * Reposition the option at a random position
   * @param {number} index - The index of the option to reposition
   */
  repositionOption(index: number) {
    const { width } = this.scale;
    const currentQuestion = this.questions[this.currentQuestionIndex];

    if (index < currentQuestion.answers.length) {
      const answer = currentQuestion.answers[index];
      const option = this.optionElements[index];

      const baseY = 180;
      const spacing = 130;

      option.x = width + Phaser.Math.Between(100, 300);
      option.y = baseY + index * spacing;

      const optionElement = option.node as HTMLDivElement;
      const divElement = optionElement.querySelector('div');
      if (divElement) {
        divElement.textContent = answer.text;
      }
    }
  }

  /**
   * Handles the click event for an option.
   * If the game is not in a collidable state, the function does nothing.
   * Otherwise, it checks if the clicked option is correct or not and calls processAnswer with the option and the result.
   * @param {Phaser.GameObjects.DOMElement} option - the DOM element of the option that was clicked.
   */
  handleOptionClick(option: Phaser.GameObjects.DOMElement) {
    if (!this.canCollide) return;

    const optionElement = option.node as HTMLDivElement;
    const isCorrect = optionElement.dataset.correct === 'true';
    this.processAnswer(option, isCorrect);
  }

  /**
   * Handles the collision event for an option.
   * If the game is not in a collidable state, the function does nothing.
   * Otherwise, it checks if the collided option is correct or not and calls processAnswer with the option and the result.
   * @param {Phaser.GameObjects.DOMElement} option - the DOM element of the option that was collided.
   */
  handleCollision(option: Phaser.GameObjects.DOMElement) {
    if (!this.canCollide) return;

    const optionElement = option.node as HTMLDivElement;
    const isCorrect = optionElement.dataset.correct === 'true';
    this.processAnswer(option, isCorrect);
  }

  /**
   * Process the answer of the user
   * @param {Phaser.GameObjects.DOMElement} option - The option that the user has selected
   * @param {boolean} isCorrect - If the answer is correct or not
   */
  processAnswer(option: Phaser.GameObjects.DOMElement, isCorrect: boolean) {
    this.canCollide = false;

    const optionElement = option.node as HTMLDivElement;
    const divElement = optionElement.querySelector('div');
    if (divElement) {
      divElement.style.backgroundColor = isCorrect ? '#00AA00' : '#AA0000';
      divElement.style.color = '#FFFFFF';
      divElement.style.boxShadow = isCorrect ? '0 4px 0 #008800' : '0 4px 0 #880000';
      divElement.style.cursor = 'default';
    }

    this.showResultIcon(option.x, option.y, isCorrect);

    this.time.delayedCall(1000, () => {
      if (this.registry.get('lives') <= 0 || this.currentQuestionIndex >= this.questions.length) {
        this.soundGame.stop();
        this.changeScene();
        return;
      }

      if (isCorrect) {
        this.currentQuestionIndex++;
        this.correctSound.play();

        if (this.currentQuestionIndex < this.questions.length) {
          const nextQuestion = this.questions[this.currentQuestionIndex];
          const questionElement = this.questionText.node as HTMLDivElement;
          const questionDiv = questionElement.querySelector('div');
          if (questionDiv) {
            questionDiv.textContent = `Pregunta ${this.currentQuestionIndex + 1}: ${nextQuestion.question}`;
          }
          this.createOptions();
          this.canCollide = true;
        } else {
          this.scene.start('GameOver');
        }
      } else {
        if (this.registry.get('lives') > 0) {
          this.incorrectSound.play();
          this.createOptions();
          this.canCollide = true;
        }
      }

      this.onResult(isCorrect);
    });
  }

  /**
   * Shows a result icon at the given position with the given color.
   * If the given boolean is true, the icon will be green and will
   * represent a correct answer. Otherwise, the icon will be red and
   * will represent an incorrect answer.
   * @param {number} x The x-coordinate of the icon.
   * @param {number} y The y-coordinate of the icon.
   * @param {boolean} correct Whether the icon should be green or red.
   */
  showResultIcon(x: number, y: number, correct: boolean) {
    const graphics = this.add.graphics();

    if (correct) {
      const currentScore = this.registry.get('score');
      this.registry.set('score', currentScore + 5);
      this.updateScoreText();
      graphics.fillStyle(0x00ff00, 0.8);
      graphics.fillCircle(x, y - 50, 30);

      graphics.lineStyle(5, 0xffffff, 1);
      graphics.beginPath();
      graphics.moveTo(x - 15, y - 50);
      graphics.lineTo(x - 5, y - 40);
      graphics.lineTo(x + 20, y - 65);
      graphics.strokePath();
    } else {
      const currentLives = this.registry.get('lives');
      this.registry.set('lives', currentLives - 1);
      this.updateLivesText();
      graphics.fillStyle(0xff0000, 0.8);
      graphics.fillCircle(x, y - 50, 30);

      graphics.lineStyle(5, 0xffffff, 1);
      graphics.beginPath();
      graphics.moveTo(x - 15, y - 65);
      graphics.lineTo(x + 15, y - 35);
      graphics.moveTo(x + 15, y - 65);
      graphics.lineTo(x - 15, y - 35);
      graphics.strokePath();
    }

    graphics.setDepth(100);

    this.tweens.add({
      targets: graphics,
      y: y - 70,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => graphics.destroy()
    });
  }

  /**
   * Updates the score text and applies a scaling animation.
   *
   * This method updates the score text by accessing the Phaser
   * registry and retrieving the current score. It then updates
   * the score element's text content with the new score.
   */
  updateScoreText() {
    const scoreElement = this.scoreText.node as HTMLDivElement;
    const scoreDiv = scoreElement.querySelector('div');
    if (scoreDiv) {
      scoreDiv.textContent = `⭐ Puntos: ${this.registry.get('score')}`;
    }

    this.tweens.add({
      targets: this.scoreText,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }

  /**
   * Updates the lives text and applies a scaling animation.
   * If there are remaining lives, the camera is also shaken.
   */
  updateLivesText() {
    const livesElement = this.livesText.node as HTMLDivElement;
    const livesDiv = livesElement.querySelector('div');
    if (livesDiv) {
      livesDiv.textContent = `${this.getHearts()}`;
    }

    this.tweens.add({
      targets: this.livesText,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });

    if (this.registry.get('lives') >= 0) {
      this.cameras.main.shake(200, 0.01);
    }
  }

  getHearts(): string {
    let hearts = '';
    for (let i = 0; i < 3; i++) {
      if (i < this.registry.get('lives')) {
        hearts += '❤️‍🔥';
      } else {
        hearts += '❌';
      }
    }
    return hearts;
  }

  /**
   * Emits the result of the last question to the EventBus.
   * @param {boolean} result Whether the last question was answered correctly or not.
   */
  private onResult(result: boolean) {
    EventBus.emit(GAME_EVENTS.RESULT, result);
  }

  /**
   * Destroys all the elements created in the Game scene.
   *This method is called when the scene is changed.
   *It removes all the event listeners and destroys the Phaser elements.
   */
  shutdown() {
    if (this.soundButtonHTML && this.soundButtonHTML.parentElement) {
      this.soundButtonHTML.parentElement.removeChild(this.soundButtonHTML);
    }

    if (this.questionText) this.questionText.destroy();
    if (this.scoreText) this.scoreText.destroy();
    if (this.livesText) this.livesText.destroy();

    this.optionElements.forEach((element) => {
      element?.destroy();
    });

    this.optionElements = [];

    EventBus.off(GAME_EVENTS.RESULT);
  }

  /**
   * Toggles the sound on/off.
   * If the sound is muted, it sets the volume of the correct, incorrect and game sounds to 0.
   * If the sound is not muted, it sets the volume of the correct, incorrect and game sounds to their original values.
   * It also changes the source of the sound icon to indicate whether the sound is on or off.
   */
  toggleSound() {
    this.isMuted = !this.isMuted;

    const soundIcon = document.getElementById('sound-icon') as HTMLImageElement | null;
    if (!soundIcon) return;

    if (this.isMuted) {
      (this.correctSound as Phaser.Sound.WebAudioSound).setVolume(0);
      (this.incorrectSound as Phaser.Sound.WebAudioSound).setVolume(0);
      (this.soundGame as Phaser.Sound.WebAudioSound).setVolume(0);

      soundIcon.src = 'assets/quiz-flight/images/sound-off.png';
    } else {
      (this.correctSound as Phaser.Sound.WebAudioSound).setVolume(0.4);
      (this.incorrectSound as Phaser.Sound.WebAudioSound).setVolume(0.4);
      (this.soundGame as Phaser.Sound.WebAudioSound).setVolume(0.2);

      soundIcon.src = 'assets/quiz-flight/images/sound-on.png';
    }
  }

  changeScene() {
    this.registry.set('finalScore', this.registry.get('score'));
    this.registry.set('finalLives', this.registry.get('lives'));
    this.scene.start('GameOver');
  }
}
