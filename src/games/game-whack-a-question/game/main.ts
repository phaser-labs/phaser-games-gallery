import Phaser from "phaser";

import { WhackQuestion } from "../game-whack-a-question";

import { config } from "./config/gameConfig";
import { Main, Menu, Preload } from "./scenes";

interface PhaserGameProps {
  gameId: string;
  gameEvents: Phaser.Events.EventEmitter;
  data: WhackQuestion[];
}

export default class PhaserGame extends Phaser.Game {
  
  constructor({ gameId, gameEvents, data }: PhaserGameProps) {
    super({
      ...config, // 📌 Se usa la configuración definida en `gameConfig.ts`
      parent: gameId, // Se monta en un div de React
      scene: [Preload, Menu, Main],
    });

    // Almacenar datos en el registry para que las escenas puedan acceder
    this.registry.set('gameEvents', gameEvents);
    this.registry.set('questionsData', data);
  }
}
