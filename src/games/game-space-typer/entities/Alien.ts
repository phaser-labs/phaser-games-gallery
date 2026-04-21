import Phaser from 'phaser';

const TYPE_COLORS = {
  completed: '#7df9ff',
  current: '#ffffff',
  remaining: '#97a6c4',
} as const;

export class Alien extends Phaser.GameObjects.Container {
  private readonly word: string;

  private readonly letters: Phaser.GameObjects.Text[] = [];

  private currentIndex = 0;

  private readonly fallSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, word: string, fallSpeed: number) {
    super(scene, x, y);

    this.word = word.toUpperCase();
    this.fallSpeed = fallSpeed;

    // Create the sprite for the alien and select a random animation
    const randomAlienId = Phaser.Math.Between(1, 6);
    const sprite = scene.add.sprite(0, 0, `alien${randomAlienId}_frame1`);
    sprite.play(`alien${randomAlienId}_moving`);
    sprite.setScale(1); // adjust if needed

    this.add(sprite);

    this.buildWord(scene);
    this.refreshWordStyle();
    this.setDepth(5);

    scene.add.existing(this);
  }

  private buildWord(scene: Phaser.Scene): void {
    const fontSize = this.word.length > 8 ? 15 : 18;
    const spacing = fontSize + 4;
    const startX = -((this.word.length - 1) * spacing) / 2;
    const yPosition = -50;

    this.word.split('').forEach((letter, index) => {
      const letterText = scene.add.text(startX + index * spacing, yPosition, letter, {
        fontFamily: 'Courier New, monospace',
        fontSize: `${fontSize}px`,
        fontStyle: '700',
        color: TYPE_COLORS.remaining,
      });

      letterText.setOrigin(0.5);
      this.letters.push(letterText);
      this.add(letterText);
    });
  }

  private refreshWordStyle(): void {
    this.letters.forEach((letterText, index) => {
      let color: string = TYPE_COLORS.remaining;

      if (index < this.currentIndex) {
        color = TYPE_COLORS.completed;
      } else if (index === this.currentIndex) {
        color = TYPE_COLORS.current;
      }

      letterText.setColor(color);
      letterText.setAlpha(index < this.currentIndex ? 1 : 0.92);
    });
  }

  getNextLetter(): string {
    return this.word[this.currentIndex] ?? '';
  }

  consumeLetter(letter: string): boolean {
    if (letter.toUpperCase() !== this.getNextLetter()) {
      return false;
    }

    this.currentIndex += 1;
    this.refreshWordStyle();

    return this.isComplete();
  }

  isComplete(): boolean {
    return this.currentIndex >= this.word.length;
  }

  update(delta: number): void {
    this.y += (this.fallSpeed * delta) / 1000;
  }

  isOffScreen(viewHeight: number): boolean {
    return this.y - 30 > viewHeight;
  }

  destroyAlien(): void {
    this.destroy();
  }
}
