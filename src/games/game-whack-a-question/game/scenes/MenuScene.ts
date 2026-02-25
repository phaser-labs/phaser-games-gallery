import gsap from 'gsap';
import Phaser from 'phaser';

import { AudioManager, themeManager } from '../../utils';

import '../../styles/game-whack.css';

export class Menu extends Phaser.Scene {
  private backgroundImg!: Phaser.GameObjects.Image;
  bgLayer1!: Phaser.GameObjects.TileSprite;
  bgLayer2!: Phaser.GameObjects.TileSprite;
  bgLayer3!: Phaser.GameObjects.TileSprite;

  private audioManager?: AudioManager;
  private gameEvents?: Phaser.Events.EventEmitter;

  // Sprite para la animación del martillo
  private hammerSwingSprite!: Phaser.GameObjects.Sprite;

  // Modal de instrucciones
  private instructionsModalElement!: Phaser.GameObjects.DOMElement;
  private instructionsModal!: HTMLElement;

  constructor() {
    super('menuScene');
  }

  preload() {}

  create() {
    const { width, height } = this.scale;

    // Obtener gameEvents del registry
    this.gameEvents = this.registry.get('gameEvents');

    // Escuchar cambios de tema
    if (this.gameEvents) {
      this.gameEvents.on('themeChanged', this.handleThemeChange, this);
    }

    // Fade in al iniciar la escena
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Asegurar que el cursor sea normal en el menú
    this.input.setDefaultCursor('default');

    this.game.canvas.setAttribute('tabindex', '0');
    this.cameras.main.setBackgroundColor('#41a9ff');
    this.backgroundImg = this.add.image(0, 0, 'background-1');
    this.backgroundImg.setOrigin(0, 0).setScale(1.8).setDepth(-2);

    this.bgLayer1 = this.add.tileSprite(0, 0, width, height, 'bg-layer-1').setOrigin(0, 0).setDepth(-1).setScale(1.7);
    this.bgLayer2 = this.add.tileSprite(0, 10, width, height, 'bg-layer-2').setOrigin(0, 0).setDepth(0).setScale(1.7);
    this.bgLayer3 = this.add.tileSprite(0, 30, width, height, 'bg-layer-3').setOrigin(0, 0).setDepth(1).setScale(1.7);

    // Inicializar AudioManager con la música del tema actual
    const currentTheme = themeManager.getCurrentTheme();
    const ambienceMusicKey = currentTheme.assets.ambiencesSounds[0]?.name || 'bg_music-normal';

    this.audioManager = new AudioManager(this, {
      musicKey: ambienceMusicKey,
      x: width - 30,
      y: 40,
      depth: 50,
      volume: 0.02
    });

    // Guardar referencia global para otras escenas
    this.registry.set('audioManager', this.audioManager);

    // animacion hammer
    if (!this.anims.exists('hammer-swing-anim')) {
      this.anims.create({
        key: 'hammer-swing-anim',
        frames: this.anims.generateFrameNumbers('hammer-swing', { start: 25, end: 0 }), 
        frameRate: 18,  
        repeat: 0,
        yoyo: true
      });
    
    }

    // Crear sprite de animación del martillo (inicialmente oculto)
    this.hammerSwingSprite = this.add.sprite(width / 2 + 50, height / 2 - 38, 'hammer-swing', 0)
      .setDepth(100) // Por encima de todo
      .setScale(2.8)
      .setVisible(false); // Oculto hasta que se haga clic en Play



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

    // Crear modal de instrucciones
    this.createInstructionsModal();

    buttonElement.addEventListener('click', () => {
      this.audioManager?.play('clic_sound', { volume: 0.3 });
      
      // Deshabilitar el botón para evitar múltiples clicks
      buttonElement.disabled = true;
      buttonElement.style.pointerEvents = 'none';
      
      // Mostrar y reproducir la animación del martillo
      this.hammerSwingSprite.setVisible(true);
      this.hammerSwingSprite.play('hammer-swing-anim');
      
      // Cuando termine la animación, mostrar el modal de instrucciones
      this.hammerSwingSprite.once('animationcomplete', () => {
        setTimeout(() => {
          this.showInstructionsModal();
        }, 300); // Pequeña pausa para que el golpe se sienta más natural
      });
    });


  }

