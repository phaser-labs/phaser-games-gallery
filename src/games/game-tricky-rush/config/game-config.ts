import Phaser, { AUTO } from "phaser";

export const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 640,
    height: 640,
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
