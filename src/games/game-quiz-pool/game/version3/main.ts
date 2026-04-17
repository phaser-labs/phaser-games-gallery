import Phaser from 'phaser'; // Importamos Phaser

import { config } from '../../config/gameConfig';
import { Quiz } from '../types/AppTypes';

import { EndGame_v3, LoadMedia_v3, MainScene_v3, MenuScene_v3 } from './scenes';

export default class PhaserGame extends Phaser.Game {
  constructor(parentElement: HTMLDivElement, dataGame: Quiz[]) {
    super({
      ...config, // 📌 Se usa la configuración definida en `gameConfig.ts`
      parent: parentElement, // Se monta en un div de React
      scene: [LoadMedia_v3,MenuScene_v3,  EndGame_v3, MainScene_v3]
    });
    this.events.once('ready', () => {
      this.registry.set('dataGame', dataGame);
    });
  }
}
