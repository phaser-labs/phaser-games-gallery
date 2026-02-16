import Phaser from "phaser";

import { WhackQuestion } from "../types/types";

import { config } from "./config/gameConfig";
import { EndGame,Main, Menu, Preload } from "./scenes";

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
      scene: [Preload, Menu, Main, EndGame],
    });

    // Almacenar datos en el registry para que las escenas puedan acceder
    this.registry.set('gameEvents', gameEvents);
    this.registry.set('questionsData', data);
  }
  }
