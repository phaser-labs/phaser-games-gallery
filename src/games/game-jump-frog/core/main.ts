import Phaser from 'phaser'; // Importamos Phaser

import { config } from './config/gameConfig';
import { EndGame, Main, Menu } from './scenes';

interface PhaserGameConfig {
  container: HTMLDivElement;
  gameEvents: Phaser.Events.EventEmitter;
}

export default class PhaserGame extends Phaser.Game {
  constructor({ container, gameEvents }: PhaserGameConfig) {
    super({
      ...config, // 📌 Se usa la configuración definida en `gameConfig.ts`
      parent: container, // Se monta en un div de React
      scene: [Menu, Main, EndGame]
    });
    
    // Almacenar el emitter en el registro global del juego
    this.registry.set('gameEvents', gameEvents);
  }
}
