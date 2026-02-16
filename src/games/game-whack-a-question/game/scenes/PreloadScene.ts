import Phaser from 'phaser';

export class Preload extends Phaser.Scene {
  constructor() {
    super('preloadScene');
  }

  preload() {
    this.load.image('tiles_ground', 'assets/game-whack-a-question/tiles/Topdown RPG 32x32 - Ground Tileset 1.2.PNG');
    this.load.image('tiles_trees', 'assets/game-whack-a-question/tiles/Topdown RPG 32x32 - Trees 1.2.PNG');

    this.load.tilemapTiledJSON('mapa_bosque', 'assets/game-whack-a-question/tiles/normalMapWhackAQuestion.json');

    this.createProgressBar();
    this.loadImages();
    this.loadSpritesheets();
    this.loadAudio();
  }

  create() {
    this.scene.start('menuScene');
  }

  private loadImages() {
    this.load.image('background-1', 'assets/game-whack-a-question/images/nature_5/1.png');

    this.load.image('bg-layer-1', 'assets/game-whack-a-question/images/nature_5/2.png');
    this.load.image('bg-layer-2', 'assets/game-whack-a-question/images/nature_5/3.png');
    this.load.image('bg-layer-3', 'assets/game-whack-a-question/images/nature_5/4.png');

    this.load.image('container-title', 'assets/game-whack-a-question/images/whackBG.webp');
    this.load.image('start-button', 'assets/game-whack-a-question/images/cartel-inicio.webp');

    this.load.image('background_sky', 'assets/game-whack-a-question/images/backgrounds/background_sky.png');

    this.load.image('clouds_medium', 'assets/game-whack-a-question/images/backgrounds/background_clouds_medium.png');
    this.load.image('clouds_small', 'assets/game-whack-a-question/images/backgrounds/background_clouds_small.png');

    this.load.image('cartel-pregunta', 'assets/game-whack-a-question/images/cartel-pregunta.png');

      this.load.image('pause_overlay', 'assets/game-whack-a-question/images/pause_overlay.png');
      this.load.image('play_overlay', 'assets/game-whack-a-question/images/pause_instruction.png');

      this.load.image('sound-off', 'assets/game-whack-a-question/images/Speaker-Crossed.png');
      this.load.image('sound-on', 'assets/game-whack-a-question/images/Speaker-0.png');
  }

  private loadSpritesheets() {
    this.load.spritesheet('mole', 'assets/game-whack-a-question/sprites/mole.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hole', 'assets/game-whack-a-question/sprites/hole.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hurt-mole', 'assets/game-whack-a-question/sprites/hurt-mole.png', {
      frameWidth: 64,
      frameHeight: 64
    });
  }

  private loadAudio() {
    this.load.audio('clic_sound', 'assets/game-whack-a-question/music/fx/Click.wav');
    this.load.audio('pause_sound', 'assets/game-whack-a-question/music/fx/Pause.wav');

    // Música de fondo para diferentes themes 
    this.load.audio('bg_music-normal', 'assets/game-whack-a-question/music/ambience/normal-game.mp3'); //default
    this.load.audio('bg_music-beach', 'assets/game-whack-a-question/music/ambience/beach-game.mp3');
    this.load.audio('bg_music-moon', 'assets/game-whack-a-question/music/ambience/moon-game.mp3');

    this.load.audio('hurt_sound', 'assets/game-whack-a-question/music/fx/hurt-mole.mp3');

    this.load.audio('wrong_sound', 'assets/game-whack-a-question/music/fx/wrong.wav');
    this.load.audio('success_sound', 'assets/game-whack-a-question/music/fx/success.mp3');

    this.load.audio('win_sound', 'assets/game-whack-a-question/music/fx/win-scene.mp3');
    this.load.audio('lose_sound', 'assets/game-whack-a-question/music/fx/game-over-scene.mp3');
  }
  private createProgressBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    const loadingText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Cargando...',
        style: { font: '20px monospace', color: '#000' }
      })
      .setOrigin(0.5, 0.5);

    const percentText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: { font: '18px monospace', color: '#eee' }
      })
      .setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00000, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }
}
