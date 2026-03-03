import { Scene } from 'phaser';

import { announce } from '../utils/announce';
import { ASSETS } from '../utils/game-assets';
import { createTiledBackground } from '../utils/tiled-background';

import css from '../styles/tricky.module.css';

const WIDTH = 230;
const HEIGHT = 140;

const CARD_WIDTH = 220;
const CARD_HEIGHT = 130;

const RADIUS = 16;

export class MainMenu extends Scene {

    // =========================
    // DATA
    // =========================

    private blockTypes = [
        {
            type: 'normal',
            pieces: [
                ASSETS.normal.normal_I.key,
                ASSETS.normal.normal_L.key,
                ASSETS.normal.normal_T.key
            ]
        },
        {
            type: 'glass',
            pieces: [
                ASSETS.glass.glass_I.key,
                ASSETS.glass.glass_L.key,
                ASSETS.glass.glass_T.key
            ]
        },
        {
            type: 'stone',
            pieces: [
                ASSETS.stone.stone_I.key,
                ASSETS.stone.stone_L.key,
                ASSETS.stone.stone_T.key
            ]
        }
    ];

    private players = [
        ASSETS.player1,
        ASSETS.player2,
        ASSETS.player3,
        ASSETS.player4
    ];

    private selectedIndex = 0;
    private selectedPlayerIndex = 0;

    private playerCardContainer!: Phaser.GameObjects.Container;
    private playerSprite?: Phaser.GameObjects.Sprite;

    private playerConfirmed = false;
    private blockConfirmed = false;

    private blockDom?: Phaser.GameObjects.DOMElement;
    private playerDom?: Phaser.GameObjects.DOMElement;
    private playButtonDom?: Phaser.GameObjects.DOMElement;

    private playerAura?: Phaser.GameObjects.Graphics;
    private playerFocus?: Phaser.GameObjects.Graphics;

    private blockAura?: Phaser.GameObjects.Graphics;
    private blockFocus?: Phaser.GameObjects.Graphics;

    private playButtonEl?: HTMLButtonElement;

    // Overlay
    private helpDom?: Phaser.GameObjects.DOMElement;
    private helpOverlayEl!: HTMLDivElement;

    constructor() {
        super('MainMenu');
    }

    // =========================
    // CREATE
    // =========================

