import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    this.add.image(512, 384, 'background');

    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    this.load.on('progress', (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath('assets/quiz-flight');
    this.load.image('airplane', './images/airplane.png');
    this.load.image('correct', './images/correct.png');
    this.load.image('incorrect', './images/incorrect.png');
    this.load.image('banner', './images/banner-title.png');
    this.load.image('sound-on', './images/sound-on.png');
    this.load.image('sound-off', './images/sound-off.png');

    this.load.audio('game-audio', './audios/game.mp3', { volume: 0.5, loop: true });
    this.load.audio('correct', './audios/correct.mp3', { volume: 0.5, loop: true });
    this.load.audio('incorrect', './audios/incorrect.mp3', { volume: 0.5, loop: true });
  }
  create() {
    const newFontFace = new FontFace('Bangers', 'url(assets/quiz-flight/fonts/Bangers.ttf)');
    document.fonts.add(newFontFace);
    newFontFace.load().then(() => {
      this.scene.start('MainMenu');
    });
  }
}
