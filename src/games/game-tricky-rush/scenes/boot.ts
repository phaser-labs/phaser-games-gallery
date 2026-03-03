import { Scene } from 'phaser';

import { announce } from '../utils/announce';
import { AudioManager } from '../utils/audio-manager';
import { ASSETS } from '../utils/game-assets';
import { createTiledBackground } from '../utils/tiled-background';

import css from '../styles/tricky.module.css';


export class Boot extends Scene {
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image;
    gameOverText!: Phaser.GameObjects.Text;

    private raysTween!: Phaser.Tweens.Tween;

    constructor() {
        super('Boot');
    }

    // =========================
    // CREATE
    // =========================
    create() {
        createTiledBackground(this);

        this.createAnimatedTitle();

        const burst = this.createBurstCard(
            this.scale.width / 2,
            this.scale.height / 2
        );

        this.raysTween = burst.raysTween;

        let audioManager = this.registry.get("audioManager");

        if (!audioManager) {
            audioManager = new AudioManager(this);
            this.registry.set("audioManager", audioManager);
        }
        audioManager.playMusic(ASSETS.menu_music.key);
        this.createPlayButtonOutside();
        this.createAudioButtons();
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

    // =========================
    // PANEL CENTRAL CON RAYOS
    // =========================

    private createBurstCard(x: number, y: number) {

        const width = 360;
        const height = 260;

        const container = this.add.container(x, y);

        // =========================
        // RAYOS (dibujados en espacio local)
        // =========================

        const rays = this.add.graphics();
        container.add(rays);

        const rayCount = 30;
        const radius = 600;

        for (let i = 0; i < rayCount; i++) {

            const angle1 = (i / rayCount) * Math.PI * 2;
            const angle2 = ((i + 1) / rayCount) * Math.PI * 2;

            rays.fillStyle(0xffffff, i % 2 === 0 ? 0.08 : 0.03);

            rays.beginPath();
            rays.moveTo(0, 0);
            rays.lineTo(
                Math.cos(angle1) * radius,
                Math.sin(angle1) * radius
            );
            rays.lineTo(
                Math.cos(angle2) * radius,
                Math.sin(angle2) * radius
            );
            rays.closePath();
            rays.fillPath();
        }

        // Animación rotación suave
        const raysTween = this.tweens.add({
            targets: rays,
            rotation: Math.PI * 2,
            duration: 25000,
            repeat: -1,
            ease: "Linear",
            paused: true // 👈 empieza detenido
        });

        // =========================
        // Máscara local (CLAVE)
        // =========================

        const maskGraphics = this.add.graphics();

        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRoundedRect(
            x - width / 2,
            y - height / 2,
            width,
            height,
            20
        );

        const mask = maskGraphics.createGeometryMask();
        rays.setMask(mask);

        maskGraphics.setVisible(false);

        // =========================
        // Fondo de la card
        // =========================

        const bg = this.add.graphics();
        bg.fillStyle(0x88c7e8, 1);
        bg.fillRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            20
        );

        container.addAt(bg, 0);

        // Borde
        bg.lineStyle(3, 0xff2fa8);
        bg.strokeRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            20
        );

        // Cover image
        const cover = this.add.image(0, 0, ASSETS.cover.key);
        cover.setDisplaySize(width - 40, height - 40);
        container.add(cover);
        container.setDepth(1000);

        return { container, raysTween };
    }

    // =========================
    // BOTÓN PLAY
    // =========================

    private createPlayButtonOutside() {

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height - 195;

        const html = `
            <div class="playWrapper">
                <button id="bootPlay" class="${css['modal-btn']}" aria-label="Play">
                    ▶
                </button>
            </div>
        `;

        const dom = this.add.dom(centerX, centerY)
            .createFromHTML(html)
            .setDepth(2000);

        const btn = dom.node.querySelector("#bootPlay") as HTMLButtonElement;

        this.tweens.add({
            targets: btn,
            scale: 1.08,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        btn.onclick = () => {
            const audioManager = this.registry.get("audioManager");
            audioManager.playSFX(ASSETS.click_sound.key);

            this.scene.stop();
            this.scene.start("MainMenu");
        };

        btn.addEventListener("mouseenter", () => {
            this.raysTween.resume();  // 🔥 empieza a girar
        });

        btn.addEventListener("mouseleave", () => {
            this.raysTween.pause();   // 🛑 se detiene
        });

        this.input.keyboard?.on("keydown-ENTER", () => {
            const active = document.activeElement as HTMLElement | null;
            // 🔥 Si hay un botón enfocado, NO ejecutar Play
            if (active && active.tagName === "BUTTON") {
                return;
            }
            this.scene.stop();
            this.scene.start("MainMenu");
        });
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
}
