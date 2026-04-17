import Phaser from 'phaser'; // Importamos Phaser

import { config } from '../../config/gameConfig';
import { Quiz } from '../types/AppTypes';

import { MenuScene_v2 } from './scenes/MenuScene';
import { EndGame_v2, LoadMedia_v2, Main_v2 } from './scenes';

export default class PhaserGame extends Phaser.Game {
  constructor(parentElement: HTMLDivElement, dataGame: Quiz[]) {
    super({
      ...config, // 📌 Se usa la configuración definida en `gameConfig.ts`
      parent: parentElement, // Se monta en un div de React
      scene: [LoadMedia_v2, MenuScene_v2, Main_v2, EndGame_v2]
    });
    this.events.once('ready', () => {
      this.registry.set('dataGame', dataGame);
    });
  }
}