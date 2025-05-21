import Phaser from 'phaser';

import PhaserGame from '../main/main';

//import { MainScene } from './MainGame';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.createProgressBar();
    this.loadImages();
    this.loadSpritesheets();
    this.loadAudio();
  }

  create() {

    this.cameras.main.setBackgroundColor(0x000000);
    const phaserGameInstance = this.game as PhaserGame;

    

    if (phaserGameInstance && phaserGameInstance.gameEvents) {
      const gameEvents = phaserGameInstance.gameEvents;

      gameEvents.emit('preloadComplete'); // Avisa a React que la precarga terminó
        gameEvents.on('startGame', (data: { questionIndex: number }) => {
          this.scene.start('InstructionScene', { questionIndex: data.questionIndex });
        });
      


    } else {
      console.warn(
        'PreloadScene: phaserGameInstance o phaserGameInstance.gameEvents no está definido. No se pueden emitir/escuchar eventos.'
      );
      if (!phaserGameInstance) console.warn('this.game no es una instancia de PhaserGame como se esperaba.');
      else if (!phaserGameInstance.gameEvents) console.warn('PhaserGame.gameEvents no está definido.');
    }
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

  private loadImages() {
    this.load.image('background', 'assets/game-simple-arquery/images/sceneBg.png');

    // game
    this.load.image('target', 'assets/game-simple-arquery/images/target.png'); 
    this.load.image('bow', 'assets/game-simple-arquery/images/arco.png'); 
    this.load.image('arrow', 'assets/game-simple-arquery/images/arrow.png');
    this.load.image('option-letter', 'assets/game-simple-arquery/images/btntarget.png');
    this.load.image('cord', 'assets/game-simple-arquery/images/sujetador.png');
    this.load.image('end-game-bg', 'assets/game-simple-arquery/images/endGame.jpg');
  }

  private loadSpritesheets() {}

  private loadAudio() {
    this.load.audio('background-sound', 'assets/game-simple-arquery/sounds/TownTheme.mp3');

    // fx game
    this.load.audio('arrowSound', 'assets/game-simple-arquery/sounds/shoot.ogg');
    this.load.audio('arrowHit', 'assets/game-simple-arquery/sounds/arrow-hit.mp3');
    this.load.audio('correct', 'assets/game-simple-arquery/sounds/correct.wav');
    this.load.audio('incorrect', 'assets/game-simple-arquery/sounds/incorrect.mp3');
  }
}
