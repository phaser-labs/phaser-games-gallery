import Phaser from 'phaser';

import { Laser } from './Laser';

export class Player extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const hull = scene.add.rectangle(0, 0, 56, 20, 0x17324d, 1);
    const wingLeft = scene.add.rectangle(-18, 8, 18, 8, 0x2563eb, 1);
    const wingRight = scene.add.rectangle(18, 8, 18, 8, 0x2563eb, 1);
    const canopy = scene.add.ellipse(0, -6, 16, 12, 0x7df9ff, 1);
    const thrusterLeft = scene.add.rectangle(-10, 15, 8, 10, 0xf97316, 1);
    const thrusterRight = scene.add.rectangle(10, 15, 8, 10, 0xf97316, 1);

    hull.setStrokeStyle(2, 0xc7f9ff, 0.8);
    wingLeft.setStrokeStyle(1, 0x0f172a, 0.6);
    wingRight.setStrokeStyle(1, 0x0f172a, 0.6);

    this.add([wingLeft, wingRight, hull, canopy, thrusterLeft, thrusterRight]);
    this.setDepth(10);

    scene.add.existing(this);
  }

  shoot(targetX: number, targetY: number): Laser {
    return new Laser(this.scene, this.x, this.y - 18, targetX, targetY);
  }
}
