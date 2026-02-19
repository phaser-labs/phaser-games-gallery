import { AudioManager } from '../../utils/AudioManager';

export class EndGame extends Phaser.Scene {
  // Capas de nubes para el efecto parallax
  backgroudSky!: Phaser.GameObjects.Image;
  private cloudsMedium!: Phaser.GameObjects.TileSprite;
  private cloudsSmall!: Phaser.GameObjects.TileSprite;
  private map!: Phaser.Tilemaps.Tilemap;
  private readonly MAP_SCALE = 0.84; // Escala del mapa
  private won: boolean = false; // Indica si ganó o perdió
  private GuiElement?: Phaser.GameObjects.DOMElement;
  private audioManager?: AudioManager;
  
  constructor() {
    super('endGameScene');
  }
  
  init(data: { won: boolean }) {
    this.won = data.won || false;
  }
  
  preload() {}

  create() {
    const { width, height } = this.scale;

    // Fade in al iniciar la escena
    this.cameras.main.fadeIn(100, 0, 0, 0);

    // Asegurar que el cursor sea normal en la pantalla de fin de juego
    this.input.setDefaultCursor('default');

    // --- FONDO CON PARALLAX ---
    // Fondo de cielo estático
    this.backgroudSky = this.add
      .image(0, -200, 'background_sky')
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setDepth(-2);

    // Nubes medianas (velocidad media)
    this.cloudsMedium = this.add
      .tileSprite(0, 0, width, height, 'clouds_medium')
      .setOrigin(0, 0)
      .setDepth(-1)
      .setScale(1.2);

    // Nubes pequeñas (más rápidas, más cerca)
    this.cloudsSmall = this.add
      .tileSprite(0, 50, width, height, 'clouds_small')
      .setOrigin(0, 0)
      .setDepth(-2)
      .setScale(1)
      .setAlpha(0.8);

    // --- MAPA TILEMAP ---
    this.map = this.make.tilemap({ key: 'mapa_bosque' });

    // Obtener los nombres de los tilesets desde el JSON del mapa (dinámico según el tema)
    const tilesetGround = this.map.addTilesetImage(
      this.map.tilesets[0].name,
      'tiles_ground'
    );
    const tilesetTrees = this.map.addTilesetImage(
      this.map.tilesets[1].name,
      'tiles_trees'
    );

    if (!tilesetGround || !tilesetTrees) {
      console.error('No se encontraron los tilesets');
      return;
    }

    // Crear las capas
    const tierraLayer = this.map.createLayer('Tierra', [tilesetGround, tilesetTrees], 0, 0);
    const objetosLayer = this.map.createLayer('Objetos', [tilesetGround, tilesetTrees], 0, 0);

    // Escalar ambas capas
    tierraLayer?.setScale(this.MAP_SCALE);
    objetosLayer?.setScale(this.MAP_SCALE);

    tierraLayer?.setDepth(0);
    objetosLayer?.setDepth(3);

    // === AUDIO MANAGER ===
    // Recuperar AudioManager del registry
    this.audioManager = this.registry.get('audioManager') as AudioManager;
    if (this.audioManager) {
      this.audioManager.attachScene(this);
      // Crear el botón visual en esta escena
      this.audioManager.createButtonInScene(this, width - 40, 40, 100);
    }

    // Reproducir música de fondo según resultado
    const soundKey = this.won ? 'win_sound' : 'lose_sound';
    this.audioManager?.play(soundKey, { volume: 0.03 });

    // --- GUI CONTAINER ---
    this.GuiElement = this.add.dom(0, 230, 'div').setOrigin(0, 0).setDepth(100);
    const guiContainer = this.GuiElement.node as HTMLDivElement;
    guiContainer.classList.add('game-whack_endgame-container');

    // --- MENSAJE DE RESULTADO ---
    const resultMessage = this.won ? '¡FELICIDADES!' : '¡GAME OVER!';
    const resultClass = this.won ? 'game-whack_endgame-title--win' : 'game-whack_endgame-title--lose';
    const resultSubtext = this.won ? 'Completaste todas las preguntas' : 'Te quedaste sin vidas';

    const endGameHTML = `
      <div class="game-whack_endgame-content">
        <h1 class="game-whack_endgame-title ${resultClass}">${resultMessage}</h1>
        <p class="game-whack_endgame-subtext">${resultSubtext}</p>
        <button class="game-whack_endgame-button">VOLVER A JUGAR</button>
      </div>
    `;
    
    guiContainer.innerHTML = endGameHTML;

    // Obtener referencia al botón y configurar evento
    const restartButton = guiContainer.querySelector('.game-whack_endgame-button') as HTMLButtonElement;
    const targetScene = this.won ? 'menuScene' : 'gameScene';
    
    restartButton.addEventListener('click', () => {
      // Detener todos los sonidos de esta escena antes de cambiar
      this.sound.stopAll();
      // Ocultar elementos DOM antes del fade
      if (this.GuiElement) {
        this.GuiElement.setAlpha(0);
      }
      // Fade out antes de cambiar de escena
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(targetScene);
      });
    });
  }

  update() {
    // Animación de parallax - mover las nubes a diferentes velocidades
    if (this.cloudsMedium) {
      this.cloudsMedium.tilePositionX += 0.3; // Nubes medianas velocidad media
    }
    if (this.cloudsSmall) {
      this.cloudsSmall.tilePositionX += 0.08; // Nubes pequeñas más lentas
    }
  }
}
