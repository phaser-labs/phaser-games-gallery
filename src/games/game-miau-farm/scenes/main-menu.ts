import { GameObjects, Scene } from 'phaser';

import { announce, ASSETS, createAnimations } from '../utils';
import { AudioManager } from '../utils/audio-manager';
import { createFarmBackground } from '../utils/tiled-background';

import css from '../styles/kitty-farm.module.css';

const ZOOM = 3;

type MenuItem = {
    zone: Phaser.GameObjects.Zone;
    board: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
    shadow: Phaser.GameObjects.Image;
    action: () => void;
};

export class MainMenu extends Scene {
    private player!: Phaser.GameObjects.Sprite;

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private enterKey!: Phaser.Input.Keyboard.Key;

    private menuItems: MenuItem[] = [];
    private selectedIndex = 0;

    private isModalOpen = false;

    background!: GameObjects.Image;
    logo!: GameObjects.Image;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.isModalOpen = false;  // Reset al recrear la escena
        this.menuItems = [];       // Limpiar items anteriores
        this.selectedIndex = 0;


        createAnimations(this);
        this.createWorld();
        this.createFarmingPlayer();
        this.createLogo();
        this.createMenuButtons();

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        let audioManager = this.registry.get("audioManager");

        if (!audioManager) {
            audioManager = new AudioManager(this);
            this.registry.set("audioManager", audioManager);
        }
        audioManager.playMusic(ASSETS.menu_music.key);
        this.createAudioButtons();

