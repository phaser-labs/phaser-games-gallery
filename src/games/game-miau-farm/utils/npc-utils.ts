import Phaser from 'phaser';

const TILE_SIZE = 16;

export type NpcType = 'chicken' | 'cow';

export interface NpcSprite extends Phaser.Physics.Arcade.Sprite {
  isKnockedBack?: boolean;
  lastSafeX?: number;
  lastSafeY?: number;
}

type IsWalkableFn = (worldX: number, worldY: number) => boolean;
type SnapFn = (worldX: number, worldY: number) => { x: number; y: number };

// ─────────────────────────────────────────────────────────────────────────────
// WANDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Programa el comportamiento de deambulación de un NPC.
 * Se llama recursivamente con delayedCall para simular un loop con intervalos variables.
 */
export function scheduleWander(
  scene: Phaser.Scene,
  npc: NpcSprite,
  type: NpcType,
  isWalkableAt: IsWalkableFn,
  snapToTileCenter: SnapFn
): void {
  const wander = (): void => {
    if (!npc.active) return;

    if (npc.isKnockedBack) {
      scene.time.delayedCall(300, wander);
      return;
    }

    const speed = type === 'cow' ? 20 : 28;
    const snapped = snapToTileCenter(npc.x, npc.y);

    const allDirs = [
      { vx: speed },
      { vx: -speed },
      { vx: 0 },
      { vx: 0 },
    ];

    const validDirs = allDirs.filter(({ vx }) => {
      if (vx === 0) return true;
      return isWalkableAt(snapped.x + Math.sign(vx) * TILE_SIZE, snapped.y);
    });

    const { vx } = validDirs[Phaser.Math.Between(0, validDirs.length - 1)];
    npc.setVelocity(vx, 0);

    if (vx === 0) {
      npc.play(`${type}-idle`, true);
    } else {
      npc.play(`${type}-walk`, true);
      npc.setFlipX(vx < 0);
    }

    scene.time.delayedCall(Phaser.Math.Between(1500, 4000), wander);
  };

  scene.time.delayedCall(Phaser.Math.Between(0, 2000), wander);
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOCKBACK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aplica knockback a un NPC al colisionar con el jugador.
 * Busca la dirección de rebote válida más cercana.
 */
export function knockbackNpc(
  scene: Phaser.Scene,
  npc: NpcSprite,
  type: NpcType,
  isWalkableAt: IsWalkableFn,
  snapToTileCenter: SnapFn
): void {
  if (npc.isKnockedBack) return;
  npc.isKnockedBack = true;

  const snapped = snapToTileCenter(npc.x, npc.y);
  const body = npc.body as Phaser.Physics.Arcade.Body;
  const rawDir = body.velocity.x >= 0 ? -1 : 1;
  const bounceSpeed = type === 'cow' ? 40 : 55;

  let bounceDir = 0;
  if (isWalkableAt(snapped.x + rawDir * TILE_SIZE, snapped.y)) bounceDir = rawDir;
  else if (isWalkableAt(snapped.x - rawDir * TILE_SIZE, snapped.y)) bounceDir = -rawDir;

  if (bounceDir !== 0) {
    npc.setVelocity(bounceDir * bounceSpeed, 0);
    npc.play(`${type}-walk`, true);
    npc.setFlipX(bounceDir < 0);
  } else {
    npc.setVelocity(0, 0);
    npc.play(`${type}-idle`, true);
  }

  scene.time.delayedCall(400, () => {
    if (!npc.active) return;
    npc.isKnockedBack = false;
    npc.setVelocity(0, 0);
    npc.play(`${type}-idle`, true);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Actualiza el estado de todos los NPCs en cada frame.
 * Corrige posición si salen de zona caminable y frena si hay obstáculo adelante.
 */
export function updateNpcs(
  npcs: NpcSprite[],
  isWalkableAt: IsWalkableFn,
  snapToTileCenter: SnapFn
): void {
  for (const npc of npcs) {
    if (!npc.active) continue;

    const body = npc.body as Phaser.Physics.Arcade.Body;
    const vx = body.velocity.x;

    if (isWalkableAt(npc.x, npc.y)) {
      npc.lastSafeX = npc.x;
      npc.lastSafeY = npc.y;

      if (vx !== 0) {
        const margin = TILE_SIZE * 0.6;
        const checkX = npc.x + Math.sign(vx) * margin;

        if (!isWalkableAt(checkX, npc.y)) {
          npc.setVelocity(0, 0);
          npc.isKnockedBack = false;
          npc.play(`${npc.texture.key}-idle`, true);
          const snapped = snapToTileCenter(npc.x, npc.y);
          npc.setPosition(snapped.x, snapped.y);
        }
      }
    } else {
      npc.setVelocity(0, 0);
      npc.setPosition(npc.lastSafeX ?? npc.x, npc.lastSafeY ?? npc.y);
      npc.isKnockedBack = false;
      npc.play(`${npc.texture.key}-idle`, true);
    }
  }
}