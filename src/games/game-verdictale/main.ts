import { config } from './config/game-config';
import { EndGame } from './scenes/end-game';
import { Game as MainGame } from './scenes/game';
import { Interior } from './scenes/interior';
import { MainMenu } from './scenes/main-menu';
import { Preloader } from './scenes/preloader';
import { AnswerResult } from './types/types';


interface PhaserGameProps {
    gameId: string;
    onResult?: (result: AnswerResult) => void;
    gameEvents?: Phaser.Events.EventEmitter;
}

export default class PhaserGame extends Phaser.Game {
  constructor({ gameId, onResult }: PhaserGameProps) {
    super({
      ...config,
      parent: gameId, // ✅ el div real
      scene: [
        Preloader,
        MainMenu,
        MainGame, 
        Interior, 
        EndGame
        ],
    });

    if (onResult) this.registry.set("onResultCallback", onResult);
  }
}

