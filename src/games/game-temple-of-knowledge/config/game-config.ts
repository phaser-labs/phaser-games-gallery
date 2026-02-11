import Phaser, { AUTO } from "phaser";

export const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 768,
  height: 672,
  dom: { createContainer: true },
  render: { pixelArt: true, antialias: false, roundPixels: true },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 500, x: 0 }, debug: false },
  },
};