    create() {
        createTiledBackground(this);
        this.createAnimatedTitle();

        this.createBlockCarousel(this.scale.width, this.scale.height);
        this.createPlayerCarouselPhaser();

        if ("context" in this.sound) {
            const manager = this.sound as Phaser.Sound.WebAudioSoundManager;
            manager.context.resume();
        }

        const audioManager = this.registry.get("audioManager");

        if (!audioManager.isMusicPlaying()) {
            audioManager.playMusic(ASSETS.menu_music.key);
        }

        this.showPlayButton();
        this.setupKeyboardControls();
        this.createAudioButtons();

        this.drawFocus(
            this.playerFocus,
            this.scale.width / 2,
            this.scale.height / 2.8
        );

        this.showSelectionOverlay();
        this.updatePlayButtonState();

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cleanupDom();
        });
    }

    // =========================
    // CLEANUP
    // =========================

    private cleanupDom() {
        // 🔥 RESET TOTAL DEL ESTADO
        this.playerConfirmed = false;
        this.blockConfirmed = false;
        this.selectedIndex = 0;
        this.selectedPlayerIndex = 0;

        this.playerAura?.clear();
        this.blockAura?.clear();
        this.playerFocus?.clear();
        this.blockFocus?.clear();

        this.playButtonDom?.destroy();
        this.blockDom?.destroy();
        this.playerDom?.destroy();
        this.helpDom?.destroy();

        this.playButtonDom = undefined;
        this.blockDom = undefined;
        this.playerDom = undefined;
        this.helpDom = undefined;
    }

    private setupKeyboardControls() {

        const kb = this.input.keyboard!;
        const audioManager = this.registry.get("audioManager");

        kb.on("keydown-LEFT", () => {
            audioManager.playSFX(ASSETS.click_sound.key);

            // PLAYER
            if (!this.playerConfirmed) {
                this.selectedPlayerIndex =
                    (this.selectedPlayerIndex - 1 + this.players.length) %
                    this.players.length;

                this.updatePlayerAnimation("left");
                return;
            }

            // BLOCK
            if (this.playerConfirmed && !this.blockConfirmed) {
                this.selectedIndex =
                    (this.selectedIndex - 1 + this.blockTypes.length) %
                    this.blockTypes.length;

                this.updateBlockTrack();
            }
        });

        kb.on("keydown-RIGHT", () => {
            audioManager.playSFX(ASSETS.click_sound.key);

            if (!this.playerConfirmed) {
                this.selectedPlayerIndex =
                    (this.selectedPlayerIndex + 1) %
                    this.players.length;

                this.updatePlayerAnimation("right");
                return;
            }

            if (this.playerConfirmed && !this.blockConfirmed) {
                this.selectedIndex =
                    (this.selectedIndex + 1) %
                    this.blockTypes.length;

                this.updateBlockTrack();
            }
        });

        kb.on("keydown-SPACE", () => {
            audioManager.playSFX(ASSETS.player_selected.key);
            this.handleConfirm();
        });
    }

    private handleConfirm() {

        // Confirm player primero
        if (!this.playerConfirmed) {
            this.confirmPlayer();
            return;
        }

        // Luego confirm block
        if (this.playerConfirmed && !this.blockConfirmed) {
            this.confirmBlock();
        }
    }

    private updateBlockTrack() {

        if (!this.blockDom) return;

        const container = this.blockDom.node as HTMLElement;
        const track = container.querySelector('#tt-track') as HTMLElement;

        if (!track) return;

        track.style.transform = `translateX(-${this.selectedIndex * CARD_WIDTH}px)`;

        container.querySelectorAll(`.${css['tt-item']}`).forEach((el, i) => {
            el.classList.toggle(css.active, i === this.selectedIndex);
        });

        // 🔵 Mostrar focus solo si está en modo selección
        if (this.playerConfirmed && !this.blockConfirmed) {
            this.drawFocus(
                this.blockFocus,
                this.scale.width / 2,
                this.scale.height / 1.65
            );
        }

        const type = this.blockTypes[this.selectedIndex].type;
        announce(`Bloque tipo ${type}. Presiona Espacio para confirmar.`);
    }

    private createAnimatedTitle() {

        const centerX = this.scale.width / 1.9;
        const baseY = this.scale.height * 0.12;

        const text = "TOWER RUSH";
        const letters = text.split("");

        const colors = [
            "#ff4d4d",
            "#4de2f0",
            "#ffd54a",
            "#91ff57",
            "#ff2fa8",
        ];

        const letterSpacing = 34;

        const startX = centerX - (letters.length * letterSpacing) / 2;

        letters.forEach((char, index) => {

            if (char === " ") return;

            const isTower = index < 5;

            const color = isTower
                ? colors[index % colors.length]
                : "#ff9800";

            const letter = this.add.text(
                startX + index * letterSpacing,
                -100, // empieza arriba
                char,
                {
                    fontFamily: "PixelFont",
                    fontSize: "42px",
                    color,
                    stroke: "#000000",
                    strokeThickness: 4,
                }
            );

            letter.setOrigin(0.5);

            // Glow amarillo detrás
            const glow = this.add.graphics();
            glow.lineStyle(6, 0xffd54a, 0.4);
            glow.strokeRoundedRect(
                letter.x - 20,
                baseY - 28,
                40,
                56,
                8
            );
            glow.setAlpha(0);

            // Animación caída
            this.tweens.add({
                targets: letter,
                y: baseY,
                duration: 600,
                delay: index * 120,
                ease: "Bounce.easeOut",
                onStart: () => {
                    glow.setAlpha(1);
                }
            });
        });
    }

    // ===================================================
    // BLOCK CAROUSEL
    // ===================================================

    private createBlockCarousel(width: number, height: number) {

        const centerX = width / 2;
        const centerY = height / 1.65;

        const radius = 18;

        // 🔥 FONDO estilo player card
        const graphics = this.add.graphics();

        // AURA ATRÁS
        this.blockAura = this.add.graphics();
        this.blockAura.setDepth(15);

        // FOCUS ADELANTE
        this.blockFocus = this.add.graphics();
        this.blockFocus.setDepth(15);

        graphics.fillStyle(0xffffff, 1);
        graphics.fillRoundedRect(centerX - CARD_WIDTH / 2, centerY - CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT, radius);

        // bordes
        graphics.lineStyle(3, 0xff2fa8);
        graphics.strokeRoundedRect(
            centerX - CARD_WIDTH / 2,
            centerY - CARD_HEIGHT / 2,
            CARD_WIDTH,
            CARD_HEIGHT,
            RADIUS
        );

        graphics.setDepth(10);

        // 🔥 DOM encima
        const html = `
            <div class="${css['tt-wrapper']}">
                <div class="${css['tt-arrow']} left" aria-label="Anterior">&lt;</div>
                <div class="${css['tt-viewport']}" style="width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;">
                    <div class="${css['tt-track']}" id="tt-track">
                        ${this.renderBlockTrack()}
                    </div>
                </div>
                <div class="${css['tt-arrow']} right" aria-label="Siguiente">&gt;</div>
            </div>
        `;

        const dom = this.add.dom(centerX + 5, centerY).createFromHTML(html);
        dom.setDepth(200);

        this.blockDom = dom;
        this.setupBlockCarousel(dom);

        // 🔒 BLOQUEADO INICIALMENTE
        const blockElement = dom.node as HTMLElement;
        blockElement.style.pointerEvents = "none";
        blockElement.style.opacity = "0.4";
        blockElement.style.filter = "grayscale(100%)";
    }

    private renderBlockTrack() {
        return this.blockTypes.map((group, index) => {
            const isActive = index === this.selectedIndex ? css.active : '';

            return `
                <div class="${css['tt-item']} ${isActive}">
                ${group.pieces.map(key => `
                    <img src="assets/game-tricky-tower/images/blocks/${key}.png" />
                `).join('')}
                </div>
            `;
        }).join('');
    }

    private setupBlockCarousel(dom: Phaser.GameObjects.DOMElement) {

        const container = dom.node as HTMLElement;

        const update = () => this.updateBlockTrack();

        // Click opcional (si quieres permitir mouse)
        container.querySelectorAll(`.${css['tt-item']}`).forEach((el, i) => {

            el.addEventListener("click", () => {

                if (!this.playerConfirmed || this.blockConfirmed) return;

                this.selectedIndex = i;
                update();

                this.confirmBlock();
            });
        });

        update();
    }

    private confirmBlock() {

        if (this.blockConfirmed) return;

        this.blockConfirmed = true;

        this.registry.set(
            'selectedBlockType',
            this.blockTypes[this.selectedIndex].type
        );

        if (this.blockDom?.node instanceof HTMLElement) {
            this.blockDom.node.style.pointerEvents = "none";
            this.blockDom.node.style.filter = "grayscale(100%)";
        }

        const x = this.scale.width / 2;
        const y = this.scale.height / 1.65;

        // Quitar focus delantero
        this.blockFocus?.clear();

        // Dibujar aura atrás
        this.drawAura(this.blockAura, x, y);
        announce("Bloque confirmado. Presiona Enter para continuar con el juego.");

        if (this.playerConfirmed && this.blockConfirmed) {
            this.focusPlayButton();
        }
        this.updatePlayButtonState();
    }

    // ===================================================
    // PLAYER CAROUSEL
    // ===================================================

    private createPlayerCarouselPhaser() {

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2.8;

        this.playerCardContainer = this.add.container(centerX, centerY);
        const graphics = this.add.graphics();

        // AURA (ATRÁS)
        this.playerAura = this.add.graphics();
        this.playerAura.setDepth(-0);

        // FOCUS (ADELANTE)
        this.playerFocus = this.add.graphics();
        this.playerFocus.setDepth(5);

        // fondo blanco
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRoundedRect(
            -CARD_WIDTH / 2,
            -CARD_HEIGHT / 2,
            CARD_WIDTH,
            CARD_HEIGHT,
            RADIUS
        );

        // bordes
        graphics.lineStyle(3, 0xff2fa8);
        graphics.strokeRoundedRect(
            -CARD_WIDTH / 2,
            -CARD_HEIGHT / 2,
            CARD_WIDTH,
            CARD_HEIGHT,
            RADIUS
        );

        this.playerCardContainer.add(graphics);

        // 🔥 sprite
        this.playerSprite = this.add.sprite(-10, -10, this.players[0].idle.key)
            .setScale(1.3);

        this.playerCardContainer.add(this.playerSprite);

        this.updatePlayerAnimation();

        // 🔥 Flechas DOM para usar clase CSS real
        const arrowsHtml = `
            <div class="${css['tt-wrapper']}" style="position:absolute;">
                <div class="${css['tt-arrow']} left-player">&lt;</div>
                <div style="min-width:${CARD_WIDTH}px; min-height:${CARD_HEIGHT}px"></div>
                <div class="${css['tt-arrow']} right-player">&gt;</div>
            </div>
        `;

        this.playerDom = this.add
            .dom(centerX, centerY - 65)
            .createFromHTML(arrowsHtml);

        this.playerDom.setDepth(10);

        // Confirmar personaje
        this.playerCardContainer.setSize(CARD_WIDTH, CARD_HEIGHT);
        this.playerCardContainer.setInteractive(
            new Phaser.Geom.Rectangle(
                -CARD_WIDTH / 2,
                -CARD_HEIGHT / 2,
                CARD_WIDTH,
                CARD_HEIGHT
            ),
            Phaser.Geom.Rectangle.Contains
        );

        this.playerCardContainer.on("pointerdown", () => {
            this.confirmPlayer();
        });

    }

    private updatePlayerAnimation(direction: "left" | "right" = "right") {

        if (!this.playerSprite) return;

        const player = this.players[this.selectedPlayerIndex];
        const newTexture = player.idle.key;
        const animKey = `player${this.selectedPlayerIndex + 1}-idle`;

        const offset = direction === "right" ? 120 : -120;

        // animación de salida
        this.tweens.add({
            targets: this.playerSprite,
            x: offset,
            alpha: 0,
            duration: 150,
            ease: "Cubic.easeIn",
            onComplete: () => {

                // cambiar textura
                this.playerSprite!.setTexture(newTexture);
                this.playerSprite!.x = -offset;
                this.playerSprite!.alpha = 0;

                this.playerSprite!.play(animKey, true);

                // animación de entrada
                this.tweens.add({
                    targets: this.playerSprite,
                    x: 0,
                    alpha: 1,
                    duration: 200,
                    ease: "Cubic.easeOut"
                });
            }
        });

        announce(`Jugador ${this.selectedPlayerIndex + 1} seleccionado. Presiona Espacio para confirmar.`);
    }

    private confirmPlayer() {

        if (this.playerConfirmed) return;

        this.playerConfirmed = true;

        const x = this.scale.width / 2;
        const y = this.scale.height / 2.8;

        // Quitar focus delantero
        this.playerFocus?.clear();

        // Dibujar aura atrás
        this.drawAura(this.playerAura, x, y);

        this.playerSprite?.setTint(0x888888);

        if (this.playerDom?.node instanceof HTMLElement) {
            this.playerDom.node.classList.add(css.locked);
        }

        this.playerCardContainer.disableInteractive();

        // Activar blocks
        if (this.blockDom?.node instanceof HTMLElement) {
            this.blockDom.node.style.pointerEvents = "auto";
            this.blockDom.node.style.opacity = "1";
            this.blockDom.node.style.filter = "none";
        }

        // Activar focus visual del block
        this.drawFocus(
            this.blockFocus,
            this.scale.width / 2,
            this.scale.height / 1.65
        );
        this.updatePlayButtonState();
        announce("Jugador confirmado. Ahora selecciona el tipo de bloque con las flechas.");
    }

    // ===================================================
    // PLAY BUTTON
    // ===================================================

    private showPlayButton() {

        if (this.playButtonDom) return;

        const html = `
            <div style="text-align:center;">
                <button class="${css['modal-btn']}" role="button" id="play-button">
                    Jugar
                </button>
            </div>
        `;

        this.playButtonDom = this.add
            .dom(this.scale.width / 2, this.scale.height - 115)
            .createFromHTML(html);

        this.playButtonDom.setDepth(3000);

        this.playButtonEl = this.playButtonDom.node.querySelector("#play-button") as HTMLButtonElement;

        this.playButtonEl.onclick = () => {
            const audioManager = this.registry.get("audioManager");
            audioManager.playSFX(ASSETS.click_sound.key);

            if (!this.playerConfirmed || !this.blockConfirmed) {
                announce("Debes confirmar jugador y bloque antes de jugar.");
                return;
            }

            this.startGameFlow();
        };

        this.updatePlayButtonState();

        announce("Presiona el botón Jugar para comenzar el juego una vez que hayas confirmado tu jugador y bloque.");
    }

    private focusPlayButton() {

        if (!this.playButtonEl) return;

        this.playButtonEl.focus();

        // efecto visual opcional
        this.tweens.add({
            targets: this.playButtonDom,
            scale: { from: 1, to: 1.08 },
            duration: 200,
            yoyo: true,
            ease: "Sine.easeInOut"
        });

        announce("Todo listo. Presiona Enter para comenzar el juego.");
    }

    private updatePlayButtonState() {
        if (!this.playButtonEl) return;

        const ready = this.playerConfirmed && this.blockConfirmed;

        this.playButtonEl.disabled = !ready;

        if (!ready) {
            this.playButtonEl.style.filter = "grayscale(100%)";
            this.playButtonEl.style.cursor = "not-allowed";
        } else {
            this.playButtonEl.style.filter = "none";
            this.playButtonEl.style.cursor = "pointer";

            // 🔥 Forzar foco cuando ya está listo
            setTimeout(() => {
                this.playButtonEl?.focus();
            }, 50);
        }
    }

    private createAudioButtons() {

        const audioManager = this.registry.get("audioManager");

        const html = `
            <div style="display:flex; gap:0.6rem;">
                <button id="music-btn" class="${css['audio-btn']}">♫</button>
                <button id="sfx-btn" class="${css['audio-btn']}">♪</button>
            </div>
        `;

        const dom = this.add
            .dom(this.scale.width - 50, 30)
            .createFromHTML(html)
            .setDepth(100);

        const musicBtn = dom.node.querySelector("#music-btn") as HTMLButtonElement;
        const sfxBtn = dom.node.querySelector("#sfx-btn") as HTMLButtonElement;

        const updateStyles = () => {

            // 🎵 MUSIC
            if (audioManager.musicEnabled) {
                musicBtn.style.color = "white";
                musicBtn.style.textDecoration = "none";
                musicBtn.style.filter = "none";
            } else {
                musicBtn.style.filter = "grayscale(100%)";
                musicBtn.style.textDecoration = "line-through";
            }

            // 🔊 SFX
            if (audioManager.sfxEnabled) {
                sfxBtn.style.color = "white";
                sfxBtn.style.textDecoration = "none";
                sfxBtn.style.filter = "none";
            } else {
                sfxBtn.style.filter = "grayscale(100%)";
                sfxBtn.style.textDecoration = "line-through";
            }
        };

        updateStyles();

        musicBtn.onclick = () => {

            audioManager.toggleMusic();
            updateStyles();
            musicBtn.blur();

            if (audioManager.musicEnabled) {
                announce("Música activada.");
            } else {
                announce("Música desactivada.");
            }
        };

        sfxBtn.onclick = () => {
            audioManager.toggleSFX();
            updateStyles();
            musicBtn.blur();

            if (audioManager.sfxEnabled) {
                announce("Efectos sonoros activados.");
            } else {
                announce("Efectos sonoros desactivados.");
            }
        };
    }

    // ===================================================
    // utils para crear glow/focus en player y blocks
    // ===================================================

    private drawFocus(
        graphics: Phaser.GameObjects.Graphics | undefined,
        centerX: number,
        centerY: number
    ) {
        if (!graphics) return;

        graphics.clear();

        graphics.lineStyle(2, 0xffffff, 1);
        graphics.strokeRoundedRect(
            centerX - WIDTH / 2,
            centerY - HEIGHT / 2,
            WIDTH,
            HEIGHT,
            RADIUS
        );
    }

    private drawAura(
        graphics: Phaser.GameObjects.Graphics | undefined,
        centerX: number,
        centerY: number
    ) {
        if (!graphics) return;

        graphics.clear();

        graphics.lineStyle(3, 0xff2fa8, 0.9); // amarillo más fuerte
        graphics.strokeRoundedRect(
            centerX - WIDTH / 2,
            centerY - HEIGHT / 2,
            WIDTH,
            HEIGHT,
            RADIUS + 2
        );

        this.tweens.add({
            targets: graphics,
            alpha: { from: 1, to: 0.3 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    // ===================================================
    // OVERLAY
    // ===================================================
    private showSelectionOverlay() {

        const { width, height } = this.scale;

        this.helpDom = this.add.dom(0, 0)
            .setOrigin(0)
            .setDepth(999999)
            .createFromHTML(`
                <div class="${css['modal-overlay']}" style="width:${width}px;height:${height}px;">
                    <div class="${css['modal-card']}">
                        <div class="${css['modal-title']}">
                            SELECCIÓN
                        </div>
                        <div class="${css['modal-body']}">
                            <p>¡Primero elige tu héroe!</p>
                            <div class="${css['key-row-help']}">
                                <div>
                                    <span class="${css.key}">←</span>
                                    <span class="${css.key}">→</span>
                                </div>
                                <p>Cambiar personaje</p>
                            </div>
                            <div class="${css['key-row-help']}">
                                <span class="${css.key}">ESPACIO</span>
                                <p>Confirmar personaje</p>
                            </div>
                            <br/>
                            <p>Luego escoge el tipo de bloque:</p>
                            <div class="${css['key-row-help']}">
                                <div>
                                    <span class="${css.key}">←</span>
                                    <span class="${css.key}">→</span>
                                </div>
                                <p>Cambiar bloque</p>
                            </div>
                            <div class="${css['key-row-help']}">
                                <span class="${css.key}">ESPACIO</span>
                                <p>Confirmar bloque</p>
                            </div>
                            <br/>
                            <p>Cuando estés listo, presiona <strong>JUGAR</strong></p>
                        </div>
                        <div class="${css['modal-buttons']}">
                            <button id="selection-continue" class="${css['modal-btn']}">
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            `);

        this.helpOverlayEl = this.helpDom.node as HTMLDivElement;

        const btn = this.helpOverlayEl.querySelector("#selection-continue") as HTMLButtonElement;

        btn.focus();

        btn.onclick = () => {
            const audioManager = this.registry.get("audioManager");
            audioManager.playSFX(ASSETS.click_sound.key);

            this.helpDom?.destroy();
            this.setupKeyboardControls();
            announce(
                "Modo selección activado. Usa las flechas para elegir tu personaje."
            );
        };

        announce(
            "Primero elige tu héroe usando las flechas izquierda y derecha. " +
            "Presiona Enter para confirmar el personaje. " +
            "Luego selecciona el tipo de bloque con las flechas y confirma con Enter. " +
            "Finalmente presiona el botón Jugar para continuar. " +
            "De clic en el botón Continuar para cerrar esta ventana y empezar a seleccionar."
        );

        // Bloquear controles mientras está visible
        this.input.keyboard?.removeAllListeners();
    }

    private showGameplayOverlay() {

        const { width, height } = this.scale;

        const dom = this.add.dom(0, 0)
            .setOrigin(0)
            .setDepth(999999)
            .createFromHTML(`
                <div class="${css['modal-overlay']}" style="width:${width}px;height:${height}px;">
                    <div class="${css['modal-card']}">
                        <div class="${css['modal-title']}">
                            CÓMO JUGAR
                        </div>
                        <div class="${css['modal-body']}">
                            <p>🏗 Construye la frase correctamente y mantén tu torre en pie.</p>
                            <div class="${css['key-row']}">
                                <div>
                                    <span class="${css.key}">←</span>
                                    <span class="${css.key}">→</span>
                                </div>
                                <p>Mover pieza</p>
                            </div>
                            <div class="${css['key-row']}">
                                <span class="${css.key}">↓</span>
                                <p>Bajar más rápido</p>
                            </div>
                            <div class="${css['key-row']}">
                                <span class="${css.key}">↑</span>
                                <p>Girar pieza</p>
                            </div>
                            <div class="${css['key-row']}">
                                <span class="${css.key}">Z</span>
                                <p>Girar al revés</p>
                            </div>
                            <div class="${css['key-row']}">
                                <span class="${css.key} key-wide">ESPACIO</span>
                                <p>Caída rápida</p>
                            </div>
                            <br/>
                            <p>⚠ No toques el láser.</p> 
                            <p>No pierdas todas tus vidas.</p>
                        </div>
                        <div class="${css['modal-buttons']}">
                            <button id="start-game" class="${css['modal-btn']}">
                                Comenzar
                            </button>
                        </div>
                    </div>
                </div>
            `);

        const root = dom.node as HTMLDivElement;
        const btn = root.querySelector("#start-game") as HTMLButtonElement;

        btn.focus();

        btn.onclick = () => {
            const audioManager = this.registry.get("audioManager");
            audioManager.playSFX(ASSETS.click_sound.key);

            announce("Comienza el juego. Buena suerte.");

            const player = this.selectedPlayerIndex;
            const block = this.registry.get("selectedBlockType");

            this.scene.stop();
            this.scene.start("GameMain", { player, block });
        };

        announce(
            "Ahora aprenderás cómo jugar. " +
            "Usa las flechas izquierda y derecha para mover la pieza. " +
            "La flecha abajo la baja más rápido. " +
            "La flecha arriba rota la pieza. " +
            "La tecla Z rota en sentido contrario. " +
            "La barra espaciadora hace caída rápida. " +
            "Evita tocar el láser y no pierdas todas tus vidas. " +
            "Haz clic en el botón COMENZAR para empezar a jugar."
        );
    }

    private startGameFlow() {
        this.showGameplayOverlay();
    }
}
