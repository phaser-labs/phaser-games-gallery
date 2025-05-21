import Phaser from 'phaser'; // Importamos Phaser

import { config } from './config/gameConfig';
import { DiceScene, EndGame, Main, Menu } from './scenes';

export default class PhaserGame extends Phaser.Game {
  constructor(parentElement: HTMLDivElement) {
    super({
      ...config, // 📌 Se usa la configuración definida en `gameConfig.ts`
      parent: parentElement, // Se monta en un div de React
      scene: [Menu, EndGame, Main, DiceScene]
    });
  }
}
