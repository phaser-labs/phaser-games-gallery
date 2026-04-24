import Phaser from 'phaser';

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

  private readonly laneCenters = [0.25, 0.42, 0.58, 0.74, 0.9];
  
  // Lógica de oleadas
  private currentWave = 1;
  private wordsLeftToSpawn = 0;
  private availableWords: string[] = [];
  private hasSpawnedBoss = false;
  private waveText!: Phaser.GameObjects.Text;
  // Lógica del Boss
  private isBossSequence = false;
  private bossSprite: Phaser.GameObjects.Sprite | null = null;
  private bossHealth = 0;
  private bossMaxHealth = 0;
  private bossHealthBarBg: Phaser.GameObjects.Graphics | null = null;
  private bossHealthBarFill: Phaser.GameObjects.Graphics | null = null;
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

    this.sound.stopAll();
    this.sound.play('inicio-game', { loop: false, volume: 0.8 });
    this.sound.play('Ambience-game', { loop: true, volume: 0.5 });

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

    // Eventos globales desde React
    EventBus.on('toggle-mute', this.handleToggleMute, this);
    EventBus.on('go-home', this.handleGoHome, this);
    EventBus.on('toggle-pause', this.handleTogglePause, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleShutdown, this);
  }

  private handleToggleMute = (): void => {
    this.sound.mute = !this.sound.mute;
  };

  private handleGoHome = (): void => {
    useGameManagerStore.setState({ gameState: 'quieto' });
    this.sound.stopAll();
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
    this.hasSpawnedBoss = false;

    const wordBank = this.gameManager.getWords();
    const totalWaves = this.gameManager.getTotalWaves();

    if (totalWaves === 1) {
      this.availableWords = [...wordBank];
      this.wordsLeftToSpawn = this.availableWords.length > 0 ? this.availableWords.length : 12;
    } else {
      this.wordsLeftToSpawn = 8 + (wave * 4);
    }

    // Comenzar spawning de palabras (ya no adelantamos el boss)
    this.showWaveText(`OLEADA ${wave}`, () => this.beginSpawning(wave));
  }

  private startBossSequence(wave: number): void {
    this.isBossSequence = true;
    this.gameManager.setBossActive(true);

    this.sound.stopByKey('inicio-game');
    this.sound.play('boss-fight', { loop: true, volume: 0.4 });

    this.cameras.main.shake(2000, 0.015);

    this.showWaveText('¡PELIGRO: NAVE NODRIZA!', () => {
      this.spawnBoss(wave);
    });
  }

  private spawnBoss(wave: number): void {
    this.bossMaxHealth = 55 + (wave * 5);
    this.bossHealth = this.bossMaxHealth;

    this.bossSprite = this.add.sprite(this.scale.width / 2, -100, 'boss')
      .setScale(3);
      
    this.bossHealthBarBg = this.add.graphics();
    this.bossHealthBarFill = this.add.graphics();
    
    // Anima el boss entrando a la pantalla
    this.tweens.add({
      targets: this.bossSprite,
      y: 120,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        this.updateBossHealthBar();
        this.showWaveText('¡ATACA (con la tecla ESPACIO)!', () => {
          // El boss empieza a bajar lentamente hacia el jugador
          this.tweens.add({
            targets: this.bossSprite,
            y: this.scale.height - 150,
            duration: 15000 - (wave * 1000), // Si llega abajo, el jugador pierde 2 vidas
            onComplete: () => {
              if (this.isBossSequence && this.bossHealth > 0) {
                this.sound.play('player-damage', { volume: 0.6 });
                this.gameManager.loseLife();
                if (this.gameManager.getLives() > 0) {
                  this.gameManager.loseLife(); // Castigo doble por no matar al boss a tiempo
                }
                this.sound.stopByKey('boss-fight');
                this.sound.play('inicio-game', { loop: true, volume: 0.3 });
                this.destroyBoss();
                if (this.gameManager.getLives() > 0) {
                  this.handleWaveComplete();
                }
              }
            }
          });
        });
      }
    });
  }

  private bossHit(): void {
    if (this.bossHealth <= 0) return;
    
    this.bossHealth -= 1;
    this.updateBossHealthBar();
    this.gameManager.addScore(5);

    this.sound.play('boss-hit', { volume: 0.7 });

    // Efecto de golpe
    if (this.bossSprite) {
      const originalTint = this.bossSprite.tintTopLeft;
  this.bossSprite.setTint(0xff0000);
      this.time.delayedCall(50, () => {
        if (this.bossSprite) this.bossSprite.setTint(originalTint);
      });
    }

    if (this.bossHealth <= 0) {
      this.bossSprite?.scene.tweens.killTweensOf(this.bossSprite);
      
      // Explota boss
      this.sound.play('boss-death', { volume: 0.8 });
      this.tweens.add({
        targets: this.bossSprite,
        scale: 0,
        alpha: 0,
        angle: 180,
        duration: 500,
        onComplete: () => {
          this.sound.stopByKey('boss-fight');
          this.sound.play('inicio-game', { loop: false, volume: 0.3 });
          this.gameManager.addScore(100);
          this.destroyBoss();
          this.showWaveText('¡NAVE DESTRUIDA!', () => this.handleWaveComplete());
        }
      });
    }
  }

  private updateBossHealthBar(): void {
    if (!this.bossHealthBarBg || !this.bossHealthBarFill || !this.bossSprite) return;

    const width = 120;
    const height = 12;
    const x = this.bossSprite.x - width / 2;
    const y = this.bossSprite.y - 70;

    this.bossHealthBarBg.clear();
    this.bossHealthBarBg.fillStyle(0x000000, 0.8);
    this.bossHealthBarBg.fillRect(x, y, width, height);

    this.bossHealthBarFill.clear();
    const percent = Math.max(0, this.bossHealth / this.bossMaxHealth);
    this.bossHealthBarFill.fillStyle(0xff0000, 1);
    this.bossHealthBarFill.fillRect(x, y, width * percent, height);
  }

  private destroyBoss(): void {
    this.isBossSequence = false;
    this.gameManager.setBossActive(false);

    if (this.bossSprite) {
      this.bossSprite.destroy();
      this.bossSprite = null;
    }
    if (this.bossHealthBarBg) {
      this.bossHealthBarBg.destroy();
      this.bossHealthBarBg = null;
    }
    if (this.bossHealthBarFill) {
      this.bossHealthBarFill.destroy();
      this.bossHealthBarFill = null;
    }
  }

  private showWaveText(text: string, onComplete: () => void): void {
    this.waveText.setText(text);
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
          onComplete: onComplete
        });
      }
    });
  }

  private beginSpawning(wave: number): void {
    const spawnDelay = Math.max(800, 2500 - (wave * 400));
    this.spawnTimer = this.time.addEvent({
      delay: spawnDelay,
      loop: true,
      callback: () => {
        if (this.gameManager.getGameState() === 'jugando' && !this.isBossSequence) {
          if (this.wordsLeftToSpawn > 0 && this.aliens.length < 7) {
            this.spawnAlien();
          } else if (this.wordsLeftToSpawn <= 0 && this.aliens.length === 0) {
            this.handleWaveComplete();
          }
        }
      }
    });
  }

  private handleWaveComplete(): void {
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    const totalWaves = this.gameManager.getTotalWaves();

    // Spawn the boss at the end of the wave if it is the boss wave (or the final wave) and hasn't spawned yet
    const isBossWave = totalWaves === 1 || this.currentWave >= 2;
    if (isBossWave && !this.hasSpawnedBoss) {
      this.hasSpawnedBoss = true;
      this.startBossSequence(this.currentWave);
      return;
    }

    if (this.currentWave >= totalWaves && this.hasSpawnedBoss && !this.isBossSequence) {
      this.sound.stopAll();
      this.sound.play('game-win', { loop: true, volume: 0.8 });
      this.gameManager.setGameWin();

      // Animación de vuelo triunfal
      if (this.player) {
        this.tweens.add({
          targets: this.player,
          y: -100,
          angle: 1080,
          scale: 0.3,
          duration: 3000,
          ease: 'Sine.easeInOut'
        });
      }
      return;
    }
    
    this.sound.play('wave-complete', { volume: 0.4 });

    // Iniciar la siguiente oleada con un pequeño retraso
    this.time.delayedCall(1500, () => {
      this.startWave(this.currentWave + 1);
    });
  }

  private getWordForWave(): string {
    const wordBank = this.gameManager.getWords();
    const totalWaves = this.gameManager.getTotalWaves();
    
    // Si es solo una oleada, usamos las palabras asignadas en `availableWords` consecutivamente o aleatorio sin repetir.
    if (totalWaves === 1 && this.availableWords.length > 0) {
      const idx = Phaser.Math.Between(0, this.availableWords.length - 1);
      const word = this.availableWords.splice(idx, 1)[0];
      return word;
    }

    const words = wordBank.length > 0 ? wordBank : ['REACT', 'PHASER', 'VITE'];

    let filteredWords = words;

    if (this.currentWave === 1) {
      // Palabras cortas: longitud <= 7
      filteredWords = words.filter((w: string) => w.length <= 7);
    } else if (this.currentWave === 2) {
      // Longitud media
      filteredWords = words.filter((w: string) => w.length >= 7 && w.length <= 9);
    } else {
      // Diferentes, largas > 8
      filteredWords = words.filter((w: string) => w.length >= 8);
    }

    if (filteredWords.length === 0) filteredWords = words;
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
    
    const alien = new Alien(this, xPosition, -50, word, fallSpeed);

    this.aliens.push(alien);
    this.wordsLeftToSpawn -= 1;
  }

  private handleInput = (event: KeyboardEvent): void => {
    if (this.gameManager.getGameState() !== 'jugando') {
      return;
    }

    if (this.isBossSequence && this.bossSprite) {
      if (event.code === 'Space') {
        this.sound.play('space-press', { volume: 0.3 });
        this.player.shootBig(this.bossSprite.x, this.bossSprite.y);
        this.bossHit();
      }
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
      this.sound.play('keystroke-wrong', { volume: 0.6 });
      return;
    }

    const isComplete = targetAlien.consumeLetter(key);
    
    // Reproducir sonido keystroke
    if (isComplete) {
      this.sound.play('keystroke-correct', { volume: 0.6 });
    } else {
      this.sound.play('key-press', { volume: 0.3 });
    }

    this.player.shoot(targetAlien.x, targetAlien.y);

    if (!isComplete) {
      return;
    }

    this.sound.play('enemy-death', { volume: 0.8 });
    this.removeAlien(targetAlien);
    this.gameManager.addScore(10);
  };

  update(_time: number, delta: number): void {
    if (this.gameManager.getGameState() !== 'jugando') {
      return;
    }

    if (this.isBossSequence) {
      if (this.bossSprite) {
        this.updateBossHealthBar();
      }
      // No actualizamos words ni meteoros porque en modo boss no caen
    } else {
      for (let index = this.aliens.length - 1; index >= 0; index -= 1) {
        const alien = this.aliens[index];
        alien.update(delta);

        if (!alien.isOffScreen(this.scale.height)) {
          continue;
        }

        this.sound.play('player-damage', { volume: 2 });
        this.removeAlien(alien);
        this.gameManager.loseLife();

        if (this.gameManager.getLives() === 0) {
          this.sound.stopAll();
          this.sound.play('game-over', { volume: 0.5 });
          this.gameManager.setGameOver();
          return;
        }
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
