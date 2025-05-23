import Phaser from 'phaser';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 549,
  height: 480,
  backgroundColor: "#a1ae57",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH, 
  },
  dom: {
    createContainer: true
  }
};
