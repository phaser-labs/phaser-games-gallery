import { Scene } from 'phaser';

import { createAnimations, preloadAssets, preloadFarmBackground } from '../utils';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.createProgressBar();

        preloadFarmBackground(this);
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

        const barW = Math.min(560, width * 0.78);
        const barH = 22;
        const radius = 10;

        const x = (width - barW) / 2;
        const y = height / 2;

        // Texto arriba
        const loadingText = this.add
            .text(width / 2, y - 40, 'Cargando...', {
                fontFamily: '"PixelFont", monospace',
                fontSize: '18px',
                color: '#ffffff',
            })
            .setOrigin(0.5);

        // % centrado dentro de la barra
        const percentText = this.add
            .text(width / 2, y + barH / 2, '0%', {
                fontFamily: '"PixelFont", monospace',
                fontSize: '16px',
                color: '#ffffff',
            })
            .setOrigin(0.5)
            .setDepth(10);

        const bg = this.add.graphics();
        const fill = this.add.graphics();
        const border = this.add.graphics();

        // Fondo de barra (gris)
        bg.fillStyle(0x4a4a4a, 0.9);
        bg.fillRoundedRect(x, y, barW, barH, radius);

        border.lineStyle(2, 0x9a9a9a, 1);
        border.strokeRoundedRect(x, y, barW, barH, radius);

        // Suavizado visual para que se vea aunque cargue rápido
        let displayPct = 0;
        let targetPct = 0;

        this.load.on('progress', (v: number) => {
            targetPct = Phaser.Math.Clamp(v, 0, 1);
        });

        this.events.on(Phaser.Scenes.Events.UPDATE, () => {
            displayPct += (targetPct - displayPct) * 0.18;
            const pct = Phaser.Math.Clamp(displayPct, 0, 1);

            percentText.setText(`${Math.round(pct * 100)}%`);

            fill.clear();
            fill.fillStyle(0x515151, 0.85);// morado arcano (puedes cambiarlo a blanco si quieres 100% igual a la referencia)
            fill.fillRect(x, y, barW * pct, barH);
        });

        this.load.once('complete', () => {
            targetPct = 1;
        });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            bg.destroy();
            fill.destroy();
            border.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
    }
}
