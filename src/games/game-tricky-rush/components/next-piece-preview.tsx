import Phaser from 'phaser';

import { ActivePiece, Material } from '../types/types';
import { createColoredBlockTexture, createPenaltyBlockTexture, getColorForPiece } from '../utils/blocks-textures';
import { ASSETS } from '../utils/game-assets';
import { getCells, getPenaltyCells } from '../utils/shapes-tetris';

export class NextPiecePreview {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private blocks: Phaser.GameObjects.Image[] = [];
  private tileSize = 16;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    const cloud = this.scene.add
      .image(0, 0, ASSETS.container.container_2.key)
      .setOrigin(0, 0)
      .setDisplaySize(90, 60)
      .setAlpha(0.75);

    this.container = this.scene.add.container(x, y, [cloud]);
    this.container.setDepth(2000);
  }

  public update(piece: ActivePiece & { material: Material; isPenalty?: boolean; penaltyShape?: 'D' | 'C' | 'F' }) {
    this.blocks.forEach((b) => b.destroy());
    this.blocks = [];

    let cells;

    if (piece.isPenalty && piece.penaltyShape) {
      cells = getPenaltyCells(piece.penaltyShape, 0);
    } else {
      cells = getCells(piece.type, 0);
    }

    const size = this.tileSize;

    // calcular límites
    const xs = cells.map((c) => c.x);
    const ys = cells.map((c) => c.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const pieceWidth = (maxX - minX + 1) * size;
    const pieceHeight = (maxY - minY + 1) * size;

    const panelWidth = 90;
    const panelHeight = 60;

    const offsetX = (panelWidth - pieceWidth) / 2;
    const offsetY = (panelHeight - pieceHeight) / 2;

    for (const cell of cells) {
      const x = offsetX + (cell.x - minX) * size;
      const y = offsetY + (cell.y - minY) * size;

      let tex: string;

      if (piece.isPenalty) {
        tex = createPenaltyBlockTexture(this.scene, 16);
      } else {
        switch (piece.material) {
          case 'glass':
            tex = 'block_glass';
            break;

          case 'stone':
            tex = 'block_stone';
            break;

          case 'normal':
          default:
            tex = createColoredBlockTexture(this.scene, 16, getColorForPiece(piece.type));
            break;
        }
      }

      const block = this.scene.add.image(x, y, tex).setOrigin(0).setAlpha(0.65);

      this.container.add(block);
      this.blocks.push(block);
    }
  }

  public destroy() {
    this.blocks.forEach((b) => b.destroy());
    this.container.destroy();
  }
}
