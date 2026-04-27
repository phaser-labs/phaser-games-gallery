import { Scene } from 'phaser';

import { createAnimations, preloadAssets, preloadBackground } from '../utils';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.createProgressBar();

        preloadBackground(this);
        preloadAssets(this);
    }

    create() {
        createAnimations(this);

        const MIN_MS = 900;

        this.time.delayedCall(MIN_MS, () => {
            this.scene.start('MainMenu');
        });
    }

    private createProgressBar() {
        const { width, height } = this.scale;

        const barW = 300;
        const barH = 18;
        const cx = width / 2;
        const cy = height / 2;

        // ── Fondo negro total ────────────────────────────────────────────────
        this.add.rectangle(cx, cy, width, height, 0x000000);

        // ── Título estilo Undertale ──────────────────────────────────────────
        this.add.text(cx, cy - 80, 'VERDICTALE', {
            fontFamily: 'Courier New',
            fontSize: '22px',
            color: '#ffffff',
            letterSpacing: 6,
        }).setOrigin(0.5);

        // ── Texto "Cargando..." ──────────────────────────────────────────────
        const loadingText = this.add.text(cx, cy - 36, '* Cargando...', {
            fontFamily: 'Courier New',
            fontSize: '13px',
            color: '#aaaaaa',
        }).setOrigin(0.5);

        // ── Barra — borde blanco, relleno amarillo como el corazón ───────────
        const barX = cx - barW / 2;
        const barY = cy - barH / 2;

        const border = this.add.graphics();
        border.lineStyle(2, 0xffffff, 1);
        border.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);

        const fill = this.add.graphics();

        // ── Porcentaje ───────────────────────────────────────────────────────
        const percentText = this.add.text(cx, cy + 22, '0%', {
            fontFamily: 'Courier New',
            fontSize: '11px',
            color: '#ffffff',
        }).setOrigin(0.5).setDepth(10);

        // ── Heart cursor parpadeante ─────────────────────────────────────────
        const heart = this.add.text(barX - 20, cy, '❤', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#ff0000',
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: heart,
            alpha: 0,
            duration: 400,
            yoyo: true,
            repeat: -1,
        });

        // ── Progreso suavizado ───────────────────────────────────────────────
        let displayPct = 0;
        let targetPct = 0;

        this.load.on('progress', (v: number) => {
            targetPct = Phaser.Math.Clamp(v, 0, 1);
        });

        this.events.on(Phaser.Scenes.Events.UPDATE, () => {
            displayPct += (targetPct - displayPct) * 0.12;
            const pct = Phaser.Math.Clamp(displayPct, 0, 1);

            percentText.setText(`${Math.round(pct * 100)}%`);

            // mover el corazón con la barra
            heart.setX(barX + barW * pct - 8);

            fill.clear();
            fill.fillStyle(0xffff00, 1); // amarillo — color del corazón selector
            fill.fillRect(barX, barY, barW * pct, barH);

            // cambiar texto al completar
            if (pct >= 0.99) {
                loadingText.setText('* ¡Listo!');
            }
        });

        this.load.once('complete', () => {
            targetPct = 1;
        });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            border.destroy();
            fill.destroy();
            heart.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
    }
}
