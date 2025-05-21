import '../styles/GameMaze.css';

export class End extends Phaser.Scene {
  gameEvents: Phaser.Events.EventEmitter;
  constructor(gameEvents: Phaser.Events.EventEmitter) {
    super('End');
    this.gameEvents = gameEvents;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x121212);
    this.add.image(400, 300, 'end');

    this.add.text(270, 390, '¡Felicidades!', {
      fontFamily: 'PressStart2P',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffd840'
    });

    this.add.text(170, 460, 'Has completado el juego.', {
      fontFamily: 'PressStart2P',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffd840'
    });

    this.input.once('pointerdown', () => {
      this.gameEvents.emit('restartGame'); // 🔁 Notificar a React
      this.scene.start('Preload');
    });
  }
}
