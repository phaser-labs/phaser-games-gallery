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

    // Contenedor DOM para textos y botón
    const element = this.add.dom(400, 450).createFromHTML(`
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        font-family: 'PressStart2P';
        text-align: center;
      ">
        <h2 style="
          font-size: 24px;
          color: #ffd840;
          text-shadow: 2px 2px 0 #000;
          margin: 0;
        ">¡Felicidades!</h2>
        
        <p style="
          font-size: 18px;
          color: #ffd840;
          text-shadow: 2px 2px 0 #000;
          margin: 0;
        ">Has completado el juego.</p>

        <button id="restart-btn" style="
          font-family: 'PressStart2P';
          font-size: 16px;
          color: #ffffff;
          background-color: #ff9800;
          padding: 15px 30px;
          border: 4px solid #fff;
          cursor: pointer;
          margin-top: 20px;
          transition: transform 0.1s;
          box-shadow: 0 4px 0 #b36b00;
        ">VOLVER AL MENU</button>
      </div>

      <style>
        #restart-btn:hover, #restart-btn:focus {
          background-color: #ec7535;
          transform: scale(1.05);
          outline: 3px solid #ffd840;
          outline-offset: 2px;
        }
        #restart-btn:active {
          transform: scale(0.95);
          box-shadow: 0 2px 0 #b36b00;
        }
      </style>
    `);

    const restartBtn = element.getChildByID('restart-btn') as HTMLElement;
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.gameEvents.emit('restartGame');
        this.scene.start('Menu');
      });
    }
  }
}
