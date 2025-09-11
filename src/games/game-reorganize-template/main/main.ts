import Phaser from 'phaser';

import { config as baseGameConfig } from '../config/config';
import { EndScene, InstructionScene, MainScene, PreloadScene } from '../scenes';

interface PhaserGameProps {
  containerId: string;
  gameEvents: Phaser.Events.EventEmitter;
  initialMuteState?: boolean;
}

export default class PhaserGame extends Phaser.Game {
  public gameEvents: Phaser.Events.EventEmitter;

  constructor({ containerId, gameEvents, initialMuteState = false }: PhaserGameProps) {
    const finalGameConfig: Phaser.Types.Core.GameConfig = {
      ...baseGameConfig,
      parent: containerId,
      scene: [PreloadScene, InstructionScene, MainScene, EndScene]
    };

    super(finalGameConfig);
    this.gameEvents = gameEvents;

    // Aplicar el estado inicial de mute
    if (this.sound) {
      this.sound.mute = initialMuteState;
    }

    // --- LISTENERS DE EVENTOS GLOBALES ---

    // Escuchar el evento para cambiar el mute desde React
    this.gameEvents.on('toggleMute', (shouldMute: boolean) => {
      if (this.sound) {
        this.sound.mute = shouldMute;
        console.log(`PhaserGame: Estado de mute actualizado a: ${this.sound.mute}`);
      }
    });

    // Escuchar el evento para iniciar las instrucciones desde React
    this.gameEvents.on('startInstructions', (data: { questionIndex: number }) => {
      this.scene.start('InstructionScene', { questionIndex: data.questionIndex });
    });

    // Escuchar el evento para cargar la siguiente pregunta/nivel
    this.gameEvents.on('loadNextQuestion', (data: { questionIndex: number }) => {
      // Detener la MainScene actual si está activa para limpiarla antes de iniciar la nueva
      if (this.scene.isActive('MainScene')) {
        console.log('PhaserGame: Deteniendo MainScene activa.');
        this.scene.stop('MainScene');
      }

      // Iniciar la InstructionScene (que luego iniciará MainScene)
      this.scene.start('InstructionScene', { questionIndex: data.questionIndex });
    });

  }

  // Sobrescribir destroy para limpiar todos los listeners de gameEvents
  destroy(removeCanvas: boolean, noReturn?: boolean): void {
    // Detener todas las escenas activas para asegurar limpieza
    const activeScenes = ['PreloadScene', 'InstructionScene', 'MainScene', 'EndScene'];
    activeScenes.forEach(sceneName => {
      if (this.scene.isActive(sceneName)) {
        console.log(`PhaserGame: Deteniendo escena activa: ${sceneName}`);
        this.scene.stop(sceneName);
      }
    });
    
    // Limpiar todos los listeners de gameEvents
    if (this.gameEvents) {
      this.gameEvents.removeAllListeners();
    }
    
    super.destroy(removeCanvas, noReturn);
  }
}
