import Phaser from 'phaser';

import { WORD_BANK } from '../../../data/data-game-space-typer';
import GameManager, { GAME_MANAGER_EVENTS } from '../core/GameManager';
import { Alien } from '../entities/Alien';
import { Player } from '../entities/Player';


export class MainScene extends Phaser.Scene {
  private readonly gameManager = GameManager.getInstance();

  private player!: Player;

  private aliens: Alien[] = [];

  private spawnTimer: Phaser.Time.TimerEvent | null = null;

  private readonly laneCenters = [0.14, 0.34, 0.54, 0.74, 0.9];

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    this.gameManager.startGame();

    this.player = new Player(this, this.scale.width / 2, this.scale.height - 68);

    this.spawnWave(3);

    this.spawnTimer = this.time.addEvent({
      delay: 2200,
      loop: true,
      callback: () => {
        if (this.gameManager.getGameState() === 'jugando' && this.aliens.length < 7) {
          this.spawnAlien();
        }
      },
    });

    this.input.keyboard?.on('keydown', this.handleInput, this);
    this.gameManager.on(GAME_MANAGER_EVENTS.GAME_RESET, this.handleGameReset);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown);
  }

  private spawnWave(count: number): void {
    for (let index = 0; index < count; index += 1) {
      this.spawnAlien();
    }
  }

  private spawnAlien(): void {
    const word = Phaser.Utils.Array.GetRandom(WORD_BANK);
    const lane = Phaser.Utils.Array.GetRandom(this.laneCenters);
    const xPosition = this.scale.width * lane;
    const alien = new Alien(this, xPosition, 80, word);

    this.aliens.push(alien);
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

    if (this.spawnTimer !== null) {
      this.spawnTimer.remove();
      this.spawnTimer = null;
    }

    this.aliens.forEach((alien) => alien.destroyAlien());
    this.aliens = [];
  };
}
