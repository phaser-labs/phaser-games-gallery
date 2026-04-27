import Phaser, { AUTO } from "phaser";

export const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 600,
    dom: { createContainer: true },
    render: { pixelArt: true, antialias: false, roundPixels: true, antialiasGL: false },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: "arcade",
        arcade: { gravity: { y: 0, x: 0 }, debug: false },
    },
    fps: {
        target: 60,
        forceSetTimeOut: false,
        deltaHistory: 10,
        panicMax: 120,  // 🔥 limita delta máximo a 120ms
    }
}
