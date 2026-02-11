import { config } from './config/game-config';
import { GameMain } from './scenes/game-main';
import { GameOver } from './scenes/game-over';
import { MainMenu } from './scenes/main-menu';
import { Preloader } from './scenes/preloader';
import { GameResult } from './types/types';


interface PhaserGameProps {
    gameId: string;
    onResult?: (result: GameResult) => void;
    gameEvents?: Phaser.Events.EventEmitter;
}

export default class PhaserGame extends Phaser.Game {
  constructor({ gameId, onResult }: PhaserGameProps) {
    super({
      ...config,
      parent: gameId, // ✅ el div real
      scene: [Preloader, MainMenu, GameMain, GameOver],
    });

    if (onResult) this.registry.set("onResultCallback", onResult);
  }
}

