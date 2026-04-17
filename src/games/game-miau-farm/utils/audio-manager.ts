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