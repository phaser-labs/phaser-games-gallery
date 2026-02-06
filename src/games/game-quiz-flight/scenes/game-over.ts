import { Scene } from 'phaser';

import { EventBus } from '../event-bus';

export class GameOver extends Scene {
  camera!: Phaser.Cameras.Scene2D.Camera;
  background!: Phaser.GameObjects.Image;
  gameOverText!: Phaser.GameObjects.DOMElement;
  scoreText!: Phaser.GameObjects.DOMElement;
  resetButton!: Phaser.GameObjects.DOMElement;
  summaryBackground!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('GameOver');
  }

  create() {
    this.sound.stopAll();
    const finalScore = this.registry.get('score') || 0;

    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x333333);

    const selectedBg = this.registry.get('selectedBackground') || 'background';

    this.background = this.add.image(512, 384, selectedBg);
    this.background.setAlpha(0.5);

    const centerX = this.cameras.main.centerX;

    const summaryWidth = 500;
    const summaryHeight = 400;

    this.summaryBackground = this.add.rectangle(centerX, 280, summaryWidth, summaryHeight, 0x000000, 0.6);
    this.summaryBackground.setStrokeStyle(4, 0xffffff);
    this.summaryBackground.setOrigin(0.5);

    this.createGameOverText();

    this.createScoreText(finalScore);

    this.createResetButton();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    EventBus.emit('current-scene-ready', this);
  }

  // Create game over text with HTML element
  private createGameOverText() {
    const centerX = this.cameras.main.centerX;

    const gameOverElement = document.createElement('div');
    gameOverElement.id = 'game-over-title';
    gameOverElement.innerHTML = `
      <div style="
        font-family: 'Arial Black', sans-serif;
        font-size: 48px;
        color: #ffffff;
        text-align: center;
        text-shadow: 3px 3px 0 #000000;
        letter-spacing: 2px;
        margin: 0;
        padding: 0;
        pointer-events: none;
        user-select: none;
      ">
        FIN DEL JUEGO
      </div>
    `;
    this.gameOverText = this.add.dom(centerX, 150, gameOverElement).setOrigin(0.5, 0.5).setDepth(10);
  }

  // Create scoreText button with HTML element
  private createScoreText(finalScore: number) {
    const centerX = this.cameras.main.centerX;

    const scoreElement = document.createElement('div');
    scoreElement.id = 'final-score';
    scoreElement.innerHTML = `
      <div style="
        font-family: 'Arial', sans-serif;
        font-size: 32px;
        color: #ffff00;
        text-align: center;
        text-shadow: 2px 2px 0 #000000;
        margin: 0;
        padding: 0;
        pointer-events: none;
        user-select: none;
        font-weight: bold;
      ">
        Puntaje final: ${finalScore}
      </div>
    `;

    this.scoreText = this.add.dom(centerX, 250, scoreElement).setOrigin(0.5, 0.5).setDepth(10);
  }

  // Create restart button with HTML element
  private createResetButton() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY + 80;

    const buttonElement = document.createElement('button');
    buttonElement.id = 'reset-button';
    buttonElement.textContent = 'REINICIAR';
    buttonElement.tabIndex = 0;

    buttonElement.style.cssText = `
      padding: 16px 48px;
      border-radius: 16px;
      border: 4px solid #ffffff;
      background: linear-gradient(180deg, #ffcc00, #ff9900);
      color: #3d0a6d;
      font-family: "Bangers", cursive;
      font-size: 28px;
      letter-spacing: 2px;
      cursor: pointer;
      box-shadow: 0 6px 0 #c77700;
      outline: none;
      min-width: 200px;
      text-align: center;
      transform: translateY(-50%);
      transition: all 0.2s ease;
    `;

    buttonElement.addEventListener('focus', () => {
      buttonElement.style.outline = '3px solid #ffffff';
      buttonElement.style.outlineOffset = '4px';
    });

    buttonElement.addEventListener('blur', () => {
      buttonElement.style.outline = 'none';
    });

    buttonElement.addEventListener('mouseenter', () => {
      buttonElement.style.transform = 'translateY(-52%) scale(1.05)';
      buttonElement.style.boxShadow = '0 8px 0 #c77700';
    });

    buttonElement.addEventListener('mouseleave', () => {
      buttonElement.style.transform = 'translateY(-50%) scale(1)';
      buttonElement.style.boxShadow = '0 6px 0 #c77700';
    });

    buttonElement.addEventListener('mousedown', () => {
      buttonElement.style.transform = 'translateY(-45%)';
      buttonElement.style.boxShadow = '0 2px 0 #c77700';
    });

    buttonElement.addEventListener('mouseup', () => {
      buttonElement.style.transform = 'translateY(-52%) scale(1.05)';
      buttonElement.style.boxShadow = '0 8px 0 #c77700';
    });

    this.resetButton = this.add.dom(centerX, centerY, buttonElement).setOrigin(0.5, 0.5).setDepth(10);

    this.resetButton.addListener('click');
    this.resetButton.on('click', () => {
      this.changeScene();
    });

    this.resetButton.addListener('keydown');
    this.resetButton.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        this.changeScene();
      }
    });
  }

  shutdown() {
    if (this.gameOverText) this.gameOverText.destroy();
    if (this.scoreText) this.scoreText.destroy();
    if (this.resetButton) {
      this.resetButton.removeListener('click');
      this.resetButton.removeListener('keydown');
      this.resetButton.destroy();
    }

    if (this.summaryBackground) this.summaryBackground.destroy();
  }

  changeScene() {
    this.shutdown();
    this.scene.start('MainMenu');
  }
}
