import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../event-bus';

export class MainMenu extends Scene {
  background!: GameObjects.Image;
  title!: GameObjects.DOMElement;
  playButton!: GameObjects.DOMElement;

  constructor() {
    super('MainMenu');
  }

  create() {
    this.registry.set('score', 0);
    this.registry.set('lives', 3);

    const { width, height } = this.scale;

    this.background = this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

    this.add
      .image(width / 2, height / 2, 'banner')
      .setDisplaySize(800, 600)
      .setDepth(1);

    this.createTitle();

    this.createPlayButton();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    EventBus.emit('current-scene-ready', this);
  }

  // create title with HTML element
  private createTitle() {
    const { width } = this.scale;

    const titleElement = document.createElement('h1');
    titleElement.id = 'game-title';
    titleElement.textContent = 'VUELO DE PREGUNTAS';

    // Estilos CSS para el título
    titleElement.style.cssText = `
      color: #3d0a6d;
      font-family: 'Bangers', cursive;
      font-size: 52px;
      text-align: center;
      margin: 0;
      padding: 0;
      text-shadow: 
        2px 2px 0 #ffffff,
        -2px -2px 0 #ffffff,
        2px -2px 0 #ffffff,
        -2px 2px 0 #ffffff,
        0 2px 0 #ffffff,
        2px 0 0 #ffffff,
        0 -2px 0 #ffffff,
        -2px 0 0 #ffffff,
        2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 1px;
      transform: translateY(-50%);
    `;

    this.title = this.add
      .dom(width / 2, 320, titleElement)
      .setOrigin(0.5, 0.5)
      .setDepth(6);

    this.tweens.add({
      targets: this.title,
      y: this.title.y + 8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // create start Button with HTML element
  private createPlayButton() {
    const { width, height } = this.scale;

    const button = document.createElement('button');
    button.id = 'play-button';
    button.textContent = 'INICIAR';
    button.tabIndex = 0;

    button.style.cssText = `
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
      width: 200px;
      transform: translateY(-50%);
    `;

    button.addEventListener('focus', () => {
      button.style.outline = '3px solid #ffffff';
      button.style.outlineOffset = '4px';
    });

    button.addEventListener('blur', () => {
      button.style.outline = 'none';
    });

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-52%) scale(1.05)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(-50%) scale(1)';
    });

    button.addEventListener('mousedown', () => {
      button.style.transform = 'translateY(-45%)';
      button.style.boxShadow = '0 2px 0 #c77700';
    });

    button.addEventListener('mouseup', () => {
      button.style.transform = 'translateY(-52%) scale(1.05)';
      button.style.boxShadow = '0 6px 0 #c77700';
    });

    this.playButton = this.add
      .dom(width / 2, height * 0.7, button)
      .setOrigin(0.5, 0.5)
      .setDepth(10);

    this.playButton.addListener('click');
    this.playButton.on('click', () => {
      this.changeScene();
    });

    this.playButton.addListener('keydown');
    this.playButton.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        this.changeScene();
      }
    });
  }

  shutdown() {
    if (this.title) {
      this.title.destroy();
    }

    if (this.playButton) {
      this.playButton.removeListener('click');
      this.playButton.removeListener('keydown');
      this.playButton.destroy();
    }
  }

  changeScene() {
    this.shutdown();
    this.scene.start('Instructions');
  }
}
