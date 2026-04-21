import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true,
    powerPreference: 'high-performance',
  },
  dom: { createContainer: true },
  backgroundColor: 'trasnparent',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 900,
    height: 600,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  }
};

export default config;
