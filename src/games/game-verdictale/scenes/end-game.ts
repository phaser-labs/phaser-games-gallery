import { Scene } from 'phaser';

import { getHouseVisitedCount, getLivesLost, getTotalQuestions, globalState, resetState } from '../global-state';
import { ASSETS } from '../utils';
import { announce, announceMessage } from '../utils/announce';
import { createAudioButtons } from '../utils/audio-manager';


// ─────────────────────────────────────────────────────────────────────────────
// TYPEWRITER HELPER
// ─────────────────────────────────────────────────────────────────────────────

function typewriterText(
    scene: Scene,
    textObj: Phaser.GameObjects.Text,
    fullText: string,
    speed: number,
    onComplete?: () => void
): void {
    let i = 0;
    textObj.setText('');

    scene.time.addEvent({
        delay: speed,
        repeat: fullText.length - 1,
        callback: () => {
            textObj.setText(textObj.text + fullText[i]);

            // 🔊 sonido de typing — solo en caracteres visibles, no espacios ni saltos
            if (fullText[i] !== ' ' && fullText[i] !== '\n') {
                const audioManager = scene.registry.get("audioManager");
                audioManager?.playSFX(ASSETS.ui_hover.key, 0.15, {
                    detune: Phaser.Math.Between(-200, 200) // variación de tono
                });
            }

            i++;
            if (i >= fullText.length && onComplete) {
                scene.time.delayedCall(600, onComplete);
            }
        },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// END GAME SCENE
// ─────────────────────────────────────────────────────────────────────────────

export class EndGame extends Scene {
    private lines: string[] = [];
    private lineIndex = 0;
    private textObj!: Phaser.GameObjects.Text;
    private statsObj!: Phaser.GameObjects.Text;
    private isTyping = false;
    private allDone = false;
    private enterKey!: Phaser.Input.Keyboard.Key;

    private spaceKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super('EndGame');
    }

    // ========================================================================
    // CREATE
    // ========================================================================
    create() {
        this.clearText();

        const W = this.scale.width;
        const H = this.scale.height;
        const cx = W / 2;

        this.cameras.main.setZoom(1); // 🔥 sin zoom en EndGame

        // Fondo negro
        this.add.rectangle(cx, H / 2, W, H, 0x000000).setDepth(0);

        this.createText(cx, H, W);

        // Líneas del final estilo Undertale
        this.lines = [
            '* Has respondido todas las preguntas.',
            '* El pueblo vuelve a estar en paz.',
            '* Las criaturas ya no acechan\n  en las casas.',
            '* Gracias por jugar.',
        ];

        this.enterKey = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );

        // Fade desde negro
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(1500, 0, 0, 0);

        // Iniciar después del fade
        this.time.delayedCall(1800, () => this.showNextLine());

        // 🔥 reanudar audio
        if ("context" in this.sound) {
            const manager = this.sound as Phaser.Sound.WebAudioSoundManager;
            manager.context.resume();
        }

        const audioManager = this.registry.get("audioManager");

        if (!audioManager.isMusicPlaying()) {
            audioManager.playMusic(ASSETS.menu_music.key);
        }

        createAudioButtons(this);

        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // ========================================================================
    // UPDATE
    // ========================================================================
    update(): void {
        if (this.allDone) return;

        if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
            Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            this.input.activePointer.isDown) {
            if (!this.isTyping) {
                const audioManager = this.registry.get("audioManager");
                audioManager?.playSFX(ASSETS.ui_confirm.key, 0.25); // 🔊
                this.showNextLine();
            }
        }
    }

    // CLEAR
    private clearText(): void {
        this.lineIndex = 0;
        this.isTyping = false;
        this.allDone = false;
    }

    // ========================================================================
    // CREATE TEXT
    // ========================================================================
    private createText(cx: number, H: number, W: number): void {
        // Texto principal — typewriter
        this.textObj = this.add.text(cx, H / 2 - 60, '', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 8,
            wordWrap: { width: W * 0.75 },
        })
            .setOrigin(0.5)
            .setDepth(10);

        // Estadísticas
        this.statsObj = this.add.text(cx, H / 2 + 60, '', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#aaaaaa',
            align: 'center',
            lineSpacing: 6,
        })
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(10);

        // Ayuda para continuar
        this.add.text(cx, H - 20, '[ ENTER / ESPACIO ] para continuar', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#7d7d7d',
        })
            .setOrigin(0.5)
            .setDepth(10);
    }

    // ========================================================================
    // SHOW NEXT LINE
    // ========================================================================
    private showNextLine(): void {
        if (this.lineIndex >= this.lines.length) {
            this.showStats();
            return;
        }

        const line = this.lines[this.lineIndex];
        this.lineIndex++;
        this.isTyping = true;

        announce(`Narrador: ${line}. Presiona Enter para continuar.`);

        typewriterText(this, this.textObj, line, 40, () => {
            this.isTyping = false;
        });
    }

    // ========================================================================
    // SHOW STATS
    // ========================================================================
    private showStats(): void {
        const audioManager = this.registry.get("audioManager");
        audioManager?.playSFX(ASSETS.bleep.key, 0.3);

        const answered = globalState.answeredQuestions;
        const total = getTotalQuestions();
        const lives = getLivesLost();
        const houses = getHouseVisitedCount();

        const statsText = [
            `Preguntas respondidas : ${answered} / ${total}`,
            `Casas visitadas      : ${houses}`,
            `Vidas perdidas       : ${lives}`,
        ].join('\n');

        this.textObj.setText('* Aquí está tu resumen:');

        this.tweens.add({
            targets: this.statsObj,
            alpha: 1,
            duration: 800,
            ease: 'Linear',
            onStart: () => this.statsObj.setText(statsText),
        });

        announceMessage(
            'Resumen final',
            `Respondiste ${answered} de ${total} preguntas. Visitaste ${houses} casas y perdiste ${lives} vidas. 
            Fin del juego. Presiona Enter para volver al inicio.`
        );

        // Mostrar botón de créditos
        this.time.delayedCall(1200, () => this.showCreditsButton());
    }

    // ========================================================================
    // CREDITS BUTTON
    // ========================================================================
    private showCreditsButton(): void {
        this.allDone = true;

        const W = this.scale.width;
        const cx = W / 2;
        const cy = this.scale.height / 2 + 130;

        const btn = this.add.text(cx, cy, '[ Volver al inicio ]', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#ffffff',
        })
            .setOrigin(0.5)
            .setAlpha(0)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);

        // Parpadeo
        this.tweens.add({
            targets: btn,
            alpha: 1,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Linear',
        });

        btn.on('pointerdown', () => {
            const audioManager = this.registry.get("audioManager");
            audioManager?.playSFX(ASSETS.ui_confirm.key, 0.25); // 🔊
            this.goToStart();
        });

        btn.on('pointerover', () => {
            const audioManager = this.registry.get("audioManager");
            audioManager?.playSFX(ASSETS.ui_hover.key, 0.15); // 🔊 hover
        });

        this.enterKey.on('down', () => {
            const audioManager = this.registry.get("audioManager");
            audioManager?.playSFX(ASSETS.ui_confirm.key, 0.25); // 🔊
            this.goToStart();
        });
    }

    // ========================================================================
    // GO TO START
    // ========================================================================
    private goToStart(): void {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            resetState(); // 🔥 limpiar estado
            this.scene.start('MainMenu');
        });
    }
}