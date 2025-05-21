import Phaser from 'phaser';
export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 550,
  pixelArt: true,
  backgroundColor: '#121212',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300, x: 0 },
      debug: false
    }
  },
  // ¡AÑADE ESTA LÍNEA PARA HABILITAR DOM!
  dom: {
    createContainer: true, // Crear contenedor DOM
    behindCanvas: true // Posicionar el contenedor DOM sobre el canvas
  }
};

// Función para manejar cambios en pantalla completa

// En tu escena principal
