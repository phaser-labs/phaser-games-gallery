
import { config } from './config/game-config';
import { Boot } from './scenes/boot';
import { EndGame } from './scenes/end-game';
import { Game as MainGame } from './scenes/game';
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
            scene: [
                Preloader,
                Boot,
                MainMenu,
                MainGame,
                EndGame
            ],
        });

        if (onResult) this.registry.set("onResultCallback", onResult);
    }
}


