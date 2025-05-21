import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Mostrar barra de progreso
    this.createProgressBar();

    // Precargar imágenes
    this.loadImages();

    // Precargar spritesheets
    this.loadSpritesheets();

    // Precargar audio
    this.loadAudio();
  }

  create() {
    // Cuando todo está cargado, iniciar la siguiente escena
    this.scene.start('menuScene');
  }

  // Metodo para crear la barra de progreso
  private createProgressBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Barra de progreso (fondo)
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    // Texto de carga
    const loadingText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Cargando...',
        style: {
          font: '20px monospace',
          color: '#ffffff'
        }
      })
      .setOrigin(0.5, 0.5);

    // Texto de porcentaje
    const percentText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: {
          font: '18px monospace',
          color: '#ffffff'
        }
      })
      .setOrigin(0.5, 0.5);

    // Actualizar barra de progreso
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    // Eliminar elementos cuando termine la carga
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }
  /// Método para cargar imágenes
  private loadImages() {
    // Menu scene
    this.load.image('background', 'assets/game-arcanum-archer/images/Scenes/background.png');
    this.load.image('containBtn', 'assets/game-arcanum-archer/images/Scenes/buttonLong_beige.png');

    //Instructions scene
    this.load.image('backgroundBook', 'assets/game-arcanum-archer/images/Scenes/book.png');

    //Map scene
    this.load.image('backgroundMap', 'assets/game-arcanum-archer/images/Scenes/example_map.png');
    this.load.image('cursor', 'assets/game-arcanum-archer/images/Controls/cursorHand_grey.png');

    this.load.image('parchment_locked', 'assets/game-arcanum-archer/images/Controls/parchment_locked.png');

    // Levels scenes
    this.load.image('background-1', 'assets/game-arcanum-archer/images/Scenes/Summer4.png');
    this.load.image('background-2', 'assets/game-arcanum-archer/images/Scenes/Summer5.png');
    this.load.image('background-3', 'assets/game-arcanum-archer/images/Scenes/Summer6.png');
    this.load.image('background-4', 'assets/game-arcanum-archer/images/Scenes/origbig3.png');
    this.load.image('background-5', 'assets/game-arcanum-archer/images/Scenes/origbig.png');
    this.load.image('crosshair', 'assets/game-arcanum-archer/images/Controls/Circle_Crosshair6.png');

    // Flechas
    this.load.image('arrow', 'assets/game-arcanum-archer/images/logoArrow.png');
    // Arco
    this.load.image('first-person', 'assets/game-arcanum-archer/images/Controls/logoBow.png');

    // targets
    this.load.image('target', 'assets/game-arcanum-archer/images/Controls/cible.png');
    this.load.image('appleTarget', 'assets/game-arcanum-archer/images/Characters/Fruits/apple.png');

    this.load.image('orangeTarget', 'assets/game-arcanum-archer/images/Characters/Fruits/orange.png');

    // Potions
    this.load.image('potion_icon', 'assets/game-arcanum-archer/images/Collects/potion-violet.png');

    // End game scene
    this.load.image('backgroundEnd', 'assets/game-arcanum-archer/images/Scenes/4.jpg');

    // audio
    this.load.image('mute', 'assets/game-arcanum-archer/images/Controls/transparentLight17.png');
    this.load.image('sound', 'assets/game-arcanum-archer/images/Controls/transparentLight15.png');

    //menu
    this.load.image('menuIcon', 'assets/game-arcanum-archer/images/Controls/transparentLight31.png');
  }
  // Método para cargar spritesheets
  private loadSpritesheets() {
    //Animals
    this.load.spritesheet('bearTarget', 'assets/game-arcanum-archer/images/Characters/Animals/Bear_Walk.png', {
      frameWidth: 64,
      frameHeight: 33
    });
    this.load.spritesheet('deerTarget', 'assets/game-arcanum-archer/images/Characters/Animals/Deer-Spritesheet.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    this.load.spritesheet('deerTargetForward', 'assets/game-arcanum-archer/images/Characters/Animals/Deer_Idle.png', {
      frameWidth: 72,
      frameHeight: 52
    });
    this.load.spritesheet('deerTargetWalk', 'assets/game-arcanum-archer/images/Characters/Animals/Deer_Idle.png', {
      frameWidth: 72,
      frameHeight: 52
    });
    this.load.spritesheet('deerTargetDrink', 'assets/game-arcanum-archer/images/Characters/Animals/Deer_Idle.png', {
      frameWidth: 72,
      frameHeight: 52
    });
    this.load.spritesheet('birdTarget', 'assets/game-arcanum-archer/images/Characters/Animals/bird_1_red.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet('ravenTarget', 'assets/game-arcanum-archer/images/Characters/Animals/raven.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('rabbitTarget', 'assets/game-arcanum-archer/images/Characters/Animals/Rabbit_Idle.png', {
      frameWidth: 32,
      frameHeight: 26
    });
  }
  // Método para cargar audio
  private loadAudio() {
    // Cargar efectos de sonido
    this.load.audio('shoot', 'assets/game-arcanum-archer/sounds/shoot.ogg');
    this.load.audio('reload', 'assets/game-arcanum-archer/sounds/tensar-arco.mp3');
    this.load.audio('hit', 'assets/game-arcanum-archer/sounds/arrow-hit.mp3');
    this.load.audio('getPotion', 'assets/game-arcanum-archer/sounds/Get-Points.ogg');

    this.load.audio('backgroundMusic', 'assets/game-arcanum-archer/sounds/RPG_Title_1.ogg');
  }
}