        this.selectedIndex = 0;
        this.updateSelection();
    }

    // =============================================================
    // CREATE WORLD
    // =============================================================

    private createWorld() {
        const { map, layers } = createFarmBackground(this);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setZoom(ZOOM);
        this.cameras.main.scrollX = 2000;
        this.cameras.main.scrollY =
            map.heightInPixels - this.cameras.main.height / ZOOM;

        const waterLayer = layers['water'];
        if (waterLayer) {
            this.tweens.add({
                targets: waterLayer,
                x: '+=2',
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        }
    }

    private createFarmingPlayer() {
        this.player = this.add
            .sprite(540, 620, ASSETS.player.spritesheetActions.key)
            .setOrigin(0.5, 0.8)
            .setDepth(1000);

        this.player.play('player-attack-left', true);

        this.events.on('update', () => {
            if (!this.player.anims.isPlaying) {
                this.player.anims.play('player-water-left', true);
            }
        });
    }

    private createLogo() {
        this.logo = this.add
            .image(this.scale.width / 2, this.scale.height / 2, ASSETS.title.key)
            .setScrollFactor(0)
            .setScale(0.7 / ZOOM)
            .setDepth(20);
    }

    private createMenuButtons() {
        const cx = this.scale.width / 2;
        const baseY = this.scale.height - 265;
        const gap = 30;

        this.createPlayButton(cx, baseY);
        this.createControlsButton(cx, baseY + gap);
    }

    // =============================================================
    // CREATE MENU BUTTONS
    // =============================================================

    private createPlayButton(x: number, y: number) {
        const scale = 1 / ZOOM;

        const shadow = this.add
            .image(x + 4, y + 2.5, ASSETS.board.start.key)
            .setScrollFactor(0).setDepth(18).setScale(scale)
            .setTint(0x000000).setAlpha(0.2);

        const board = this.add
            .image(x, y, ASSETS.board.start.key)
            .setScrollFactor(0).setDepth(19).setScale(scale);

        const text = this.add
            .text(0, 0, 'JUGAR', {
                fontFamily: 'PixelFont',
                fontSize: 40,
                color: '#7a5c3a',
                resolution: 2,
            })
            .setOrigin(0.5, 0.8)
            .setScrollFactor(0).setDepth(20).setScale(scale);

        Phaser.Display.Align.In.Center(text, board);
        text.y += 2;

        const zone = this.add
            .zone(board.x, board.y, board.displayWidth, board.displayHeight)
            .setScrollFactor(0).setDepth(21)
            .setInteractive({ useHandCursor: true });

        const action = () => this.showPlayOverlay();

        zone.on('pointerover', () => {
            board.setScale(scale * 1.1);
            text.setScale(scale * 1.1);
            shadow.setScale(scale * 1.1);
        });
        zone.on('pointerout', () => {
            board.setScale(scale);
            text.setScale(scale);
            shadow.setScale(scale);
        });
        zone.on('pointerup', () => {
            const audioManager = this.registry.get("audioManager");
            audioManager.playSFX(ASSETS.click_sound.key, 0.3);

            this.showPlayOverlay()
        });

        this.menuItems.push({ zone, board, text, shadow, action });
    }

    private createControlsButton(x: number, y: number) {
        const scale = 1 / ZOOM;

        const shadow = this.add
            .image(x + 18, y + 2, ASSETS.board.controls.key)
            .setScrollFactor(0).setDepth(17).setScale(scale)
            .setTint(0x000000).setAlpha(0.2);

        const board = this.add
            .image(x + 15, y - 3, ASSETS.board.controls.key)
            .setScrollFactor(0).setDepth(18).setScale(scale);

        const text = this.add
            .text(0, 0, 'CONTROLES', {
                fontFamily: 'PixelFont',
                fontSize: 30,
                color: '#ffffff',
                resolution: 2,
            })
            .setOrigin(0.5, 0.75)
            .setScrollFactor(0).setDepth(19).setScale(scale);

        Phaser.Display.Align.In.Center(text, board);
        text.y += 1;

        const zone = this.add
            .zone(board.x, board.y, board.displayWidth, board.displayHeight)
            .setScrollFactor(0).setDepth(20)
            .setInteractive({ useHandCursor: true });

        const action = () => this.showControlsOverlay();

        zone.on('pointerover', () => {
            board.setScale(scale * 1.1);
            text.setScale(scale * 1.1);
            shadow.setScale(scale * 1.1);
        });
        zone.on('pointerout', () => {
            board.setScale(scale);
            text.setScale(scale);
            shadow.setScale(scale);
        });
        zone.on('pointerup', () => {
            const audioManager = this.registry.get("audioManager");
            audioManager.playSFX(ASSETS.click_sound.key, 0.3);

            this.showControlsOverlay()
        });


        this.menuItems.push({ zone, board, text, shadow, action });
    }

    // ===================================================
    // MUSIC BUTTON
    // ===================================================
    private createAudioButtons() {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        const audioManager = this.registry.get("audioManager");

        const html = `
            <div style="display:flex; gap:0.6rem;">
                <button id="music-btn" class="${css['audio-btn']}">♫</button>
                <button id="sfx-btn" class="${css['audio-btn']}">♪</button>
            </div>
        `;

        const dom = this.add
            .dom(width / 1.55, height / 2.8)
            .setDepth(50)
            .setScrollFactor(0)
            .setScale(1 / ZOOM)
            .createFromHTML(html)
            .setDepth(100);

        const musicBtn = dom.node.querySelector("#music-btn") as HTMLButtonElement;
        const sfxBtn = dom.node.querySelector("#sfx-btn") as HTMLButtonElement;

        // 🔥 habilitar foco por teclado
        musicBtn.tabIndex = 0;
        sfxBtn.tabIndex = 0;

        const updateStyles = () => {

            // 🎵 MUSIC
            if (audioManager.musicEnabled) {
                musicBtn.style.textDecoration = "none";
                musicBtn.style.opacity = "1";
            } else {
                musicBtn.style.opacity = "0.6";
                musicBtn.style.textDecoration = "line-through";
            }

            // 🔊 SFX
            if (audioManager.sfxEnabled) {
                sfxBtn.style.textDecoration = "none";
                sfxBtn.style.opacity = "1";
            } else {
                sfxBtn.style.opacity = "0.6";
                sfxBtn.style.textDecoration = "line-through";
            }
        };

        updateStyles();

        const toggleMusic = () => {
            audioManager.toggleMusic();
            updateStyles();
            announce(audioManager.musicEnabled ? 'Música activada.' : 'Música desactivada.');
        };

        const toggleSFX = () => {
            audioManager.toggleSFX();
            updateStyles();
            announce(audioManager.sfxEnabled ? 'Efectos sonoros activados.' : 'Efectos sonoros desactivados.');
        };

        musicBtn.onclick = () => { toggleMusic(); musicBtn.blur(); };
        sfxBtn.onclick = () => { toggleSFX(); sfxBtn.blur(); };

        musicBtn.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === ' ') {
                e.preventDefault();
                toggleMusic();
            }
        });

        sfxBtn.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === ' ') {
                e.preventDefault();
                toggleSFX();
            }
        });
    }

    // =============================================================
    // CREATE MODAL
    // ==============================================================

    private createModal(htmlContent: string, onConfirm: () => void) {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        const dom = this.add
            .dom(width / 2, height / 2)
            .setOrigin(0.5)
            .setDepth(50)
            .setScrollFactor(0)
            .setScale(1 / ZOOM)
            .createFromHTML(htmlContent);

        this.input.enabled = false;

        const root = dom.node as HTMLElement;
        root.tabIndex = 0;
        root.focus();

        const card = root.querySelector(`.${css['modal-body']}`) as HTMLElement;

        // 🔥 scroll teclado reutilizable
        const handleScroll = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                card.scrollTop += 40;
                e.preventDefault();
            }
            if (e.key === 'ArrowUp') {
                card.scrollTop -= 40;
                e.preventDefault();
            }
        };

        root.addEventListener('keydown', handleScroll);

        const btn = root.querySelector('button') as HTMLButtonElement;

        btn.focus();

        const close = () => {
            dom.destroy();
            this.input.enabled = true;
            onConfirm();
        };

        const audioManager = this.registry.get("audioManager");

        btn.onclick = () => {
            audioManager.playSFX(ASSETS.click_sound.key, 0.3);
            close()
        };

        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                audioManager.playSFX(ASSETS.click_sound.key, 0.3);
                e.preventDefault();
                close();
            }
        });

        return dom;
    }

    private showPlayOverlay() {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        const cOverlay = css['modal-overlay'];
        const cCard = css['modal-card'];
        const cContent = css['modal-content'];
        const cTitle = css['modal-title'];
        const cBody = css['modal-body'];
        const cBtn = css['modal-btn'];

        const html = `
            <div class="${cOverlay}" style="width:${width}px; height:${height}px;">
                <div class="${cCard}">
                    <div class="${cContent}">
                        <div class="${cTitle}">
                            <h1>MIAU FARM ₍^. .^₎Ⳋ</h1>
                        </div>
                        <h2>¡Bienvenido a Miau Farm!</h2>
                        <div id="modal-body" class="${cBody}" tabindex="0">
                            <div class="${css.cardsModal}">
                                <div class="${css.cardModal}">
                                    <div class="${css.cardText}">
                                    <h3>TU MISIÓN</h3>
                                    <p>Explorar el mapa, abrir cofres y aprender. Cada cofre contiene sabiduria.</p>
                                    </div>
                                </div>

                                <div class="${css.cardModal}">
                                    <div class="${css.cardText}">
                                    <h3>PLANTAR <span class="${css.keyModal}">E</span></h3>
                                    <p>Abre el inventario, selecciona una semilla y haz clic en una parcela.</p>
                                    </div>
                                </div>

                                <div class="${css.cardModal}">
                                    <div class="${css.cardText}">
                                    <h3>REGAR <span class="${css.keyModal}">R</span></h3>
                                    <p>Haz clic en la planta o presiona la tecla frente a ella.</p>
                                    </div>
                                </div>

                                <div class="${css.cardModal}">
                                    <div class="${css.cardText}">
                                        <h3>COSECHAR <span class="${css.keyModal}">R</span></h3>
                                        <p>Cuando esté lista, haz clic o presiona la tecla para cosechar.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button id="mm-start" class="${cBtn}">¡Empezar!</button>
                    </div>
                </div>
            </div>
         `;

        announce(
            'Bienvenido a Miau Farm. ' +
            'Tu misión es explorar el mapa, abrir cofres y aprender, cada cofre contiene sabiduria. ' +
            'Para plantar presiona la tecla "E". Para regar presiona la tecla "R". Para cosechar presiona la tecla "R". ' +
            'Haz clic en empezar para iniciar tu aventura.'
        );

        this.createModal(html, () => {
            this.scene.stop('MainMenu');
            this.scene.start('Game');
        });
    }

    private showControlsOverlay() {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        const cOverlay = css['modal-overlay'];
        const cCard = css['modal-card'];
        const cTitle = css['modal-title'];
        const cBody = css['modal-body'];
        const cContent = css['modal-content'];
        const cBtn = css['modal-btn'];
        const cKeyRow = css['key-row'];
        const cKey = css.key;

        const html = `
            <div class="${cOverlay}" style="width:${width}px; height:${height}px;">
                <div class="${cCard}">
                    <div class="${cContent}">
                        <div class="${cTitle}"><h1>CONTROLES</h1></div>
                        <div class="${cBody}">
                            <div class="${cKeyRow}">
                                <div style="display:flex; flex-direction:column; align-items:center; gap:4px; margin-bottom:8px;">
                                    <div style="display:flex; justify-content:center;">
                                        <span class="${cKey}">↑</span>
                                    </div>
                                    <div style="display:flex; gap:4px;">
                                        <span class="${cKey}">←</span>
                                        <span class="${cKey}">↓</span>
                                        <span class="${cKey}">→</span>
                                    </div>
                                </div>
                                <p style="text-align:center; margin-bottom:12px;">Mover personaje</p>
                            </div>

                            <div class="${cKeyRow}">
                                <span class="${cKey}">ESPACIO</span>
                                <p>Abrir cofre</p>
                            </div>

                            <div class="${cKeyRow}">
                                <span class="${cKey}">E</span>
                                <p>Abrir/cerrar inventario</p>
                            </div>

                            <div class="${cKeyRow}">
                                <span class="${cKey}">R</span>
                                <p>Plantar / regar / cosechar</p>
                            </div>

                            <div class="${cKeyRow}">
                                <div>
                                    <span class="${cKey}">1</span> |
                                    <span class="${cKey}">2</span>
                                </div>
                                <p>Seleccionar semilla</p>
                            </div>
                        </div>
                        <button id="mm-close" class="${cBtn}">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

        announce(
            'Controles del juego. Usa las flechas para moverte. ' +
            'Presiona la tecla "ESPACIO" para abrir cofres. ' +
            'Presiona la tecla "E" para abrir/cerrar el inventario. ' +
            'Presiona la tecla "R" para plantar, regar o cosechar. ' +
            'Presiona la tecla "1" o "2" para seleccionar una semilla.' +
            'Da click en cerrar para salir.'
        );

        this.createModal(html, () => { });
    }

    private updateSelection() {
        this.menuItems.forEach((item, index) => {
            const scale = index === this.selectedIndex ? 1.1 : 1;

            item.board.setScale((1 / ZOOM) * scale);
            item.text.setScale((1 / ZOOM) * scale);
            item.shadow.setScale((1 / ZOOM) * scale);
        });
    }

    update() {
        if (this.isModalOpen) return;

        if (!this.menuItems.length) return;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
            const audioManager = this.registry.get("audioManager");
            audioManager.playSFX(ASSETS.click_sound.key, 0.3);
            this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
            this.updateSelection();
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
            const audioManager = this.registry.get("audioManager");
            audioManager.playSFX(ASSETS.click_sound.key, 0.3);
            this.selectedIndex =
                (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;
            this.updateSelection();
        }

        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            const audioManager = this.registry.get("audioManager");
            audioManager.playSFX(ASSETS.click_sound.key, 0.3);

            const item = this.menuItems[this.selectedIndex];
            item.action(); // 🔥 aquí sí funciona siempre
        }
    }
}