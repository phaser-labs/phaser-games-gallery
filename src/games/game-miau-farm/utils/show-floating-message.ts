import Phaser from 'phaser';

import css from '../styles/kitty-farm.module.css';

export function showFloatingMessageUI(
  scene: Phaser.Scene,
  message: string,
  zoom: number
) {
  const W = scene.scale.gameSize.width;
  const H = scene.scale.gameSize.height;

  const dom = scene.add.dom(W / 2, H / 2)
    .setOrigin(0.5, 0.5)
    .setDepth(20)
    .setScrollFactor(0)
    .setScale(1 / zoom)
    .createFromHTML(`
      <div class="${css['sp-messages']}" style="width: ${W}px; height: ${H}px;">
        <div id="float-msg" class="${css['sp-floating-msg']}">${message}</div>
      </div>
    `);

  const msgEl = (dom.node as HTMLDivElement).querySelector('#float-msg') as HTMLDivElement;

  if (!msgEl) return;

  requestAnimationFrame(() => {
    msgEl.classList.add(css['sp-floating-msg--show']);
  });

  scene.time.delayedCall(1500, () => dom.destroy());
}

