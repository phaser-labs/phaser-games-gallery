import { Scene } from 'phaser';

import { resetState } from '../global-state';
import { announce } from '../utils/announce';
import { AudioManager, createAudioButtons } from '../utils/audio-manager';
import { ASSETS } from '../utils/game-assets';

import css from '../styles/verdictale.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface MenuItem {
    label: string;
    action: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MENU
// ─────────────────────────────────────────────────────────────────────────────

export class MainMenu extends Scene {
    private menuItems: MenuItem[] = [];
    private selectedIndex = 0;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private enterKey!: Phaser.Input.Keyboard.Key;
    private menuTexts: Phaser.GameObjects.Text[] = [];
    private heartCursor!: Phaser.GameObjects.Text;
    private currentPanel: 'main' | 'panel' = 'main';
    private panelDom!: Phaser.GameObjects.DOMElement;

    private panelCloseCallback: (() => void) | null = null;
    private spaceKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super('MainMenu');
    }

    // ========================================================================
    // CREATE
    // ========================================================================
    create() {
        this.clearMenu();

        const { width: W, height: H } = this.scale;
        const cx = W / 2;

        // Fondo negro
        this.add.rectangle(cx, H / 2, W, H, 0x000000);

        // Logo
        this.add.image(cx, H / 2 - 110, ASSETS.items.cover.key)
            .setScale(0.3)
            .setDepth(1);

        // Menú
        this.menuItems = [
            { label: 'JUGAR', action: () => this.startGame() },
            { label: 'CONTROLES', action: () => this.showControls() },
        ];

        this.buildMenu(cx, H / 2 + 50);

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        let audioManager = this.registry.get("audioManager");

        if (!audioManager) {
            audioManager = new AudioManager(this);
            this.registry.set("audioManager", audioManager);
        }
        audioManager.playMusic(ASSETS.menu_music.key);
        createAudioButtons(this);

        this.cameras.main.fadeIn(800, 0, 0, 0);
        announce('Menú principal. Usa flechas arriba y abajo para navegar. Presiona Enter para seleccionar.');
    }

    // CLEAR
    private clearMenu(): void {
        this.currentPanel = 'main';
        this.panelCloseCallback = null;
        this.selectedIndex = 0;
        this.menuItems = [];
        this.menuTexts = [];

        this.input.keyboard!.clearCaptures();
    }

    // ========================================================================
    // BUILD MENU
    // ========================================================================
    private buildMenu(cx: number, startY: number): void {
        this.menuTexts = [];

        this.menuItems.forEach((item, i) => {
            const y = startY + i * 32;

            const text = this.add.text(cx, y, item.label, {
                fontFamily: 'Courier New',
                fontSize: '14px',
                color: '#ffffff',
            })
                .setOrigin(0, 0.5)
                .setDepth(2)
                .setInteractive({ useHandCursor: true });

            text.on('pointerover', () => {
                const audioManager = this.registry.get("audioManager"); // 🔥 AQUÍ
                audioManager?.playSFX(ASSETS.ui_move.key, 0.3);
                this.selectedIndex = i;
                this.updateSelection();
            });

            text.on('pointerdown', () => {
                const audioManager = this.registry.get("audioManager"); // 🔥 AQUÍ
                audioManager?.playSFX(ASSETS.ui_confirm.key, 0.3);
                item.action()
            });

            this.menuTexts.push(text);
        });

        // Corazón cursor
        this.heartCursor = this.add.text(cx - 15, startY, '❤', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#ff6600',
        })
            .setOrigin(0.5)
            .setDepth(2);

        // Parpadeo del corazón
        this.tweens.add({
            targets: this.heartCursor,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        this.updateSelection();
    }

    // ========================================================================
    // UPDATE SELECTION
    // ========================================================================
    private updateSelection(): void {
        this.menuTexts.forEach((t, i) => {
            t.setColor(i === this.selectedIndex ? '#ff6600' : '#ffffff');
        });

        const selected = this.menuTexts[this.selectedIndex];
        if (selected) {
            this.heartCursor.setY(selected.y);
            announce(`Opción: ${selected.text}`);
        }
    }

    // ========================================================================
    // UPDATE
    // ========================================================================
    update(): void {
        const audioManager = this.registry.get("audioManager");

        // 🔥 cerrar panel con teclado
        if (this.currentPanel === 'panel' && this.panelCloseCallback) {
            if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
                Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                const audioManager = this.registry.get("audioManager");
                audioManager?.playSFX(ASSETS.ui_confirm.key, 0.3);

                const cb = this.panelCloseCallback;
                this.panelCloseCallback = null;
                cb();
            }
            return;
        }

        if (this.currentPanel !== 'main') return;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
            audioManager.playSFX(ASSETS.ui_move.key, 0.3);
            this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
            this.updateSelection();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
            audioManager.playSFX(ASSETS.ui_move.key, 0.3);
            this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;
            this.updateSelection();
        }
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            audioManager.playSFX(ASSETS.ui_confirm.key, 0.3);
            this.menuItems[this.selectedIndex].action();
        }
    }

    // ========================================================================
    // PANEL GENÉRICO
    // ========================================================================
    private showPanel(
        title: string,
        lines: string[],
        btnLabel: string,
        onClose: () => void
    ): void {
        this.currentPanel = 'panel';
        const { width: W, height: H } = this.scale;

        const content = lines
            .map(l =>
                l === ''
                    ? `<div class="${css['panel-spacer']}"></div>`
                    : `<div>${l}</div>`
            )
            .join('');

        const html = `
            <div class="${css['panel-overlay']}" style="width:${W}px;height:${H}px;">
                <div class="${css['panel-box']}">

                    <div class="${css['panel-title']}">
                        ${title}
                    </div>

                    <div class="${css['panel-content']}">
                        ${content}
                    </div>

                    <div class="${css['panel-actions']}">
                        <button id="btn-action" class="${css['panel-button']}">
                            ${btnLabel}
                        </button>
                    </div>

                </div>
            </div>
        `;

        if (this.panelDom?.active) this.panelDom.destroy();

        this.panelDom = this.add.dom(W / 2, H / 2)
            .setOrigin(0.5)
            .setDepth(50)
            .setScrollFactor(0)
            .createFromHTML(html);

        announce(`${title}. ${lines.join(' ')} Presiona Enter para ${btnLabel}`);

        const close = () => {
            this.panelCloseCallback = null;
            if (this.panelDom?.active) this.panelDom.destroy();
            onClose();
        };

        this.panelCloseCallback = close;

        const btn = (this.panelDom.node as HTMLDivElement)
            .querySelector('#btn-action') as HTMLButtonElement;

        btn.onclick = () => {
            const audioManager = this.registry.get("audioManager");
            audioManager?.playSFX(ASSETS.ui_confirm.key, 0.3); // 🔊 sonido

            close();
        };
    }

    // ========================================================================
    // PANELS INDIVIDUALES
    // ========================================================================
    private showControls(): void {
        this.showPanel(
            '❤ CONTROLES',
            [
                '* [↑ ↓ ← →]  —  Mover al personaje',
                '',
                '* [ENTER / ESPACIO]  —  Interactuar y confirmar',
                '',
                '* [← →]  —  Seleccionar opción en combate',
                '',
                '* [↓]  —  Salir de una casa',
                '',
                '* [M]  —  Activar / desactivar música',
                '',
                '* [S]  —  Activar / desactivar efectos sonoros',
            ],
            '▶ Volver',
            () => { this.currentPanel = 'main'; }
        );
    }

    // ========================================================================
    // START GAME — secuencia historia → objetivo → juego
    // ========================================================================
    private startGame(): void {
        resetState();
        this.showIntroSequence();
    }

    private showIntroSequence(): void {
        const sequence = [
            {
                title: '❤ HISTORIA',
                lines: [
                    '* Un pueblo tranquilo ha sido invadido por criaturas del conocimiento.',
                    '',
                    '* Esqueletos, monos, leones y espíritus se han refugiado en las casas de los aldeanos.',
                    '',
                    '* Solo un viajero con la mente afilada puede enfrentarlos y devolverle la paz al pueblo.',
                    '',
                    '* Ese viajero... eres tú.',
                ],
            },
            {
                title: '❤ TU MISIÓN',
                lines: [
                    '* Explora el pueblo y entra a las 7 casas.',
                    '',
                    '* Dentro encontrarás una criatura que te desafiará con preguntas de verdadero o falso.',
                    '',
                    '* Tienes 3 vidas por casa.',
                    '',
                    '* Responde todas las preguntas para completar tu misión y salvar el pueblo.',
                    '',
                    '* Buena suerte, viajero.',
                ],
            },
        ];

        let step = 0;

        const showNext = () => {
            if (step >= sequence.length) {
                if (this.panelDom?.active) this.panelDom.destroy();
                this.currentPanel = 'main';
                this.cameras.main.fadeOut(800, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('Game');
                });
                return;
            }

            const { title, lines } = sequence[step];
            step++;

            const isLast = step >= sequence.length;
            const btnLabel = isLast ? '▶ ¡Comenzar aventura!' : '▶ Siguiente';

            announce(`${title}. ${lines.join(' ')} ${btnLabel}`);

            this.showPanel(title, lines, btnLabel, showNext);
        };

        showNext();
    }
}