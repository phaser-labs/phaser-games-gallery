import Phaser from 'phaser';

import { WORD_BANK } from '../../../data/data-game-space-typer';
import GameManager, { GAME_MANAGER_EVENTS, useGameManagerStore } from '../core/GameManager';
import { Alien } from '../entities/Alien';
import { Player } from '../entities/Player';
import { EventBus } from '../EventBus';

export class MainScene extends Phaser.Scene {
  private readonly gameManager = GameManager.getInstance();
  background!: Phaser.GameObjects.TileSprite;
  bg!: Phaser.GameObjects.Image;

  private player!: Player;

  private aliens: Alien[] = [];

  private spawnTimer: Phaser.Time.TimerEvent | null = null;

  private readonly laneCenters = [0.14, 0.34, 0.54, 0.74, 0.9];
  
  // Lógica de oleadas
  private totalWaves = 2;
  private currentWave = 1;
  private wordsLeftToSpawn = 0;
  private waveText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.bg = this.add
      .image(width / 2, height / 2, 'bg-quiet')
      .setDepth(-1)
      .setScale(1);
    this.background = this.add.tileSprite(0, 0, width, height, 'background').setOrigin(0);

    //animaciones
    this.anims.create({
      // <-- PLAYER
      key: 'pj_moving',
      frames: [{ key: 'pj_frame1' }, { key: 'pj_frame2' }, { key: 'pj_frame3' }],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      // <-- ALIENS
      key: 'alien1_moving',
      frames: [{ key: 'alien1_frame1' }, { key: 'alien1_frame2' }, { key: 'alien1_frame3' }],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'alien2_moving',
      frames: [{ key: 'alien2_frame1' }, { key: 'alien2_frame2' }, { key: 'alien2_frame3' }],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'alien3_moving',
      frames: [{ key: 'alien3_frame1' }, { key: 'alien3_frame2' }, { key: 'alien3_frame3' }],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'alien4_moving',
      frames: [{ key: 'alien4_frame1' }, { key: 'alien4_frame2' }, { key: 'alien4_frame3' }],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'alien5_moving',
      frames: [{ key: 'alien5_frame1' }, { key: 'alien5_frame2' }, { key: 'alien5_frame3' }],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'alien6_moving',
      frames: [{ key: 'alien6_frame1' }, { key: 'alien6_frame2' }, { key: 'alien6_frame3' }],
      frameRate: 8,
      repeat: -1
    });
    this.gameManager.startGame();

    this.player = new Player(this, this.scale.width / 2, this.scale.height - 68);

    // Texto de oleada
    this.waveText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
      fontFamily: '"Cyber", monospace',
      fontSize: '48px',
      color: '#061b30',
      stroke: '#ffff',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(100).setAlpha(0.8);

    this.currentWave = 1;
    this.startWave(this.currentWave);

    this.input.keyboard?.on('keydown', this.handleInput, this);
    this.gameManager.on(GAME_MANAGER_EVENTS.GAME_RESET, this.handleGameReset);

