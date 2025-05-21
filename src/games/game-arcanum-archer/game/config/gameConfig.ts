import Phaser from "phaser";

//configuración principal del juego

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500, x: 0 },
      debug: false 
  }
  },
  dom: {
    createContainer: true,
  },
  
};

/*  */
  