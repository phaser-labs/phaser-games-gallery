import Phaser from "phaser";

export type RoofInfo = {
  minX: number;
  maxX: number;
  width: number;
  centerX: number;
  roofTopY: number;
  topRow: number;          // fila del techo
  topCols: number[];       // columnas ocupadas en la fila superior (para collider fino)
};

export function getRoofFromHouseLayer(
  map: Phaser.Tilemaps.Tilemap,
  house: Phaser.Tilemaps.TilemapLayer
): RoofInfo {

  const W = map.width;
  const H = map.height;

  let topRow = H;
  let minCol = W;
  let maxCol = 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tile = house.getTileAt(x, y);

      if (tile && tile.index !== -1) {
        topRow = Math.min(topRow, y);
      }
    }
  }

  // ahora buscamos columnas en esa fila
  const topCols: number[] = [];

  for (let x = 0; x < W; x++) {
    const tile = house.getTileAt(x, topRow);

    if (tile && tile.index !== -1) {
      topCols.push(x);
      minCol = Math.min(minCol, x);
      maxCol = Math.max(maxCol, x);
    }
  }

  const tileW = map.tileWidth;
  const tileH = map.tileHeight;

  const minX = minCol * tileW;
  const maxX = (maxCol + 1) * tileW;
  const width = maxX - minX;
  const centerX = minX + width / 2;
  const roofTopY = topRow * tileH;

  return {
    minX,
    maxX,
    width,
    centerX,
    roofTopY,
    topRow,
    topCols
  };
}
