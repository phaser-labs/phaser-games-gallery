import Phaser from 'phaser';

//configuración principal del juego

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 608,
  backgroundColor: '#121212',
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  dom: {
    createContainer: true
    // behindCanvas: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};
