import Phaser from 'phaser';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1060,
  height: 500,
  backgroundColor: '#121212',
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH, 
  },
  dom: {
    createContainer: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 300, x: 0 },
    }
  }
};
