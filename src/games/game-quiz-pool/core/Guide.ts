import type { Segment } from "../game/version1/Constants";
import { ALL_SEGMENTS, GUIDE_LENGTH } from  "../game/version1/Constants";

import { stepGuide } from './Physics';

// ─────────────────────────────────────────────────────────────
//  GUÍA DE TRAYECTORIA
// ─────────────────────────────────────────────────────────────

export interface GuideResult {
  /** Puntos de la bola blanca hasta el impacto (o GUIDE_LENGTH si no hay). */
  whitePts: Array<{ x: number; y: number }>;
  /** Puntos de ball1 tras la colisión. Vacío si no hay impacto. */
  ball1Pts: Array<{ x: number; y: number }>;
}

/**
 * Simula la trayectoria de la bola blanca y detecta si va a impactar ball1.
 *
 * - La línea blanca llega exactamente hasta el punto de tangencia y se corta.
 * - Si hay impacto, calcula también la dirección que tomará ball1 (colisión
 *   elástica) y devuelve sus puntos con longitud GUIDE_LENGTH * 0.8.
 * - Si ball1 está embocada (targetPocketed), la línea blanca usa GUIDE_LENGTH
 *   y se comporta como una guía libre rebotando por la mesa.
 */
export function calcGuideWithCollision(
  startX: number,
  startY: number,
  dirX: number,
  dirY: number,
  target: { x: number; y: number },
  targetPocketed: boolean,
  ballR: number,
  collisionDist: number,
  outerX1: number,
  outerY1: number,
  outerX2: number,
  outerY2: number,
  segments: Segment[] = ALL_SEGMENTS
): GuideResult {
  const whitePts: Array<{ x: number; y: number }> = [];
  const ball1Pts: Array<{ x: number; y: number }> = [];
  const step = 1; // ← más pequeño = más preciso
  // const collisionDist = ballR ; // ← diámetro, no radio

  const distToTarget = !targetPocketed
    ? Math.sqrt((target.x - startX) ** 2 + (target.y - startY) ** 2) + collisionDist
    : GUIDE_LENGTH;
  const whiteMaxLen = targetPocketed ? GUIDE_LENGTH : distToTarget;

  let px = startX,
    py = startY,
    vx = dirX,
    vy = dirY;
  let impacted = false;
  let traveled = 0;

  while (traveled < whiteMaxLen) {
    if (!impacted && !targetPocketed) {
      const dx = target.x - px,
        dy = target.y - py;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d <= collisionDist + step) {
        // Retroceder al punto exacto de tangencia
        const ratio = Math.max(0, (d - collisionDist) / step);
        const ipx = px + vx * step * ratio;
        const ipy = py + vy * step * ratio;
        whitePts.push({ x: ipx, y: ipy });

        // Normal: desde centro de ballWhite (ipx,ipy) → centro de ball1
        // Esta es exactamente la misma normal que usa resolveElasticCollision
        const ndx = target.x - ipx;
        const ndy = target.y - ipy;
        const ndist = Math.sqrt(ndx * ndx + ndy * ndy) || 1;
        const nx = ndx / ndist;
        const ny = ndy / ndist;

        // Proyección de la velocidad sobre la normal
        const dot = vx * nx + vy * ny; // ← sin el -10
         if (dot < 0) {
           // ← borde lejano/tangencial → ignorar
           impacted = true;
           break;
         }

        whitePts.push({ x: ipx, y: ipy });

        if (dot > 0.15) {
          // ball1 sale en dirección de la normal (igual que física real)
          let b1vx = nx;
          let b1vy = ny;

          let b1px = target.x,
            b1py = target.y;
          let b1traveled = 0;
          while (b1traveled < GUIDE_LENGTH * 0.2) {
            const next = stepGuide(b1px, b1py, b1vx, b1vy, step, ballR, outerX1, outerY1, outerX2, outerY2, segments);
            b1px = next.px;
            b1py = next.py;
            b1vx = next.vx;
            b1vy = next.vy;
            b1traveled += step;
            ball1Pts.push({ x: b1px, y: b1py });
          }
        }

        impacted = true;
        break;
      }
    }

    const next = stepGuide(px, py, vx, vy, step, ballR, outerX1, outerY1, outerX2, outerY2, segments);
    px = next.px;
    py = next.py;
    vx = next.vx;
    vy = next.vy;
    traveled += step;
    whitePts.push({ x: px, y: py });
  }

  return { whitePts, ball1Pts };
}
