import Phaser from 'phaser';
export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1100,
  height: 650,
  pixelArt: true,
  backgroundColor: '#000000',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // physics: {
  //   default: 'arcade',
  //   arcade: {
  //     debug: true,
  //     debugShowBody: true,
  //     debugBodyColor: 0xffffff
  //   }
  // },
  physics: {
    default: 'matter',
    matter: {
      debug: false, // Muestra contornos de colisión
      gravity: { x: 0, y: 0 } // 0 para top-down
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
