import config from './config/config';
import { MainScene } from './scenes/MainScene';

interface PhaserGameProps {
    gameId: string;
    gameEvents?: Phaser.Events.EventEmitter;
}

export default class PhaserGame extends Phaser.Game {
  constructor({ gameId, gameEvents }: PhaserGameProps) {
    super({
      ...config,
      backgroundColor: 'transparent',
      parent: gameId,
      scene: [
        MainScene
      ]
    });

    if (gameEvents) {
        this.registry.set('gameEvents', gameEvents);
    }
  }
}
