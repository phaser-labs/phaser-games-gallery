import Phaser from 'phaser';

import { Laser } from './Laser';

export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'pj_frame1'); // Inicializamos con la imagen 1

    this.play('pj_moving'); // Reproducimos la animación
    this.setDepth(10);

    scene.add.existing(this);
  }

  shoot(targetX: number, targetY: number): Laser {
    return new Laser(this.scene, this.x, this.y - 18, targetX, targetY);
  }
}
