import Phaser from 'phaser';

// ─────────────────────────────────────────────────────────────────────────────
// MOVE PLAYER TO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mueve el player hacia una posición objetivo y ejecuta un callback al llegar.
 * Bloquea el input durante el movimiento vía setActing.
 */
export function movePlayerTo(
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  targetX: number,
  targetY: number,
  setActing: (v: boolean) => void,
  onComplete: () => void
): void {
  setActing(true);

  scene.physics.moveTo(player, targetX, targetY, 100);

  const check = scene.time.addEvent({
    delay: 50,
    loop: true,
    callback: () => {
      const dist = Phaser.Math.Distance.Between(
        player.x, player.y,
        targetX, targetY
      );

      if (dist < 4) {
        player.setVelocity(0, 0);
        check.remove(false);
        setActing(false);
        onComplete();
      }
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ADJACENT POSITION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula la posición adyacente al target en el lado más cercano al player.
 * Usado para posicionar al player junto a una parcela antes de regar.
 */
export function getAdjacentPosition(
  playerX: number,
  playerY: number,
  targetX: number,
  targetY: number,
  tileSize: number
): { x: number; y: number } {
  const dx = playerX - targetX;
  const dy = playerY - targetY;

  let x = targetX;
  let y = targetY;

  if (Math.abs(dx) > Math.abs(dy)) {
    x = dx > 0 ? targetX + tileSize : targetX - tileSize;
  } else {
    y = dy > 0 ? targetY + tileSize : targetY - tileSize;
  }

  return { x, y };
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAY WATER ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reproduce la animación de riego del player orientada hacia el target.
 * Bloquea el input durante la animación vía setActing.
 */
export function playWaterAnimation(
  player: Phaser.Physics.Arcade.Sprite,
  targetX: number,
  targetY: number,
  setActing: (v: boolean) => void
): void {
  const dx = targetX - player.x;
  const dy = targetY - player.y;

  let dir = 'down';
  if (Math.abs(dx) > Math.abs(dy)) {
    dir = dx > 0 ? 'right' : 'left';
  } else {
    dir = dy > 0 ? 'down' : 'up';
  }

  setActing(true);
  player.setVelocity(0, 0);
  player.play(`player-water-${dir}`);

  player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
    player.play(`player-idle-${dir}`);
    setActing(false);
  });
}