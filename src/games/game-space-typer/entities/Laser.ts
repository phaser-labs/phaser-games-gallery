import Phaser from 'phaser';

export class Laser extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number
  ) {
    super(scene, startX, startY);

    const glow = scene.add.rectangle(0, 0, 12, 30, 0x7df9ff, 0.24);
    const beam = scene.add.rectangle(0, 0, 4, 24, 0xe0fbff, 1);
    beam.setStrokeStyle(1, 0x7df9ff, 1);

    this.add([glow, beam]);
    this.setDepth(8);

    const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);
    this.setRotation(angle + Math.PI / 2);

    scene.add.existing(this);

    scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: 220,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (this.active) {
          this.destroy();
        }
      },
    });
  }
}