  private createInstructionsModal() {
    const { width, height } = this.scale;

    // Crear el modal HTML (sin la clase 'show' para que inicie oculto a la derecha)
    const modalHTML = `
      <div class="game-whack_instructions-modal">
        <div class="game-whack_instructions-content">
          <h2 class="game-whack_instructions-title">¿CÓMO JUGAR?</h2>
          <ul class="game-whack_instructions-list">
            <li>Golpea los topos que aparezcan con las respuestas correctas</li>
            <li>Evita golpear los topos distractores (sin respuestas)</li>
            <li>Tienes 25 segundos para responder cada pregunta</li>
            <li>Tienes 3 vidas - cada respuesta incorrecta resta una vida</li>
            <li>Usa el mouse o las teclas de dirección para navegar</li>
            <li>Presiona ESPACIO o ENTER para golpear con el teclado</li>
          </ul>
          <button id="start-game-btn" tabindex="0" class="game-whack_instructions-start-button">
            ¡JUGAR AHORA!
          </button>
        </div>
      </div>
    `;

    // Crear DOMElement dentro del canvas de Phaser
    this.instructionsModalElement = this.add.dom(0, 0, 'div')
      .setOrigin(0, 0)
      .setDepth(200)
      .setVisible(false);

    const container = this.instructionsModalElement.node as HTMLDivElement;
    container.innerHTML = modalHTML;
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    this.instructionsModal = container.querySelector('.game-whack_instructions-modal') as HTMLElement;

    // Configurar evento del botón para iniciar el juego
    const startGameBtn = container.querySelector('#start-game-btn') as HTMLButtonElement;
    startGameBtn.addEventListener('click', () => {
      this.audioManager?.play('clic_sound', { volume: 0.3 });
      this.hideInstructionsModal();
    });
  }

  private showInstructionsModal() {
    if (this.instructionsModalElement && this.instructionsModal) {
      // Ocultar la animación del martillo
      this.hammerSwingSprite.setVisible(false);
      
      // Mostrar el DOMElement
      this.instructionsModalElement.setVisible(true);
      
      // Configurar posición inicial fuera de pantalla (derecha)
      gsap.set(this.instructionsModal, { 
        x: '100%',
        opacity: 1
      });
      
      // Animar entrada desde la derecha con GSAP
      gsap.to(this.instructionsModal, {
        x: '0%',
        duration: 0.8,
        ease: 'back.out(1.2)'
      });
    }
  }

  private hideInstructionsModal() {
    if (this.instructionsModal) {
      // Animar salida hacia la izquierda con GSAP
      gsap.to(this.instructionsModal, {
        x: '-100%',
        duration: 0.6,
        ease: 'power2.in',
        onComplete: () => {
          // eliminar el DOMElement después de la animación
          if (this.instructionsModalElement) {
            this.instructionsModalElement.destroy();
          }
          // Fade out antes de cambiar a la escena del juego
          this.cameras.main.fadeOut(200, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('gameScene');
          });
        }
      });
    }
  }

  private handleThemeChange(): void {
    // Reiniciar la escena del menú para cargar los assets del nuevo tema
    // La música se detendrá automáticamente al reiniciar la escena
    this.scene.restart();
  }

  update(): void {
    // Parallax automático
    this.bgLayer1.tilePositionX += 0.1;
  }

  shutdown(): void {
    // Limpiar listeners
    if (this.gameEvents) {
      this.gameEvents.off('themeChanged', this.handleThemeChange, this);
    }
  }
}
