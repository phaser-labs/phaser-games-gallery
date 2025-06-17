import Phaser from 'phaser';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#121212',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH, 
  },
  dom: {
    createContainer: true
  },
   render: {
        pixelArt: true, // ¡Importante para juegos 16x16!
    },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false, // Cambia a false para producción
      gravity: { y: 300, x: 0 },
    }
  }
};
