import Phaser from 'phaser';

import '../../styles/game-whack.css';

// Helper para la región ARIA Live
/* const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
}; */
export class Menu extends Phaser.Scene {
  private backgroundImg!: Phaser.GameObjects.Image;
  bgLayer1!: Phaser.GameObjects.TileSprite;
  bgLayer2!: Phaser.GameObjects.TileSprite;
  bgLayer3!: Phaser.GameObjects.TileSprite;

  isMuted: boolean = false;
  volumeButton!: Phaser.GameObjects.Image;

  // Propiedades para el parallax interactivo
  private mouseX: number = 0;
  private mouseY: number = 0;
  constructor() {
    super('menuScene');
  }

  preload() {}

  create() {
    const { width, height } = this.scale;

    this.game.canvas.setAttribute('tabindex', '0');
    this.cameras.main.setBackgroundColor('#41a9ff');
    this.backgroundImg = this.add.image(0, 0, 'background-1');
    this.backgroundImg.setOrigin(0, 0).setScale(1.8).setDepth(-2);

    this.bgLayer1 = this.add.tileSprite(0, 0, width, height, 'bg-layer-1').setOrigin(0, 0).setDepth(-1).setScale(1.7);
    this.bgLayer2 = this.add.tileSprite(0, 10, width, height, 'bg-layer-2').setOrigin(0, 0).setDepth(0).setScale(1.7);
    this.bgLayer3 = this.add.tileSprite(0, 30, width, height, 'bg-layer-3').setOrigin(0, 0).setDepth(1).setScale(1.7);
    /*     const musicKey = 'backgroundMusic';
    if (!this.sound.get(musicKey)?.isPlaying) {
    
        const music = this.sound.add(musicKey, {
            loop: true,
            volume: 0.1
        });
        music.play();
    }  */

    // Título del juego
    this.add.image(width / 2, height / 4, 'container-title').setOrigin(0.5);

    const textTitle = this.add.dom(150, 90, 'h1', null, 'Whack-a-Question').setOrigin(0, 0);
    const titleGame = textTitle.node as HTMLHeadingElement;
    titleGame.classList.add('game-whack-title');
    

    // Botón de inicio
    this.add.image(width / 2 , height / 2 + 120, 'start-button').setDepth(0).setScale(0.2).setOrigin(0.5);

    const btnPlay = this.add.dom(375, 372, 'button', null, 'INICIAR').setDepth(0).setScale(1.5);
    const buttonElement = btnPlay.node as HTMLButtonElement;
    buttonElement.classList.add('game-whack-btn-play');

    buttonElement.addEventListener('click', () => {
      this.scene.start('gameScene');
    });

    
   

    // Inicializar posición del mouse en el centro
    this.mouseX = width / 2;
    this.mouseY = height / 2;

    // Escuchar movimiento del mouse
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.mouseX = pointer.x;
      this.mouseY = pointer.y;
    });
  }
  update(): void {
    const { width, height } = this.scale;

    // Parallax automático
    this.bgLayer1.tilePositionX += 0.1;

    // Parallax interactivo con el mouse
    const offsetX = (this.mouseX - width / 2) / (width / 2);
    const offsetY = (this.mouseY - height / 2) / (height / 2);

    // Aplicar desplazamiento a las capas con diferente intensidad
    this.bgLayer2.tilePositionX = -offsetX * 1;
    this.bgLayer2.tilePositionY = -offsetY * 0.2;
    this.bgLayer3.tilePositionX = -offsetX * 1.5;
    this.bgLayer3.tilePositionY = -offsetY * 0.2;
  }
}
