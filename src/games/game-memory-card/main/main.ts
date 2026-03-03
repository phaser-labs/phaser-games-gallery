import Phaser from 'phaser';

import { config as baseGameConfig } from '../config/config';
import { BootScene, PlayScene, PreloaderScene } from '../scenes';
import { ICardData } from '../utils/types';

interface PhaserGameProps {
  containerId: string;
  cards?: ICardData[];
  onResult?: (isCorrect: boolean) => void;
}

export default class PhaserGame extends Phaser.Game {
  constructor({ containerId, cards, onResult }: PhaserGameProps) {
    const finalGameConfig: Phaser.Types.Core.GameConfig = {
      ...baseGameConfig,
      parent: containerId,
      render: {
        pixelArt: true
      },
      scene: [BootScene, PreloaderScene, PlayScene]
    };

    super(finalGameConfig);

    // Guardar las cartas en el registro global para que las escenas las lean
    if (cards && cards.length > 0) {
      this.registry.set('cardData', cards);
    }
    // Guardar el callback onResult en el registro
    if (onResult) {
      this.registry.set('onResult', onResult);
    }
  }
}
