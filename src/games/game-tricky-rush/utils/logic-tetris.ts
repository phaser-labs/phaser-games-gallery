import {
  ActivePiece,
  Cell,
  PiecePenaltyType,
  TetrisConfig
} from "../types/types";

import {
  getCells,
  getPenaltyCells,
  randPieceType,
  SHAPES
} from "./shapes-tetris";

export function key(c: number, r: number) {
  return `${c},${r}`;
}

/* ===================================================== */
/* 🔥 RESOLVE CELLS (NORMAL + PENALTY UNIFICADO) */
/* ===================================================== */

function resolveCells(
  piece: ActivePiece & {
    isPenalty?: boolean;
    penaltyShape?: PiecePenaltyType;
  }
): Cell[] {

  if (piece.isPenalty && piece.penaltyShape) {
    return getPenaltyCells(piece.penaltyShape, piece.rot);
  }

  return getCells(piece.type, piece.rot);
}

/* ===================================================== */
/* HOUSE TOP */
/* ===================================================== */

export function buildHouseTopByCol(
  map: Phaser.Tilemaps.Tilemap,
  layerName: string
): Array<number | null> {

  const layer = map.getLayer(layerName)!.tilemapLayer;
  const mapWidth = map.width;
  const mapHeight = map.height;

  const top: Array<number | null> = new Array(mapWidth).fill(null);

  for (let col = 0; col < mapWidth; col++) {
    for (let row = 0; row < mapHeight; row++) {

      const tile = layer.getTileAt(col, row);

      if (tile?.properties?.roof === true) {
        top[col] = row;
        break;
      }
    }
  }

  return top;
}

/* ===================================================== */
/* CAN PLACE (UNIFICADO) */
/* ===================================================== */

export function canPlaceCellsAt(
  cfg: TetrisConfig,
  occupied: Set<string>,
  cells: Cell[],
  col: number,
  row: number
): boolean {

  for (const cell of cells) {

    const worldCol = col + cell.x;
    const worldRow = row + cell.y;

    // fuera horizontal
    if (worldCol < cfg.worldMinCol || worldCol > cfg.worldMaxCol)
      return false;

    // fuera vertical
    if (worldRow >= cfg.mapHeight)
      return false;

    // ocupados
    if (occupied.has(key(worldCol, worldRow)))
      return false;

    // 🔥 techo + chimenea
    const houseTop = cfg.houseTopByCol[worldCol];
    if (houseTop !== null && worldRow >= houseTop)
      return false;
  }

  return true;
}

/* ===================================================== */
/* ROTATE (AHORA 100% COMPATIBLE CON PENALTY) */
/* ===================================================== */

export function rotateWithKicks(
  cfg: TetrisConfig,
  occupied: Set<string>,
  piece: ActivePiece & {
    isPenalty?: boolean;
    penaltyShape?: PiecePenaltyType;
  },
  dir: 1 | -1
): ActivePiece | null {

  const states = piece.isPenalty && piece.penaltyShape
    ? getPenaltyCells(piece.penaltyShape, 0).length
    : SHAPES[piece.type].length;

  const nextRot = (piece.rot + dir + states) % states;

  const kicks = [0, -1, 1, -2, 2];

  for (const k of kicks) {

    const testPiece = {
      ...piece,
      rot: nextRot,
      col: piece.col + k
    };

    const cells = resolveCells(testPiece);

    if (canPlaceCellsAt(cfg, occupied, cells, testPiece.col, testPiece.row)) {
      return testPiece;
    }
  }

  return null;
}

/* ===================================================== */
/* SPAWN */
/* ===================================================== */

export function spawnPiece(
  cfg: TetrisConfig,
  spawnRow: number
): ActivePiece {

  return {
    type: randPieceType(),
    rot: 0,
    col: Math.floor((cfg.worldMinCol + cfg.worldMaxCol) / 2),
    row: spawnRow
  };
}

/* ===================================================== */
/* LOCK */
/* ===================================================== */

export function lockIntoOccupied(
  occupied: Set<string>,
  piece: ActivePiece & {
    isPenalty?: boolean;
    penaltyShape?: PiecePenaltyType;
  }
) {

  const cells = resolveCells(piece);

  for (const cell of cells) {
    const c = piece.col + cell.x;
    const r = piece.row + cell.y;
    occupied.add(key(c, r));
  }
}
