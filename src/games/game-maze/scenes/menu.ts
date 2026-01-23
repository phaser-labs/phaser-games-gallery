import Phaser from 'phaser';

export default class Menu extends Phaser.Scene {
  private gameEvents: Phaser.Events.EventEmitter;

  constructor(gameEvents: Phaser.Events.EventEmitter) {
    super('Menu');
    this.gameEvents = gameEvents;
  }

  preload() {
    this.load.image('bg-menu', 'assets/game-maze/img/bg-dungeon-Maze.webp');
  }

  create() {
    this.cameras.main.setBackgroundColor('#121212');

    // Fondo del menú
    this.add.image(400, 304, 'bg-menu').setOrigin(0.5).setDisplaySize(800, 608);
    
    // Contenedor principal que centra todo
    const element = this.add.dom(400, 304).createFromHTML(`
      <div style="
        width: 800px;
        height: 608px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-family: 'PressStart2P', sans-serif;
      ">
        <h1 id="game-title" style="
          font-size: 2rem;
          color: #ffd840;
          text-shadow: 4px 4px 0 #000;
          margin-bottom: 40px;
          animation: blink 1s infinite alternate;
        ">LABERINTO DEL SABER</h1>

        <button id="start-btn" aria-label="Iniciar juego" style="
          font-family: 'PressStart2P';
          font-size: 1rem;
          color: #f7f8f9;
          background-color: #ff9800;
          padding: 20px 40px;
          border: 4px solid #f7f8f9;
          cursor: pointer;
          transition: transform 0.1s, background-color 0.2s;
          box-shadow: 0 4px 0 #b36b00;
        ">INICIAR AVENTURA</button>

        <p style="
          font-family: Arial, sans-serif;
          font-size: 16px;
          color: #f7f8f9;
          margin-top: 40px;
          text-shadow: 1px 1px 2px #000;
          background-color: #161b295c;
          padding: 10px 20px;
          border-radius: 4px;
        ">Usa las flechas para moverte</p>
      </div>

      <style>
        @keyframes blink {
          from { opacity: 1; }
          to { opacity: 0.6; }
        }
        #start-btn:hover {
          background-color: #ec7535;
          transform: scale(1.05);
          
        }
           #start-btn:focus{
           outline: 3px solid #ff9800;
          outline-offset: 4px;
           }
        #start-btn:active {
          transform: scale(0.95);
          box-shadow: 0 2px 0 #b36b00;
        }
      </style>
    `);
    
    // Añadimos el listener al botón del DOM
    const startButton = element.getChildByID('start-btn') as HTMLElement;
    
    if (startButton) {
      startButton.addEventListener('click', () => {
        // Emitir un evento para indicar que el menú se ha completado
        this.gameEvents.emit('menuComplete');
        this.scene.start('Preload');
      });
    }
  }
}
