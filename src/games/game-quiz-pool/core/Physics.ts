import type { Segment } from '../versiones/version1/Constants';
import { ALL_SEGMENTS, DIRS, TOTAL_COLS, TOTAL_FRAMES } from '../versiones/version1/Constants';

// ─────────────────────────────────────────────────────────────
//  ANIMACIONES — helpers de spritesheet
// ─────────────────────────────────────────────────────────────

/** Devuelve los índices de frame para una dirección dada. */
export function framesForDir(dirCol: number): number[] {
  const frames: number[] = [];
  for (let row = 0; row < TOTAL_FRAMES; row++) frames.push(row * TOTAL_COLS + dirCol);
  return frames;
}

/** Convierte un vector velocidad en una de las 8 direcciones de animación. */
export function getDir(vx: number, vy: number): number {
  const angle = Math.atan2(vy, vx) * (180 / Math.PI);
  if (angle > -112.5 && angle <= -67.5) return DIRS.N;
  if (angle > -67.5 && angle <= -22.5) return DIRS.NW;
  if (angle > -22.5 && angle <= 22.5) return DIRS.E;
  if (angle > 22.5 && angle <= 67.5) return DIRS.SW;
  if (angle > 67.5 && angle <= 112.5) return DIRS.S;
  if (angle > 112.5 && angle <= 157.5) return DIRS.SE;
  if (angle > 157.5 || angle <= -157.5) return DIRS.W;
  if (angle > -157.5 && angle <= -112.5) return DIRS.SW;
  return DIRS.N;
}

// ─────────────────────────────────────────────────────────────
//  FÍSICA
// ─────────────────────────────────────────────────────────────

/**
 * Colisión elástica entre dos bolas de igual masa.
 * Modifica vx/vy de ambas in-place.
 */
export function resolveElasticCollision(
  a: { vx: number; vy: number },
  b: { vx: number; vy: number },
  ax: number,
  ay: number,
  bx: number,
  by: number
): void {
  const dx = bx - ax,
    dy = by - ay;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / dist,
    ny = dy / dist;
  const dotA = a.vx * nx + a.vy * ny;
  const dotB = b.vx * nx + b.vy * ny;
  if (dotA - dotB <= 0) return;
  a.vx += (dotB - dotA) * nx;
  a.vy += (dotB - dotA) * ny;
  b.vx += (dotA - dotB) * nx;
  b.vy += (dotA - dotB) * ny;
}

/**
 * Reflexión física contra un segmento.
 * Usada para paredes, embudos y simulación de la guía.
 */
export function bounceSegment(
  sprite: { x: number; y: number },
  vx: number,
  vy: number,
  seg: Segment,
  r: number
): { vx: number; vy: number; bounced: boolean } {
  const segDx = seg.x2 - seg.x1,
    segDy = seg.y2 - seg.y1;
  const segLen = Math.sqrt(segDx * segDx + segDy * segDy);
  if (segLen === 0) return { vx, vy, bounced: false };

  const tParam = ((sprite.x - seg.x1) * segDx + (sprite.y - seg.y1) * segDy) / (segLen * segLen);
  if (tParam < 0 || tParam > 1) return { vx, vy, bounced: false };

  const closestX = seg.x1 + tParam * segDx;
  const closestY = seg.y1 + tParam * segDy;
  const distX = sprite.x - closestX,
    distY = sprite.y - closestY;
  const dist = Math.sqrt(distX * distX + distY * distY);

  if (dist < r && dist > 0) {
    const dotApproach = vx * (distX / dist) + vy * (distY / dist);
    if (dotApproach >= 0) return { vx, vy, bounced: false };
    const penetration = r - dist;
    sprite.x += (distX / dist) * penetration;
    sprite.y += (distY / dist) * penetration;
    const dotVN = vx * (distX / dist) + vy * (distY / dist);
    vx -= 2 * dotVN * (distX / dist);
    vy -= 2 * dotVN * (distY / dist);
    return { vx, vy, bounced: true };
  }
  return { vx, vy, bounced: false };
}

/**
 * Avanza un paso de simulación aplicando segmentos y bordes exteriores.
 * Usado internamente por la guía de trayectoria.
 */
export function stepGuide(
  px: number,
  py: number,
  vx: number,
  vy: number,
  step: number,
  ballR: number,
  outerX1: number,
  outerY1: number,
  outerX2: number,
  outerY2: number,
  segments: Segment[] = ALL_SEGMENTS
): { px: number; py: number; vx: number; vy: number } {
  px += vx * step;
  py += vy * step;
  const pos = { x: px, y: py };
  for (const seg of segments) {
    const res = bounceSegment(pos, vx, vy, seg, ballR);
    if (res.bounced) {
      vx = res.vx;
      vy = res.vy;
      px = pos.x;
      py = pos.y;
      break;
    }
  }
  if (px - ballR <= outerX1) {
    px = outerX1 + ballR;
    vx = Math.abs(vx);
  } else if (px + ballR >= outerX2) {
    px = outerX2 - ballR;
    vx = -Math.abs(vx);
  }
  if (py - ballR <= outerY1) {
    py = outerY1 + ballR;
    vy = Math.abs(vy);
  } else if (py + ballR >= outerY2) {
    py = outerY2 - ballR;
    vy = -Math.abs(vy);
  }
  return { px, py, vx, vy };
}
