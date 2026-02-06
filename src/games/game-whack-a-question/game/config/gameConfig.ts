import Phaser from 'phaser';

//configuración principal del juego

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 580,
  backgroundColor: 'transparent',
  render: {
    antialias: false,
    roundPixels: true,
    pixelArt: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  dom: {
    createContainer: true,
    behindCanvas: true // Posicionar el contenedor DOM sobre el canvas
  }
};
