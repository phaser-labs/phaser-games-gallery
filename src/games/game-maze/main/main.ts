import Phaser from 'phaser';

import { config } from '../config/config';
import { End, Game, Menu,Preload } from '../scenes';

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
        new Menu(gameEvents),
        new Preload(gameEvents),
        new Game(gameEvents),
        new End(gameEvents)
      ]
    });
  }
}