    // Eventos globales desde React (Zustand / EventBus)
    EventBus.on('toggle-mute', this.handleToggleMute, this);
    EventBus.on('go-home', this.handleGoHome, this);
    EventBus.on('toggle-pause', this.handleTogglePause, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown);
  }

  private handleToggleMute = (): void => {
    this.sound.mute = !this.sound.mute;
  };

  private handleGoHome = (): void => {
    useGameManagerStore.setState({ gameState: 'quieto' });
    this.scene.start('MainMenu');
  };

  private handleTogglePause = (isPaused: boolean): void => {
    if (isPaused) {
      this.physics?.pause();
      this.scene.pause();
      if (this.spawnTimer && this.spawnTimer.paused === false) {
        this.spawnTimer.paused = true;
      }
    } else {
      this.physics?.resume();
      this.scene.resume();
      if (this.spawnTimer && this.spawnTimer.paused === true) {
        this.spawnTimer.paused = false;
      }
    }
  };

  private startWave(wave: number): void {
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    this.currentWave = wave;
    this.wordsLeftToSpawn = 8 + (wave * 4); // Ej: O1: 12, O2: 16, O3: 20

    // Animación de texto
    this.waveText.setText(`OLEADA ${wave}`);
    this.waveText.setAlpha(1).setScale(0.5);

    this.tweens.add({
      targets: this.waveText,
      scale: 1,
      duration: 1000,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.waveText,
          alpha: 0,
          delay: 1000,
          duration: 500,
          onComplete: () => {
            // Iniciar la ronda
            const spawnDelay = Math.max(800, 2500 - (wave * 400));
            this.spawnTimer = this.time.addEvent({
              delay: spawnDelay,
              loop: true,
              callback: () => {
                if (this.gameManager.getGameState() === 'jugando') {
                  if (this.wordsLeftToSpawn > 0 && this.aliens.length < 7) {
                    this.spawnAlien();
                  } else if (this.wordsLeftToSpawn <= 0 && this.aliens.length === 0) {
                    this.handleWaveComplete();
                  }
                }
              }
            });
          }
        });
      }
    });
  }

  private handleWaveComplete(): void {
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    if (this.currentWave >= this.totalWaves) {
      this.gameManager.setGameWin();
      return;
    }

    // Iniciar la siguiente oleada con un pequeño retraso
    this.time.delayedCall(1500, () => {
      this.startWave(this.currentWave + 1);
    });
  }

  private getWordForWave(): string {
    let filteredWords = WORD_BANK;

    if (this.currentWave === 1) {
      // Palabras cortas: longitud <= 7
      filteredWords = WORD_BANK.filter(w => w.length <= 7);
    } else if (this.currentWave === 2) {
      // Longitud media
      filteredWords = WORD_BANK.filter(w => w.length >= 7 && w.length <= 9);
    } else {
      // Diferentes, largas > 8
      filteredWords = WORD_BANK.filter(w => w.length >= 8);
    }

    if (filteredWords.length === 0) filteredWords = WORD_BANK;
    return Phaser.Utils.Array.GetRandom(filteredWords);
  }

  private spawnAlien(): void {
    const word = this.getWordForWave();
    const lane = Phaser.Utils.Array.GetRandom(this.laneCenters);
    const xPosition = this.scale.width * lane;
    
    // Aumentar velocidad de caída según la oleada
    const minSpeed = 25 + (this.currentWave * 8);
    const maxSpeed = 40 + (this.currentWave * 12);
    const fallSpeed = Phaser.Math.Between(minSpeed, maxSpeed);

    const alien = new Alien(this, xPosition, 80, word, fallSpeed);

    this.aliens.push(alien);
    this.wordsLeftToSpawn -= 1;
  }

  private handleInput = (event: KeyboardEvent): void => {
    if (this.gameManager.getGameState() !== 'jugando') {
      return;
    }

    const key = event.key.toUpperCase();

    if (key.length !== 1 || !/^[A-Z]$/.test(key)) {
      return;
    }

    const targetAlien = this.aliens
      .filter((alien) => alien.getNextLetter() === key)
      .sort((leftAlien, rightAlien) => rightAlien.y - leftAlien.y)[0];

    if (targetAlien === undefined) {
      return;
    }

    const isComplete = targetAlien.consumeLetter(key);
    this.player.shoot(targetAlien.x, targetAlien.y);

    if (!isComplete) {
      return;
    }

    this.removeAlien(targetAlien);
    this.gameManager.addScore(10);
  };

  update(_time: number, delta: number): void {
    if (this.gameManager.getGameState() !== 'jugando') {
      return;
    }

    for (let index = this.aliens.length - 1; index >= 0; index -= 1) {
      const alien = this.aliens[index];
      alien.update(delta);

      if (!alien.isOffScreen(this.scale.height)) {
        continue;
      }

      this.removeAlien(alien);
      this.gameManager.loseLife();

      if (this.gameManager.getLives() === 0) {
        this.gameManager.setGameOver();
        return;
      }
    }

    if (this.background) {
      this.background.tilePositionY += 0.05 * delta;
    }
  }

  private removeAlien(alien: Alien): void {
    const alienIndex = this.aliens.indexOf(alien);

    if (alienIndex >= 0) {
      this.aliens.splice(alienIndex, 1);
    }

    alien.destroyAlien();
  }

  private handleGameReset = (): void => {
    this.scene.restart();
  };

  private handleShutdown = (): void => {
    this.input.keyboard?.off('keydown', this.handleInput, this);
    this.gameManager.off(GAME_MANAGER_EVENTS.GAME_RESET, this.handleGameReset);

    EventBus.off('toggle-mute', this.handleToggleMute, this);
    EventBus.off('go-home', this.handleGoHome, this);
    EventBus.off('toggle-pause', this.handleTogglePause, this);

    if (this.spawnTimer !== null) {
      this.spawnTimer.remove();
      this.spawnTimer = null;
    }

    this.aliens.forEach((alien) => alien.destroyAlien());
    this.aliens = [];
  };
}
