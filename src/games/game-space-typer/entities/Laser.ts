import Phaser from 'phaser';

export class Laser extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    isBig: boolean = false
  ) {
    super(scene, startX, startY);

    const glowWidth = isBig ? 36 : 12;
    const glowHeight = isBig ? 90 : 30;
    const beamWidth = isBig ? 12 : 4;
    const beamHeight = isBig ? 72 : 24;
    
    // Boss laser defaults to red/orange tint if big? Un no, player shoots boss, so maybe cyan/blue but bigger
    const glow = scene.add.rectangle(0, 0, glowWidth, glowHeight, 0x00ffff, 0.24);
    const beam = scene.add.rectangle(0, 0, beamWidth, beamHeight, 0xffffff, 1);
    beam.setStrokeStyle(isBig ? 3 : 1, 0x00ffff, 1);

    this.add([glow, beam]);
    this.setDepth(8);

    const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);
    this.setRotation(angle + Math.PI / 2);

    scene.add.existing(this);

    scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: isBig ? 180 : 220,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (this.active) {
          this.destroy();
        }
      },
    });
  }
}
