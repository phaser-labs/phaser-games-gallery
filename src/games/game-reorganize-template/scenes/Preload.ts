import Phaser from 'phaser';

import PhaserGame from '../main/main';
import { WORLD_THEMES } from '../utils/types';

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
    const phaserGameInstance = this.game as PhaserGame;

    if (phaserGameInstance && phaserGameInstance.gameEvents) {
      const gameEvents = phaserGameInstance.gameEvents;

      // Emitir evento para que React muestre el modal de título
      gameEvents.emit('preloadComplete');
      
      // Escuchar evento para iniciar las instrucciones
      gameEvents.on('startInstructions', (data: { questionIndex: number }) => {
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
    // Cargar todas las imágenes de todos los temas dinámicamente
    WORLD_THEMES.forEach((theme) => {
      theme.assets.images.forEach((image) => {
        // Crear nombres únicos por tema para evitar conflictos
        const uniqueName = `${theme.name.toLowerCase()}-${image.name}`;
        this.load.image(uniqueName, image.path);
        
        // También cargar con el nombre original para compatibilidad
        this.load.image(image.name, image.path);
      });
    });

    // Cargar imagen de fondo principal del primer tema como fallback
    const defaultTheme = WORLD_THEMES[0];
    const mainBg = defaultTheme.assets.images.find(img => img.name === 'bg-main');
    if (mainBg) {
      this.load.image('bg-main', mainBg.path);
    }
  }

  private loadSpritesheets() {}

  private loadAudio() {
    // Cargar audio de todos los temas
    WORLD_THEMES.forEach((theme) => {
      theme.assets.sounds.forEach((sound) => {
        // Crear nombres únicos por tema para evitar conflictos
        const uniqueName = `${theme.name.toLowerCase()}-${sound.name}`;
        this.load.audio(uniqueName, sound.path);
        
        // También cargar con el nombre original para compatibilidad
        this.load.audio(sound.name, sound.path);
      });
    });

    // globales 
    this.load.audio('isCorrect', 'assets/game-reorganize-template/sounds/Confirm.wav');
    this.load.audio('isIncorrect', 'assets/game-reorganize-template/sounds/Cancel.wav');
    //endGame
    this.load.audio('endGame', 'assets/game-reorganize-template/sounds/level-complete.wav');
  }
}
