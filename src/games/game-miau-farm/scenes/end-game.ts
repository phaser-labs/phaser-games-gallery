import { Scene } from 'phaser';

import { globalState } from '../global-state';
import { EndGameStats } from '../types/types';
import { announce, ASSETS, createAnimations, createFarmBackground } from '../utils';

import css from '../styles/kitty-farm.module.css';

const ZOOM = 3;

export class EndGame extends Scene {

    private player!: Phaser.GameObjects.Sprite;
    private stats!: EndGameStats;
    private endPanel: Phaser.GameObjects.DOMElement | null = null;

    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image;
    gameOverText!: Phaser.GameObjects.Text;


    constructor() {
        super('EndGame');
    }

    init(data: EndGameStats) {
        this.stats = data ?? { chestsOpened: 0, totalChests: 0, harvested: { corn: 0, tomato: 0 } };
    }

    create() {
        createAnimations(this);

        if ("context" in this.sound) {
            const manager = this.sound as Phaser.Sound.WebAudioSoundManager;
            manager.context.resume();
        }

        const audioManager = this.registry.get("audioManager");

        if (!audioManager.isMusicPlaying()) {
            audioManager.playMusic(ASSETS.menu_music.key);
        }

        this.createAudioButtons();

        this.createWorld();
        this.createFarmingPlayer();
        this.showEndGamePanel();
    }

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

    private showEndGamePanel() {
        if (this.endPanel) return; // 🚫 evita duplicados

        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        this.endPanel = this.add.dom(width / 2, height / 2)
            .setOrigin(0.5)
            .setDepth(20)
            .setScrollFactor(0)
            .setScale(1 / ZOOM)
            .createFromHTML(`
                <div class="${css['end-panel']}">
                    <div class="${css.content}">

                        <h2 class="${css.title}">FIN DEL JUEGO</h2>
                        <p class="${css.subtitle}">Tu cosecha ha terminado</p>

                        <div class="${css.cards}">

                            <div class="${css.card}">
                                <div class="${css.cardHeader}">
                                    ⸙ COSECHA
                                </div>
                                <div class="${css.cardValue}" style="display:flex; justify-content:space-around;">
                                   <p>Maiz:  ${this.stats.harvested.corn || 0}</p>
                                   <p>Tomate:  ${this.stats.harvested.tomato || 0}</p>
                                </div>
                            </div>

                            <div class="${css.card}">
                                <div class="${css.cardHeader}">
                                    ⬡ COFRES
                                </div>
                                <div class="${css.cardValue}">
                                    ${this.stats.chestsOpened || 0}
                                </div>
                            </div>
                        </div>

                        <div class="${css.advicesBox}">
                            <div class="${css.cardHeader}">
                                🕮 TEMAS APRENDIDOS
                            </div>

                            <div class="${css.chips}">
                                ${globalState.advices.length > 0
                    ? globalState.advices.map(a => `<span class="${css.chip}">${a.title}</span> `).join('')
                    : `<span class="${css.chip}">Sin temas</span>`
                }
                            </div>
                        </div>
                        <button id="restart" class="${css['modal-btn']}">Reiniciar</button>
                    </div>
                </div>
            `)


        const root = this.endPanel.node as HTMLElement;
        root.style.pointerEvents = 'auto';

        const btn = root.querySelector('#restart') as HTMLButtonElement;
        btn.focus();

        announce(
            'FIN DEL JUEGO' +
            '\nTu cosecha ha terminado' +
            `\nCosecha recolectada: ${this.stats.harvested.corn || 0} + ${this.stats.harvested.tomato || 0}` +
            `\nCofres abiertos: ${this.stats.chestsOpened || 0}` +
            `\nTemas aprendidos: ${globalState.advices.map(a => a.title).join(', ')}` +
            '\n\nPresiona enter para volver al menu principal'
        );
        const audioManager = this.registry.get("audioManager");

        btn.addEventListener('click', (e) => {
            audioManager.playSFX(ASSETS.click_sound.key, 0.3);
            e.stopPropagation();

            this.endPanel?.destroy();
            this.endPanel = null;

            this.scene.start('MainMenu');
        });

        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                audioManager.playSFX(ASSETS.click_sound.key, 0.3);
                e.preventDefault();

                this.endPanel?.destroy();
                this.endPanel = null;

                this.scene.start('MainMenu');
            }
        });
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
}
