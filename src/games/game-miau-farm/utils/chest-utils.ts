import Phaser from 'phaser';

export interface ChestSearchResult {
  closed: Phaser.Physics.Arcade.Sprite | null;
  opened: Phaser.Physics.Arcade.Sprite | null;
  highlighted: Phaser.Physics.Arcade.Sprite | null;
}

/**
 * Busca cofres dentro de un rango, filtrados por dirección del jugador (estilo Zelda).
 * Separa cerrados vs abiertos, y devuelve el más cercano de cada tipo.
 * También devuelve `highlighted` (el cerrado más cercano, para el tint).
 */
export function findChestsInRange(
  chests: Phaser.Physics.Arcade.Sprite[],
  playerX: number,
  playerY: number,
  dir: string,
  range: number
): ChestSearchResult {
  let closed: Phaser.Physics.Arcade.Sprite | null = null;
  let closedDist = Infinity;

  let opened: Phaser.Physics.Arcade.Sprite | null = null;
  let openedDist = Infinity;

  for (const chest of chests) {
    if (!chest.active) continue;

    const dx = chest.x - playerX;
    const dy = chest.y - playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > range) continue;

    // Filtro direccional estilo Zelda
    if (dir === 'up'    && dy > 0) continue;
    if (dir === 'down'  && dy < 0) continue;
    if (dir === 'left'  && dx > 0) continue;
    if (dir === 'right' && dx < 0) continue;

    if (chest.getData('opened')) {
      if (dist < openedDist) { openedDist = dist; opened = chest; }
    } else {
      if (dist < closedDist) { closedDist = dist; closed = chest; }
    }
  }

  return { closed, opened, highlighted: closed };
}