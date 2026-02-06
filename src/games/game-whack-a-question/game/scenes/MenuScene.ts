import Phaser from 'phaser';



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
  //private backgroundImg!: Phaser.GameObjects.Image;

  isMuted: boolean = false;
  volumeButton!: Phaser.GameObjects.Image;
  constructor() {
    super('menuScene');
  }

  preload() {}

  create() {
    this.game.canvas.setAttribute('tabindex', '0');
    this.cameras.main.setBackgroundColor('#41a9ff');
/*     this.backgroundImg = this.add.image(0, 0, 'background');
    this.backgroundImg.setOrigin(0, 0).setScale(1); */

/*     const musicKey = 'backgroundMusic';
    if (!this.sound.get(musicKey)?.isPlaying) {
    
        const music = this.sound.add(musicKey, {
            loop: true,
            volume: 0.1
        });
        music.play();
    }  */

    // Título del juego
    this.add.text(this.scale.width / 2, 100, '¡Atrapa la Respuesta!', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Botón de inicio
    const startButton = this.add.rectangle(
      this.scale.width / 2, 
      this.scale.height / 2, 
      200, 
      60, 
      0x00ff00
    ).setInteractive({ useHandCursor: true });

    this.add.text(
      this.scale.width / 2, 
      this.scale.height / 2, 
      'INICIAR', 
      {
        fontSize: '32px',
        color: '#000000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Efecto hover
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x00cc00);
    });

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x00ff00);
    });

    // Click para iniciar
    startButton.on('pointerdown', () => {
      this.scene.start('gameScene');
    });
  }

}
