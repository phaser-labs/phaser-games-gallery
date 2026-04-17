import Phaser from 'phaser';
export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1300,
  height: 1000,
  antialias: true, // ← activa antialiasing global
  pixelArt: false,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'matter',
    // matter: {
    //      enabled: true,
    //      positionIterations: 6,
    //      velocityIterations: 1000,
    //      constraintIterations: 2,
    //      enableSleeping: false,

    //      gravity: {
    //          x: 0,
    //          y: 0,
    //      },
    //      setBounds: {
    //          x: 0,
    //          y: 0,

    //          thickness: 64,
    //          left: true,
    //          right: true,
    //          top: true,
    //          bottom: true,
    //      },
    //      correction: 1,
    //      getDelta: (function() { return 1000 / 60; }),
    //      autoUpdate: true,
    //      debug: false,
    // },
  },
  // ¡AÑADE ESTA LÍNEA PARA HABILITAR DOM!
  dom: {
    createContainer: true, // Crear contenedor DOM
    behindCanvas: true // Posicionar el contenedor DOM sobre el canvas
  }
};

// Función para manejar cambios en pantalla completa

// En tu escena principal
