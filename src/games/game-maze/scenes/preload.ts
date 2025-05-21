import Phaser from 'phaser';

import { Game } from './game';

export class Preload extends Phaser.Scene {
  gameEvents: Phaser.Events.EventEmitter;
  constructor(gameEvents: Phaser.Events.EventEmitter) {
    super('Preload');
    this.gameEvents = gameEvents;
  }

  preload() {
    this.load.image('tileset', 'assets/game-maze/dungeon.png');
    this.load.tilemapTiledJSON('map', 'assets/game-maze/dungeon.json');
    this.load.spritesheet('player', 'assets/game-maze/img/player.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet('enemy', 'assets/game-maze/img/enemy.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image('lives', 'assets/game-maze/img/lives.png');

    this.load.image('A', 'assets/game-maze/img/A.png');
    this.load.image('B', 'assets/game-maze/img/B.png');
    this.load.image('D', 'assets/game-maze/img/D.png');
    this.load.image('C', 'assets/game-maze/img/C.png');

    this.load.image('sound', 'assets/game-maze/img/volOn.png');
    this.load.image('mute', 'assets/game-maze/img/volOff.png');
    this.load.image('control', 'assets/game-maze/img/control.png');
    this.load.image('pregunta', 'assets/game-maze/img/pregunta.png');

    this.load.image('end', 'assets/game-maze/img/end.png');

    this.load.audio('music', 'assets/game-maze/sounds/music.ogg');
    this.load.audio('success', 'assets/game-maze/sounds/rise.ogg');
    this.load.audio('wrong', 'assets/game-maze/sounds/bz.ogg');
    this.load.audio('lost', 'assets/game-maze/sounds/lost.ogg');
    this.load.audio('hit', 'assets/game-maze/sounds/hit.ogg');

    this.load.once('complete', () => {
      this.gameEvents.emit('preloadComplete');
    });
  }

  create() {
    // this.cameras.main.setBackgroundColor(0xfbfbfbd);

    this.gameEvents.on('startGame', (correctLetter: string) => {
      const gameScene = this.scene.get('Game') as Game;
      if (gameScene.gameOver) {
        gameScene.gameOver = false;
      }
      this.scene.start('Game', { correctLetter });
    });
  }
}
