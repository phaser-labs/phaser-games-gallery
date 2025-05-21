import Phaser from 'phaser';

import { config } from '../config/config';
import { End, Game, Preload } from '../scenes';

interface PhaserGameProps {
  containerId: string;
  gameEvents: Phaser.Events.EventEmitter;
}
export default class PhaserGame extends Phaser.Game {
  constructor({ containerId, gameEvents }: PhaserGameProps) {
    super({
      ...config,
      parent: containerId,
      scene: [
        new Preload(gameEvents), // Pasamos gameEvents a Preload
        new Game(gameEvents), // Pasamos gameEvents a Game
        new End(gameEvents)
      ]
    });
  }
}
