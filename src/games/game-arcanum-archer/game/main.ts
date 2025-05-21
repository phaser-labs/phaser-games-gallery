import Phaser from "phaser"; // Importamos Phaser

import { config } from "./config/gameConfig";
import { EndGame, Instructions, Level1, Level2, Level3, Level4,Level5, LevelMapScene , Menu, PreloadScene, UIScene } from "./scenes";

interface PhaserGameProps {
  gameId: string;
}
export default class PhaserGame extends Phaser.Game {
  
  constructor({ gameId }: PhaserGameProps) {
    super({
      ...config, // 📌 Se usa la configuración definida en `gameConfig.ts`
      parent: gameId, // Se monta en un div de React
      scene: [PreloadScene,  Menu, Instructions, LevelMapScene ,Level1, UIScene, Level2, Level3, Level4, Level5, EndGame],
    });
  }
}
