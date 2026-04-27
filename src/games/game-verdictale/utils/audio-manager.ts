import { announce } from "./announce";
import { ASSETS } from "./game-assets";

import css from '../styles/verdictale.module.css';

export class AudioManager {

    private scene: Phaser.Scene;
    private currentMusic?: Phaser.Sound.BaseSound;

    public musicEnabled = true;
    public sfxEnabled = true;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    playMusic(key: string) {

        if (!this.musicEnabled) return;

        // Si ya existe música
        if (this.currentMusic) {
            if (!this.currentMusic.isPlaying) {
                this.currentMusic.resume(); // 👈 reanuda si estaba pausada
            }
            return;
        }

        this.currentMusic = this.scene.sound.add(key, {
            loop: true,
            volume: 0.1
        });

        this.currentMusic.play();
    }

    stopMusic() {
        this.currentMusic?.stop();
        this.currentMusic = undefined;
    }

    toggleMusic() {

        this.musicEnabled = !this.musicEnabled;

        if (!this.currentMusic) return;

        if (this.musicEnabled) {
            this.currentMusic.resume();
        } else {
            this.currentMusic.pause();
        }
    }

    isMusicPlaying() {
        return this.currentMusic?.isPlaying ?? false;
    }

    playSFX(key: string, volume?: number) {

        const vol = volume ?? 0.7;

        if (!this.sfxEnabled) return;

        this.scene.sound.play(key, { volume: vol });
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
    }
}

export function createAudioButtons(scene: Phaser.Scene, zoom = 1): void {
    const width = scene.scale.gameSize.width;
    const audioManager = scene.registry.get('audioManager');

    const SIZE = 20 / zoom;   // tamaño visual consistente en cualquier zoom
    const PADDING = 10 / zoom;
    const GAP = 8 / zoom;

    // Coordenadas en espacio mundo ajustadas al zoom
    const camera = scene.cameras.main;
    const rightEdge = camera.scrollX + width / zoom;
    const topEdge = camera.scrollY;

    const musicBtn = scene.add.image(
        rightEdge - PADDING - GAP - SIZE,
        topEdge + PADDING,
        ASSETS.items.music.key
    )
        .setOrigin(1.2, 0)
        .setDisplaySize(SIZE, SIZE)
        .setDepth(100)
        .setScrollFactor(0)   // ← fijo en pantalla, ignora cámara
        .setInteractive({ useHandCursor: true });

    const soundBtn = scene.add.image(
        rightEdge - PADDING,
        topEdge + PADDING,
        ASSETS.items.sound.key
    )
        .setOrigin(1, 0)
        .setDisplaySize(SIZE, SIZE)
        .setDepth(100)
        .setScrollFactor(0)   // ← fijo en pantalla
        .setInteractive({ useHandCursor: true });

    const BASE_SCALE = musicBtn.scaleX;

    const updateStyles = () => {
        musicBtn.setAlpha(audioManager.musicEnabled ? 1 : 0.3);
        soundBtn.setAlpha(audioManager.sfxEnabled ? 1 : 0.3);
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

    musicBtn.on('pointerdown', toggleMusic);
    soundBtn.on('pointerdown', toggleSFX);

    // Hover — usa BASE_SCALE para no acumular escala
    [musicBtn, soundBtn].forEach(btn => {
        btn.on('pointerover', () => btn.setScale(BASE_SCALE * 1.2));
        btn.on('pointerout', () => btn.setScale(BASE_SCALE));
    });

    const flashTween = (target: Phaser.GameObjects.Image) => {
        scene.tweens.add({
            targets: target,
            scaleX: BASE_SCALE * 1.3,
            scaleY: BASE_SCALE * 1.3,
            duration: 80,
            yoyo: true,
            onComplete: () => target.setScale(BASE_SCALE)
        });
    };

    const mKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    const sKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    mKey.on('down', () => { toggleMusic(); flashTween(musicBtn); });
    sKey.on('down', () => { toggleSFX(); flashTween(soundBtn); });
}

export function createAudioButtonsOverlay(scene: Phaser.Scene, zoom = 1): void {
    const W = scene.scale.gameSize.width;
    const H = scene.scale.gameSize.height;
    const audioManager = scene.registry.get('audioManager');

    const html = `
        <div class="${css['audio-overlay']}" style="width:${W}px;height:${H}px;">
            <div class="${css['audio-panel']}">

                <button id="music-btn" class="${css['audio-button']}">
                    <img src="assets/game-verdictale/items/Music.png" class="${css['audio-icon']}" />
                </button>

                <button id="sfx-btn" class="${css['audio-button']}">
                    <img src="assets/game-verdictale/items/Sound.png" class="${css['audio-icon']}" />
                </button>

            </div>
        </div>
    `;

    const dom = scene.add
        .dom(W / 2, H / 2)
        .setOrigin(0.5)
        .setDepth(100)
        .setScrollFactor(0)
        .setScale(1 / zoom)
        .createFromHTML(html);

    const musicBtn = dom.node.querySelector('#music-btn') as HTMLButtonElement;
    const sfxBtn = dom.node.querySelector('#sfx-btn') as HTMLButtonElement;

    musicBtn.setAttribute('aria-label', 'Alternar música');
    sfxBtn.setAttribute('aria-label', 'Alternar efectos de sonido');

    // (opcional pero muy recomendado 🔥)
    musicBtn.setAttribute('aria-pressed', String(audioManager.musicEnabled));
    sfxBtn.setAttribute('aria-pressed', String(audioManager.sfxEnabled));

    const updateStyles = () => {
        musicBtn.classList.toggle(css['audio-disabled'], !audioManager.musicEnabled);
        sfxBtn.classList.toggle(css['audio-disabled'], !audioManager.sfxEnabled);

        // 🔥 mantener accesibilidad sincronizada
        musicBtn.setAttribute('aria-pressed', String(audioManager.musicEnabled));
        sfxBtn.setAttribute('aria-pressed', String(audioManager.sfxEnabled));
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

    // Teclado
    const mKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    const sKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    mKey.on('down', toggleMusic);
    sKey.on('down', toggleSFX);
}