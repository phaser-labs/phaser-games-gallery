export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'Preloader'
    });
  }

  preload() {
    // Crear barra de progreso visual
    this.createProgressBar();

    // Cargar UI assets
    this.load.image('volume-icon', 'assets/game-memory-card/ui/volume-icon.png');
    this.load.image('volume-icon_off', 'assets/game-memory-card/ui/volume-icon_off.png');
    this.load.image('background', 'assets/game-memory-card/background.png');
    this.load.image('background-init', 'assets/game-memory-card/bg-init.png');
    this.load.image('heart', 'assets/game-memory-card/ui/heart.png');

    // Cargar audio
    this.load.audio('theme-song', 'assets/game-memory-card/audio/Mechanical.mp3');
    this.load.audio('whoosh', 'assets/game-memory-card/audio/whoosh.mp3');
    this.load.audio('card-flip', 'assets/game-memory-card/audio/card-flip.wav');
    this.load.audio('card-match', 'assets/game-memory-card/audio/Confirm.wav');
    this.load.audio('card-mismatch', 'assets/game-memory-card/audio/error.wav');
    this.load.audio('card-slide', 'assets/game-memory-card/audio/card-place-4.ogg');
    this.load.audio('victory', 'assets/game-memory-card/audio/level-complete.wav');

    // Cargar cartas dinámicamente desde el registro (pasadas como prop)
    const cardData: { name: string; img: string }[] =
      this.game.registry.get('cardData') ?? [];
    cardData.forEach(card => {
      this.load.image(card.name, card.img);
    });
  }

  create() {
    // Fade out antes de cambiar a la siguiente escena
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Play');
    });
  }

  /**
   * Crear la barra de progreso visual para mostrar el estado de carga
   */
  private createProgressBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Crear fondo semi-transparente
    const bg = this.add.graphics();
    bg.fillStyle(0xa1ae57, 1);
    bg.fillRect(0, 0, width, height);

    // Contenedor de la barra de progreso
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    // Barra de progreso
    const progressBar = this.add.graphics();

    // Texto "Cargando..."
    const loadingText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 60,
        text: 'Cargando...',
        style: {
          font: '24px Arial',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      })
      .setOrigin(0.5, 0.5);

    // Texto de porcentaje
    const percentText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: {
          font: '20px Arial',
          color: '#ffffff'
        }
      })
      .setOrigin(0.5, 0.5);

    // Texto de archivo cargándose
    const assetText = this.make
      .text({
        x: width / 2,
        y: height / 2 + 50,
        text: '',
        style: {
          font: '16px Arial',
          color: '#ffffff'
        }
      })
      .setOrigin(0.5, 0.5);

    // Actualizar la barra conforme progresan los assets
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x8c7ae6, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    // Mostrar qué archivo se está cargando
    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      assetText.setText(`Cargando: ${file.key}`);
    });

    // Limpiar elementos cuando termine la carga
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
      bg.destroy();
    });
  }
}