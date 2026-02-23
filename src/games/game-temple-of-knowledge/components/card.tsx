import Phaser from 'phaser';

export type AnswerCardData = {
  id: string;
  text: string;     // lo usarás en el DOM, aquí no se pinta
  correct: boolean;
  iconKey?: string;
};

type CardDims = {
  w: number;          // tamaño final en pantalla
  h: number;
  iconSize: number;   // tamaño del icono adentro
  badgeTopPad: number;
};

const REM = 16; // si tu root font-size es 16px
const CARD_DIM: CardDims = {
  w: 7.5 * REM,   // 120
  h: 10.5 * REM,  // 168
  iconSize: 44,   // ajusta a gusto
  badgeTopPad: 12
};

export class Card extends Phaser.GameObjects.Container {
  public cardData: AnswerCardData;

  private frame!: Phaser.GameObjects.Image;
  private icon?: Phaser.GameObjects.Image;

  private badgeText?: Phaser.GameObjects.Text;

  // “Glow”/resalte al seleccionar (correcto/incorrecto)
  private outline?: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    cardData: AnswerCardData
  ) {
    super(scene, x, y);

    this.cardData = cardData;

    // 1) Frame (tu PNG)
    this.frame = scene.add.image(0, 0, 'card').setOrigin(0.5);

    // Escala exacta al tamaño deseado
    this.frame.setDisplaySize(CARD_DIM.w, CARD_DIM.h);

    // Pixel art friendly
    this.frame.setPipeline('TextureTintPipeline');

    this.add(this.frame);

    // 2) (Opcional) Outline para feedback (sin romper el pixel art del frame)
    //    - No lo dibujamos encima del frame (se ve feo), lo ponemos atrás y apenas más grande.
    this.outline = scene.add.rectangle(0, 0, CARD_DIM.w + 8, CARD_DIM.h + 8, 0x000000, 0);
    this.outline.setOrigin(0.5);
    this.outline.setStrokeStyle(0); // inicia sin stroke
    this.addAt(this.outline, 0);

    // 3) Badge numérico (opcional). Si quieres que sea 100% pixel art,
    //    reemplaza esto por un sprite/bitmapfont.
    this.badgeText = scene.add.text(0, 0, String(cardData.id), {
      fontFamily: '"PixelFont", Arial',
      fontSize: '0.9rem',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.badgeText.setPosition(0, -CARD_DIM.h / 2 + CARD_DIM.badgeTopPad);
    this.add(this.badgeText);

    // 4) Icono (centrado)
    if (cardData.iconKey) {
      this.icon = scene.add.image(0, 0, cardData.iconKey).setOrigin(0.5);

      // Ajuste a un tamaño fijo sin deformar
      const s = Math.min(
        CARD_DIM.iconSize / this.icon.width,
        CARD_DIM.iconSize / this.icon.height
      );

      this.icon.setScale(s);
      this.icon.setPosition(0, -35); // 👈 sube/baja el icono dentro del marco
      this.add(this.icon);
    }

    // Hit-area (importante para clicks/over)
    this.setSize(CARD_DIM.w, CARD_DIM.h);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-CARD_DIM.w / 2, -CARD_DIM.h / 2, CARD_DIM.w, CARD_DIM.h),
      Phaser.Geom.Rectangle.Contains
    );

    scene.add.existing(this);
  }

  // Para el DOM overlay accesible
  public getButtonRectLocal() {
    return { x: -CARD_DIM.w / 2, y: -CARD_DIM.h / 2, width: CARD_DIM.w, height: CARD_DIM.h };
  }

  public localToWorld(localX: number, localY: number) {
    const p = new Phaser.Math.Vector2(localX, localY);
    Phaser.Math.RotateAround(p, 0, 0, this.rotation);
    p.x += this.x;
    p.y += this.y;
    return p;
  }

  // Feedback visual al seleccionar
  public setSelected(ok: boolean) {
    // resalte con stroke “suave”
    const color = ok ? 0x2ecc71 : 0xe74c3c;

    if (this.outline) {
      this.outline.setStrokeStyle(3, color, 0.8);
      this.outline.setFillStyle(0x000000, 0); // sin relleno
    }

    // opcional: micro bounce
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 90,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
  }

  public clearSelected() {
    if (this.outline) this.outline.setStrokeStyle(0);
  }
}
