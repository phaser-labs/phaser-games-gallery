import Phaser from 'phaser';

import { createEnemyAnims, createPlayerAnims } from '../utils/anims';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.createProgressBar();
    this.loadImages();
    this.loadSpritesheets();
    this.loadAudio();

    this.load.tilemapTiledJSON('map', 'assets/game-clues-of-wisdom/maps/map.json');

    this.load.atlas(
      'atlas',
      'assets/game-clues-of-wisdom/atlas/atlas.png',
      'assets/game-clues-of-wisdom/atlas/atlas.json'
    );
    this.load.atlas(
      'atlas-props',
      'assets/game-clues-of-wisdom/atlas/atlas-props.png',
      'assets/game-clues-of-wisdom/atlas/atlas-props.json'
    );
  }

  create() {
    this.cameras.main.setBackgroundColor(0x000000);
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
        style: { font: '20px monospace', color: '#ffffff' }
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

      createPlayerAnims(this.anims);
      createEnemyAnims(this.anims);
      //createPropAnims(this.anims);

      // Animación para las muertes de los enemigos
      this.anims.create({
        key: 'enemy_death_anim',
        frames: this.anims.generateFrameNames('atlas', {
          prefix: 'enemy-death/enemy-death-',
          start: 1,
          end: 6
        }),
        frameRate: 15,
        repeat: 0
      });
      // Animación para la zanahoria
      this.anims.create({
        key: 'carrot_spin',
        frames: this.anims.generateFrameNames('atlas', {
          prefix: 'carrot/carrot-',
          start: 1,
          end: 4
        }),
        frameRate: 7,
        repeat: -1
      });

      // Animación para el cofre abierto y cerrado
      this.anims.create({
        key: 'chest_closed',
        frames: [{ key: 'atlas', frame: 'chest/chest-1' }],
        frameRate: 1
      });

      this.anims.create({
        key: 'chest_open',
        frames: [{ key: 'atlas', frame: 'chest/chest-2' }],
        frameRate: 1
      });

      this.scene.start('menuScene'); // Cambia a la escena del menú
    });
  }

  private loadImages() {
    // background parallax
    this.load.image('parallax_bg_far', 'assets/game-clues-of-wisdom/environment/background.png');
    this.load.image('parallax_bg_near', 'assets/game-clues-of-wisdom/environment/middleground.png');

    // Tileset
    this.load.image('mi_tileset', 'assets/game-clues-of-wisdom/environment/tileset.png');
    // Tileset collision
    this.load.image('tileset_collision', 'assets/game-clues-of-wisdom/environment/collisions.png');

    this.load.image('background-menu', 'assets/game-clues-of-wisdom/images/background-menu.png');
  }

  private loadSpritesheets() {}

  private loadAudio() {
    // audio
    this.load.audio('music', [
      'assets/game-clues-of-wisdom/sound/exploration.ogg'
    ]);
    this.load.audio('carrot', [
      'assets/game-clues-of-wisdom/sound/carrot.ogg',
      'assets/game-clues-of-wisdom/sound/carrot.mp3'
    ]);
    this.load.audio('enemy-death', [
      'assets/game-clues-of-wisdom/sound/enemy-death.ogg',
      'assets/game-clues-of-wisdom/sound/enemy-death.mp3'
    ]);
    this.load.audio('hurt', [
      'assets/game-clues-of-wisdom/sound/hurt.ogg',
      'assets/game-clues-of-wisdom/sound/hurt.mp3'
    ]);
    this.load.audio('jump', [
      'assets/game-clues-of-wisdom/sound/jump.ogg',
      'assets/game-clues-of-wisdom/sound/jump.mp3'
    ]);
    this.load.audio('star', [
      'assets/game-clues-of-wisdom/sound/star.ogg',
      'assets/game-clues-of-wisdom/sound/star.mp3'
    ]);
    this.load.audio('chest', [
      'assets/game-clues-of-wisdom/sound/chest.ogg',
      'assets/game-clues-of-wisdom/sound/chest.mp3'
    ]);

    this.load.audio('click', [
      'assets/game-clues-of-wisdom/sound/Click.wav',
    ]);
  }
}
