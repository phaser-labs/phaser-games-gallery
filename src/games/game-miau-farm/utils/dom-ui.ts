import Phaser from 'phaser';

import css from '../styles/kitty-farm.module.css';

const ZOOM = 3;

// ─────────────────────────────────────────────────────────────────────────────
// CHEST COUNTER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea el DOM del contador de cofres y retorna el <span> para actualizarlo.
 */
export function createChestCounterDom(
  scene: Phaser.Scene,
  chestImagePath: string,
  total: number
): HTMLSpanElement {
  const W = scene.scale.gameSize.width;
  const H = scene.scale.gameSize.height;

  const counterDom = scene.add.dom(W / 2, H / 2)
    .setOrigin(0.5, 0.5)
    .setDepth(18)
    .setScrollFactor(0)
    .setScale(1 / ZOOM)
    .createFromHTML(`
      <div class="${css['chest-counter']}" style="width:${W}px;height:${H}px;">
        <div class="${css['chest-icon']}">
          <img src="${chestImagePath}" id="chest-icon" />
          <span class="${css['chest-count']}" id="chest-counter">0 / ${total}</span>
        </div>
      </div>
    `);

  return (counterDom.node as HTMLDivElement).querySelector('#chest-counter')!;
}

/**
 * Actualiza el texto del contador y dispara la animación de rebote.
 */
export function updateChestCounter(
  el: HTMLSpanElement,
  opened: number,
  total: number
): void {
  if (!el) return;

  el.textContent = `${opened} / ${total}`;

  el.style.transition = 'transform 0.1s ease';
  el.style.transform = 'scale(1.4)';

  setTimeout(() => {
    el.style.transform = 'scale(1)';
  }, 150);
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispara la animación de rebote en el contador de cosecha del inventario.
 */
export function animateInventory(type: 'corn' | 'tomato'): void {
  const id = type === 'corn' ? 'corn-harvest-count' : 'tomato-harvest-count';
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.remove(css.bounce);
  void el.offsetWidth; // reset animation
  el.classList.add(css.bounce);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHEST FLOATING MESSAGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Muestra un mensaje flotante sobre un cofre. Solo uno a la vez por cofre.
 */
export function showChestMessage(
  scene: Phaser.Scene,
  chest: Phaser.Physics.Arcade.Sprite,
  message: string,
  zoom: number,
  tileSize: number
): void {
  if (chest.getData('showingMsg')) return;

  chest.setData('showingMsg', true);

  const text = scene.add
    .text(chest.x, chest.y - tileSize, message, {
      fontSize: '1rem',
      color: '#fff3c4',
      fontFamily: 'PixelFont',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    })
    .setOrigin(0.5)
    .setDepth(999)
    .setScale(1 / zoom)
    .setScrollFactor(1);

  scene.tweens.add({
    targets: text,
    y: text.y - 10,
    alpha: 0,
    duration: 1800,
    ease: 'Power2',
    onComplete: () => {
      text.destroy();
      chest.setData('showingMsg', false);
    },
  });


}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIPS
// ─────────────────────────────────────────────────────────────────────────────

export function createTooltipText(
  scene: Phaser.Scene,
  text: string,
  zoom: number
): Phaser.GameObjects.Text {
  return scene.add.text(0, 0, text, {
    fontSize: '1rem',
    color: '#fff3c4',
    fontFamily: 'PixelFont',
    stroke: '#000000',
    strokeThickness: 3,
    align: 'center',
  })
    .setOrigin(0.5)
    .setDepth(999)
    .setScale(1 / zoom)
    .setScrollFactor(1)
    .setVisible(false);
}