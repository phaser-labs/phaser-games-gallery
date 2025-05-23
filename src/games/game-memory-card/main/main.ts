import Phaser from 'phaser';

import { config as baseGameConfig } from '../config/config';
import { PlayScene as Play , PreloaderScene as Preloader } from '../scenes';

interface PhaserGameProps {
  containerId: string;
}

export default class PhaserGame extends Phaser.Game {

  constructor({ containerId}: PhaserGameProps) {
    const finalGameConfig: Phaser.Types.Core.GameConfig = {
      ...baseGameConfig,
      parent: containerId,
      render: {
        pixelArt: true,
    },
    scene: [
        Preloader,
        Play
    ]
    };

    super(finalGameConfig);
  }
}
