import Phaser from 'phaser';

import { globalState } from '../global-state';
import { AnswerResult } from '../types/types';

import { announce, announceMessage } from './announce';
import { Enemy, ENEMY_LORE } from './enemy-utils';
import { ASSETS } from './game-assets';

import css from '../styles/verdictale.module.css';

const ZOOM = 2;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface BattleState {
    active: boolean;
    lives: number;
    currentEnemy: Enemy | null;
    selectedOption: 0 | 1; // 0 = Verdadero, 1 = Falso
}

// Mapeo enemigo → key de perfil
const ENEMY_PROFILE_MAP: Record<string, string> = {
    [ASSETS.enemies.skeleton.key]: ASSETS.profile.skeleton.key,
    [ASSETS.enemies.monkey.key]: ASSETS.profile.monkey.key,
    [ASSETS.enemies.spirit.key]: ASSETS.profile.spirit.key,
    [ASSETS.enemies.lion.key]: ASSETS.profile.lion.key,
};

// ─────────────────────────────────────────────────────────────────────────────
// BATTLE MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export class BattleManager {
    private scene: Phaser.Scene;
    private dom!: Phaser.GameObjects.DOMElement;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private enterKey!: Phaser.Input.Keyboard.Key;
    private profileCanvas!: HTMLCanvasElement;

    private state: BattleState = {
        active: false,
        lives: 0,
        currentEnemy: null,
        selectedOption: 0,
    };

    private onAllAnswered: () => void;
    private onGameOver: () => void;
    private onDamage: () => void;
    private onAnswer: (result: AnswerResult) => void;

    constructor(
        scene: Phaser.Scene,
        onAllAnswered: () => void,
        onGameOver: () => void,
        onDamage: () => void,
        onAnswer: (result: AnswerResult) => void
    ) {
        this.scene = scene;
        this.onAllAnswered = onAllAnswered;
        this.onGameOver = onGameOver;
        this.onDamage = onDamage;
        this.onAnswer = onAnswer;
        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.enterKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    // ========================================================================
    // START BATTLE
    // ========================================================================
    startBattle(enemy: Enemy): void {
        if (this.state.active) return;
        this.state.active = true;
        this.state.currentEnemy = enemy;
        this.state.selectedOption = 0;
        this.scene.physics.pause();

        const lore = ENEMY_LORE[enemy.sprite.texture.key];
        if (lore && !enemy.introShown) {
            enemy.introShown = true;              // flag nuevo en Enemy
            this.showDialogue(lore.intro, () => this.showBattleUI());
        } else {
            this.showBattleUI();
        }
    }

    // ========================================================================
    // UPDATE — llamar desde scene.update()
    // ========================================================================
    update(): void {
        if (!this.state.active) return;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {

            const audioManager = this.scene.registry.get("audioManager");
            audioManager?.playSFX(ASSETS.ui_move.key, 0.25); // 🔊 mover cursor

            this.state.selectedOption = this.state.selectedOption === 0 ? 1 : 0;
            this.updateOptionHighlight();
        }

        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            const audioManager = this.scene.registry.get("audioManager");
            audioManager?.playSFX(ASSETS.ui_confirm.key, 0.35);

            this.answer(this.state.selectedOption === 0);
        }
    }

    // ========================================================================
    // BATTLE UI — estilo Undertale
    // ========================================================================
    private showBattleUI(): void {
        const enemy = this.state.currentEnemy!;
        const question = enemy.questions[enemy.currentIndex];
        const W = this.scene.scale.gameSize.width;
        const H = this.scene.scale.gameSize.height;

        const enemyKey = enemy.sprite.texture.key;
        const profileKey = ENEMY_PROFILE_MAP[enemyKey] ?? ASSETS.profile.skeleton.key;

        const html = `
            <div class="${css.container}" style="width:${W}px; height:${H}px;">
                <div class="${css.panel}">

                    <div class="${css.header}">
                        <canvas id="profile-canvas" width="40" height="40"
                            class="${css.profile}">
                        </canvas>

                        <div>
                            <div class="${css.enemyName}">
                                ${this.getEnemyName(enemyKey)}
                            </div>
                            <div class="${css.questionCount}">
                                Pregunta ${enemy.currentIndex + 1} / ${enemy.questions.length}
                            </div>
                        </div>

                        <div style="margin-left:auto;" id="hearts-container">
                            ${this.renderHeartsHTML()}
                        </div>
                    </div>

                    <div class="${css.divider}"></div>

                    <div class="${css.statement}">
                        * ${question.statement}
                    </div>

                    <div class="${css.divider}"></div>

                    <div class="${css.options}" id="options-container">

                        <div id="opt-true" class="${css.option}">
                            <span id="cursor-true" class="${css.cursor}">❤</span>
                            Verdadero
                        </div>

                        <div id="opt-false" class="${css.option}">
                            <span id="cursor-false" class="${css.cursor}" style="visibility:hidden;">❤</span>
                            Falso
                        </div>

                    </div>

                </div>
            </div>
        `;

        if (this.dom) this.dom.destroy();

        this.dom = this.scene.add
            .dom(W / 2, H / 2)
            .setOrigin(0.5)
            .setDepth(100)
            .setScrollFactor(0)
            .setScale(1 / ZOOM)
            .createFromHTML(html);

        const root = this.dom.node as HTMLDivElement;

        // Dibujar perfil en canvas
        this.profileCanvas = root.querySelector('#profile-canvas')!;
        this.drawProfile(profileKey);

        this.announceState();

        // Click en opciones
        root.querySelector('#opt-true')!.addEventListener('click', () => {
            const audioManager = this.scene.registry.get("audioManager");
            audioManager?.playSFX(ASSETS.ui_confirm.key, 0.35);
            this.state.selectedOption = 0;
            this.updateOptionHighlight();
            this.answer(true);
        });
        root.querySelector('#opt-false')!.addEventListener('click', () => {
            const audioManager = this.scene.registry.get("audioManager");
            audioManager?.playSFX(ASSETS.ui_confirm.key, 0.35);
            this.state.selectedOption = 1;
            this.updateOptionHighlight();
            this.answer(false);
        });

        this.updateOptionHighlight();
    }

    // ========================================================================
    // DRAW PROFILE
    // ========================================================================
    private drawProfile(profileKey: string): void {
        if (!this.profileCanvas) return;
        const texture = this.scene.textures.get(profileKey);
        if (!texture || texture.key === '__MISSING') return;

        const img = texture.getSourceImage() as HTMLImageElement;
        if (!img || !img.naturalWidth) return;

        const ctx = this.profileCanvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, 40, 40, 0, 0, 40, 40);
    }

    // ========================================================================
    // UPDATE OPTION HIGHLIGHT
    // ========================================================================
    private updateOptionHighlight(): void {
        if (!this.dom) return;
        const root = this.dom.node as HTMLDivElement;

        const cursorTrue = root.querySelector('#cursor-true') as HTMLElement;
        const cursorFalse = root.querySelector('#cursor-false') as HTMLElement;
        const optTrue = root.querySelector('#opt-true') as HTMLElement;
        const optFalse = root.querySelector('#opt-false') as HTMLElement;

        if (!cursorTrue || !cursorFalse) return;

        if (this.state.selectedOption === 0) {
            cursorTrue.style.visibility = 'visible';
            cursorFalse.style.visibility = 'hidden';
            optTrue.style.color = '#ff0';
            optFalse.style.color = '#fff';
        } else {
            cursorTrue.style.visibility = 'hidden';
            cursorFalse.style.visibility = 'visible';
            optTrue.style.color = '#fff';
            optFalse.style.color = '#ff0';
        }

        this.announceState();
    }

    // ========================================================================
    // ANSWER
    // ========================================================================
    private answer(playerAnswer: boolean): void {
        const enemy = this.state.currentEnemy!;
        const question = enemy.questions[enemy.currentIndex];
        const correct = playerAnswer === question.correctAnswer;

        // 🔥 emitir resultado por pregunta
        this.onAnswer({
            isCorrect: correct,
            questionIndex: enemy.currentIndex,
            selectedAnswer: playerAnswer ? 'Verdadero' : 'Falso',
            correctAnswer: question.correctAnswer ? 'Verdadero' : 'Falso',
            question,
        });

        const lore = ENEMY_LORE[enemy.sprite.texture.key];

        if (correct) {
            globalState.answeredQuestions++;

            const audioManager = this.scene.registry.get("audioManager");
            audioManager?.playSFX(ASSETS.ui_success.key, 0.3);

            const lore = ENEMY_LORE[enemy.sprite.texture.key];
            const isLastQuestion = enemy.currentIndex === enemy.questions.length - 1;

            const explanationText = question.explanation
                ? `\n\n${question.explanation}`
                : '';

            const resultMessage = isLastQuestion
                ? (lore?.victoryLine ?? '* ¡Bien hecho!') + explanationText
                : explanationText || '* ¡Correcto!';

            this.showResult(resultMessage, true, () => {
                enemy.currentIndex++;
                if (enemy.currentIndex < enemy.questions.length) {
                    this.state.selectedOption = 0;
                    this.showBattleUI();
                } else {
                    enemy.answered = true;
                    this.scene.tweens.add({
                        targets: enemy.sprite,
                        alpha: 0,
                        duration: 80,
                        yoyo: true,
                        repeat: 3,
                        onComplete: () => {
                            const audioManager = this.scene.registry.get("audioManager");
                            audioManager?.playSFX(ASSETS.ui_success.key, 0.4, { detune: -400 }); // 🔥 más grave = muerte

                            enemy.sprite.destroy();
                            this.closeBattle();
                            this.onAllAnswered();
                        }
                    });
                }
            });
        } else {
            globalState.lives--;
            this.onDamage();

            const audioManager = this.scene.registry.get("audioManager");
            audioManager?.playSFX(ASSETS.hurt.key, 0.3);

            if (globalState.lives <= 0) {
                const defeatLine = lore?.defeatLine ?? 'El enemigo fue demasiado fuerte...';
                this.showResult(defeatLine, false, () => {
                    this.closeBattle();
                    this.onGameOver();
                });
            } else {
                audioManager?.playSFX(ASSETS.ui_wrong.key, 0.3);
                this.showResult(
                    `Incorrecto. Te quedan ${globalState.lives} ${globalState.lives === 1 ? 'vida' : 'vidas'}.`,
                    false,
                    () => {
                        this.state.selectedOption = 0;
                        this.showBattleUI();
                    }
                );
            }
        }
    }

    // ========================================================================
    // SHOW RESULT
    // ========================================================================
    public showResult(
        message: string,
        correct: boolean,
        onClose: () => void,
        showButtons: boolean = true,
        blockGame: boolean = true
    ): void {

        // 🔥 CONTROLAR ESTADO
        if (blockGame) {
            this.state.active = true;
        }

        const W = this.scene.scale.gameSize.width;
        const H = this.scene.scale.gameSize.height;

        const title = correct ? '* ¡Correcto!' : '* Incorrecto.';

        const html = `
            <div class="${css.resultContainer}" style="width:${W}px; height:${H}px;">
                <div class="${css.resultPanel}">
                    
                    <div class="${css.resultTitle} ${correct ? css.correct : css.incorrect}">
                        ${title}
                    </div>

                    <div class="${css.resultText}">
                        ${message}
                    </div>

                    <div class="${css.resultActions}">
                        <button id="btn-continue" class="${css.resultButton}">
                            ▶ Continuar
                        </button>
                    </div>

                </div>
            </div>
        `;

        if (this.dom) this.dom.destroy();

        this.dom = this.scene.add
            .dom(W / 2, H / 2)
            .setOrigin(0.5)
            .setDepth(100)
            .setScrollFactor(0)
            .setScale(1 / ZOOM)
            .createFromHTML(html);

        const btn = (this.dom.node as HTMLDivElement).querySelector('#btn-continue') as HTMLButtonElement;

        if (!showButtons) btn.style.visibility = 'hidden';

        btn.onclick = () => {
            const audioManager = this.scene.registry.get("audioManager");
            audioManager?.playSFX(ASSETS.ui_confirm.key, 0.35);

            if (blockGame) {
                this.state.active = false; // 🔥 LIBERAR JUEGO
            }
            onClose();
        };

        const onKey = () => {
            if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                const audioManager = this.scene.registry.get("audioManager");
                audioManager?.playSFX(ASSETS.ui_confirm.key, 0.35);
                if (blockGame) {
                    this.state.active = false; // 🔥 LIBERAR JUEGO
                }
                onClose();
                this.scene.events.off('update', onKey);
            }
        };

        this.scene.events.on('update', onKey);

        announceMessage(title, message + ' Presiona Enter para continuar.');
    }

    // ========================================================================
    // CLOSE BATTLE
    // ========================================================================
    private closeBattle(): void {
        this.state.active = false;
        this.state.currentEnemy = null;
        if (this.dom) this.dom.destroy();
        this.scene.physics.resume();
    }

    // ========================================================================
    // HELPERS
    // ========================================================================
    private getEnemyName(key: string): string {
        const names: Record<string, string> = {
            [ASSETS.enemies.skeleton.key]: 'ESQUELETO',
            [ASSETS.enemies.monkey.key]: 'MONO',
            [ASSETS.enemies.spirit.key]: 'ESPÍRITU',
        };
        return names[key] ?? 'ENEMIGO';
    }

    private renderHeartsHTML(): string {
        return Array.from({ length: 3 }, (_, i) =>
            `<span style="font-size:14px; color:${i < globalState.lives ? '#f00' : '#333'};">♥</span>`
        ).join('');
    }

    private announceState(): void {
        const enemy = this.state.currentEnemy!;
        const question = enemy.questions[enemy.currentIndex];

        const selected =
            this.state.selectedOption === 0 ? 'Verdadero' : 'Falso';

        announce(
            `Pregunta: ${question.statement}.
            Opciones: Verdadero o Falso.
            Seleccionado: ${selected}.`
        );
    }

    private showDialogue(lines: string[], onFinish: () => void): void {
        const W = this.scene.scale.gameSize.width;
        const H = this.scene.scale.gameSize.height;
        let lineIndex = 0;

        const audioManager = this.scene.registry.get("audioManager");
        audioManager?.playSFX(ASSETS.bubble_pop.key, 0.3); // 🔊 abrir lore

        const renderLine = () => {
            const html = `
                <div class="${css.resultContainer}" style="width:${W}px; height:${H}px;">
                    <div class="${css.resultPanel}">
                        <div class="${css.resultText}">${lines[lineIndex]}</div>
                        <div class="${css.resultActions}">▼</div>
                    </div>
                </div>
            `;

            if (this.dom) this.dom.destroy();
            this.dom = this.scene.add.dom(W / 2, H / 2)
                .setOrigin(0.5).setDepth(100)
                .setScrollFactor(0).setScale(1 / ZOOM)
                .createFromHTML(html);

            announce(`Diálogo: ${lines[lineIndex]}. Presiona Enter para continuar.`);

            // Avanzar con Enter o click
            const advance = () => {
                const audioManager = this.scene.registry.get("audioManager");
                audioManager?.playSFX(ASSETS.ui_hover.key, 0.2); // 🔊 blip
                lineIndex++;
                if (lineIndex < lines.length) {
                    renderLine();
                } else {
                    onFinish();
                }
            };

            (this.dom.node as HTMLDivElement).addEventListener('click', () => {
                const audioManager = this.scene.registry.get("audioManager");
                audioManager?.playSFX(ASSETS.ui_hover.key, 0.2);

                advance();
            });

            const onEnter = () => {
                if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                    advance();
                    this.scene.events.off('update', onEnter);
                }
            };
            this.scene.events.on('update', onEnter);
        };

        renderLine();
    }

    get isActive(): boolean { return this.state.active; }

    get lives(): number { return globalState.lives; };

    get isBlocking(): boolean {
        return this.state.active && this.state.currentEnemy !== null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DAMAGE ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

export function playDamageAnimation(
    scene: Phaser.Scene,
    player: Phaser.Physics.Arcade.Sprite
): void {
    scene.tweens.add({
        targets: player,
        alpha: 0,
        duration: 80,
        yoyo: true,
        repeat: 4,
        ease: 'Linear',
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// END MODAL
// ─────────────────────────────────────────────────────────────────────────────

export function showEndModal(
    scene: Phaser.Scene,
    type: 'victory' | 'gameover',
    onAction: () => void
): void {
    const audioManager = scene.registry.get("audioManager");

    // 🔊 sonido al mostrar el modal
    if (type === 'victory') {
        audioManager?.playSFX(ASSETS.ui_success.key, 0.5);
    } else {
        audioManager?.playSFX(ASSETS.ui_wrong.key, 0.5);
    }

    const W = scene.scale.gameSize.width;
    const H = scene.scale.gameSize.height;

    const isVictory = type === 'victory';

    const title = isVictory ? '¡Casa completada!' : 'GAME OVER';
    const message = isVictory
        ? '* Has respondido todas las preguntas.\n  ¡Excelente trabajo!'
        : '* Has perdido todas tus vidas.\n  ¿Lo intentas de nuevo?';

    const btnText = isVictory ? '▶ Continuar' : '▶ Reintentar';

    const html = `
        <div class="${css.endOverlay}" style="width:${W}px; height:${H}px;">
            <div class="${css.endPanel}">

                <div class="${css.endTitle} ${isVictory ? css.victory : css.gameover}">
                    ${title}
                </div>

                <div class="${css.endMessage}">
                    ${message}
                </div>

                <button id="btn-action" class="${css.endButton}">
                    ${btnText}
                </button>

            </div>
        </div>
    `;

    const dom = scene.add
        .dom(W / 2, H / 2)
        .setOrigin(0.5)
        .setDepth(200)
        .setScrollFactor(0)
        .setScale(1 / ZOOM)
        .createFromHTML(html);

    const root = dom.node as HTMLDivElement;
    const btn = root.querySelector('#btn-action') as HTMLButtonElement;

    btn.onclick = () => {
        const audioManager = scene.registry.get("audioManager");
        audioManager?.playSFX(ASSETS.ui_confirm.key, 0.35);
        dom.destroy();
        onAction();
    };

    // 🔥 teclado (Enter)
    const enterKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    const onKey = () => {
        if (Phaser.Input.Keyboard.JustDown(enterKey)) {
            audioManager?.playSFX(ASSETS.ui_confirm.key, 0.35); // 🔥
            dom.destroy();
            onAction();
            scene.events.off('update', onKey);
        }
    };

    scene.events.on('update', onKey);

    // 🔊 accesibilidad
    announceMessage(title, message + '\n\n' + 'Pulsa enter para ' + btnText);
}