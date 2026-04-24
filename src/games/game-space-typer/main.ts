import config from './config/config';
import { Boot, MainMenu, MainScene, Preloader } from './scenes';

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
      scene: [Boot, Preloader, MainScene, MainMenu]
    });

    if (gameEvents) {
      this.registry.set('gameEvents', gameEvents);
    }
  }
}
