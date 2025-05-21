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
export class Menu extends Phaser.Scene {
  private backgroundImg!: Phaser.GameObjects.Image;
  private btnContainerImg!: Phaser.GameObjects.Image;
  private cursor!: Phaser.GameObjects.Image;

  private mouseEnterHandler?: () => void;
  private mouseLeaveHandler?: () => void;

  isMuted: boolean = false;
  volumeButton!: Phaser.GameObjects.Image;
  constructor() {
    super('menuScene');
  }

  preload() {}

  create() {
    this.game.events.emit('hide-ui');
    this.game.canvas.setAttribute('tabindex', '0');
    this.cameras.main.setBackgroundColor('#000');
    this.backgroundImg = this.add.image(0, 0, 'background');
    this.backgroundImg.setOrigin(0, 0).setScale(1);

    const musicKey = 'backgroundMusic';
    if (!this.sound.get(musicKey)?.isPlaying) {
    
        const music = this.sound.add(musicKey, {
            loop: true,
            volume: 0.1
        });
        music.play();
    } 

    this.btnMusic(); // Botón de música
    const containerTitle = this.add.dom(160, 100, 'div', null, '').setDepth(0);
    const titleGameContainer = containerTitle.node as HTMLDivElement;
    titleGameContainer.classList.add('game-arcanum-title-container');

    const textTitle = this.add.dom(230, 120, 'h1', null, 'Arcanum Archer').setOrigin(0, 0);
    const titleGame = textTitle.node as HTMLHeadingElement;
    titleGame.classList.add('game-arcanum-title');

    this.btnContainerImg = this.add.image(300, 300, 'containBtn');
    this.btnContainerImg.setOrigin(0, 0).setScale(1);

    const btnPlay = this.add.dom(380, 318, 'button', null, 'Iniciar').setDepth(0).setScale(1.5);
    const buttonElement = btnPlay.node as HTMLButtonElement;
    buttonElement.classList.add('game-arcanum-btn-play');

    buttonElement.addEventListener('click', () => {
      globalState.gameFinished = false; // Reiniciar el estado del juego
      this.transitionToScene('InstructionsScene');
    });

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
  }

private btnMusic() {
  const isCurrentlyMuted = this.sound.mute;
  const initialTexture = isCurrentlyMuted ? 'mute' : 'sound';
  this.volumeButton = this.add.image(750, 50, initialTexture).setInteractive();
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
  private transitionToScene(sceneKey: string) {
    this.input.enabled = false;
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(sceneKey);
      const nextScene = this.scene.get(sceneKey);
      nextScene.cameras.main?.fadeIn(600, 0, 0, 0);
    });
  }
  update() {
    if (this.cursor && this.cursor.visible && this.input.activePointer) {
      this.cursor.setPosition(this.input.activePointer.x, this.input.activePointer.y);
    }
  }
}
