import Phaser from 'phaser';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 520,
  backgroundColor: "#869b51",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH, 
  },
  dom: {
    createContainer: true
  }
};
