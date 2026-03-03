import Phaser from 'phaser';

import { ASSETS } from '../utils/game-assets';

export class Character {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  private player!: Phaser.GameObjects.Sprite;
  private spell!: Phaser.GameObjects.Sprite;
  private hearts: Phaser.GameObjects.Image[] = [];

  private lives = 3;

  constructor(scene: Phaser.Scene, x: number, y: number, playerIndex: number) {
    this.scene = scene;

    const cloud = scene.add.image(0, 0, ASSETS.clouds.cloud_3.key).setOrigin(0.5);

    this.player = scene.add.sprite(-8, -35, `player${playerIndex + 1}_idle`).setOrigin(0.5);

    this.player.play(`player${playerIndex + 1}-idle`);

    this.spell = scene.add
      .sprite(-8, -35, `player${playerIndex + 1}_spell`)
      .setOrigin(0.5)
      .setVisible(false);

    this.createHearts(0, 15);

    this.container = scene.add.container(x, y, [cloud, this.player, this.spell, ...this.hearts]);

    this.container.setDepth(100);

    // flotación
    scene.tweens.add({
      targets: this.container,
      y: '-=6',
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createHearts(centerX: number, centerY: number) {
    const offsetX = 22;
    const offsetY = 5;

    const positions = [
      { x: centerX - offsetX, y: centerY - offsetY },
      { x: centerX + offsetX, y: centerY - offsetY },
      { x: centerX, y: centerY + offsetY }
    ];

    for (const pos of positions) {
      const heart = this.scene.add.image(pos.x, pos.y, ASSETS.hearths.hearth_full.key).setScale(0.8).setAngle(315);

      this.hearts.push(heart);
    }
  }

  public playSpell() {
    this.player.setVisible(false);
    this.spell.setVisible(true);
    this.spell.play('player1-spell');

    this.spell.once('animationcomplete', () => {
      this.spell.setVisible(false);
      this.player.setVisible(true);
    });

    const audioManager = this.scene.registry.get('audioManager');
    audioManager.playSFX(ASSETS.spell_sound.key);
  }

  public loseLife() {
    if (this.lives <= 0) return;

    this.lives--;

    this.hearts[this.lives].setTexture(ASSETS.hearths.hearth_empty.key);
  }

  public getLives(): number {
    return this.lives;
  }

  public setPosition(x: number, y: number) {
    this.container.setPosition(x, y);
  }

  public isDead(): boolean {
    return this.lives <= 0;
  }

  public destroy() {
    this.container.destroy();
  }
}
