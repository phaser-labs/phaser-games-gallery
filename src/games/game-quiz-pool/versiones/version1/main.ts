import Phaser from 'phaser'; // Importamos Phaser

import { config } from '../../config/gameConfig';
import { Quiz } from '../../types/AppTypes';

import { EndGame, LoadMedia, Main, Menu } from './scenes';

export default class PhaserGame extends Phaser.Game {
  constructor(parentElement: HTMLDivElement, dataGame: Quiz[]) {
    super({
      ...config, // 📌 Se usa la configuración definida en `gameConfig.ts`
      parent: parentElement, // Se monta en un div de React
      scene: [LoadMedia, Menu, Main, EndGame]
    });
    this.events.once('ready', () => {
      // this.scene.stop('MenuScene'); // detener si ya arrancó
      this.scene.start('MenuScene', { dataGame });
    });
  }
}
