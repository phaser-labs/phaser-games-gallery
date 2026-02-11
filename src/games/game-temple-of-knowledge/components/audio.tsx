import Phaser from 'phaser';

import { announce } from '../utils/announce';

type Options = {
  musicKey: string;
  x: number;
  y: number;
  depth?: number;

  cssButtonMusic: string;
  cssButtonMusicMuted?: string;

  volume?: number;
  storageKey?: string;
};

export class Audio {
  private scene: Phaser.Scene;
  private dom!: Phaser.GameObjects.DOMElement;
  private btn!: HTMLButtonElement;

  private muted = false;

  private readonly storageKey: string;
  private readonly cssButtonMusic: string;
  private readonly cssButtonMusicMuted?: string;
  private readonly volume: number;

  private currentMusic?: Phaser.Sound.BaseSound;
  private currentMusicKey?: string;

  constructor(scene: Phaser.Scene, opts: Options) {
    this.scene = scene;

    this.storageKey = opts.storageKey ?? 'mm_music_muted';
    this.cssButtonMusic = opts.cssButtonMusic;
    this.cssButtonMusicMuted = opts.cssButtonMusicMuted;
    this.volume = opts.volume ?? 0.1;

    this.initState();
    this.createButton(opts.x, opts.y, opts.depth ?? 100000);
    this.syncUI();

    this.playMusic(opts.musicKey);
  }

  /** ✅ En cada Scene nueva, solo cambia la referencia */
  public attachScene(scene: Phaser.Scene) {
    this.scene = scene;

    // Si ya había música elegida, la recreamos en el sound manager de esta escena
    if (this.currentMusicKey) {
      const key = this.currentMusicKey;
      this.stopMusic();
      this.playMusic(key);
    }
  }

  /** ✅ Cambia música (detiene anterior y reproduce nueva) */
  public playMusic(key: string) {
    if (this.currentMusicKey === key && this.currentMusic?.isPlaying) return;

    this.stopMusic();

    const music = this.scene.sound.add(key, { loop: true, volume: this.volume });

    // Si está muteado, NO la dejes sonando: la pausas apenas inicia
    music.play();
    if (this.muted) music.pause();

    this.currentMusic = music;
    this.currentMusicKey = key;
  }

  public toggle() {
    this.setMuted(!this.muted);
    announce(this.muted ? 'Música desactivada' : 'Música activada');
  }

  public setMuted(value: boolean) {
    this.muted = value;
    localStorage.setItem(this.storageKey, value ? '1' : '0');

    // ✅ SOLO música (no SFX)
    if (this.currentMusic) {
      if (value) {
        // mute => pausa la canción
        if (this.currentMusic.isPlaying) this.currentMusic.pause();
      } else {
        // unmute => reanuda
        this.currentMusic.resume();
      }
    }

    this.syncUI();
  }

  public isMuted() {
    return this.muted;
  }

  public destroy() {
    this.stopMusic();
    this.dom?.destroy();
  }

  // -------------------

  private initState() {
    this.muted = localStorage.getItem(this.storageKey) === '1';
  }

  private stopMusic() {
    if (!this.currentMusic) return;
    this.currentMusic.stop();
    this.currentMusic.destroy();
    this.currentMusic = undefined;
  }

  private createButton(x: number, y: number, depth: number) {
    const label = this.muted ? 'Activar audio' : 'Silenciar audio';

    this.dom = this.scene.add.dom(x, y).setDepth(depth).createFromHTML(`
      <button
        type="button"
        aria-label="${label}"
        aria-pressed="${!this.muted}"
        title="${label}"
        class="${this.cssButtonMusic}"
        data-muted="${this.muted}"
      >
        <span>♫</span>
      </button>
    `);

    const root = this.dom.node as HTMLElement;
    const btn = root.querySelector('button');
    if (!btn) throw new Error('Audio button not found');

    this.btn = btn as HTMLButtonElement;

    this.btn.addEventListener('click', () => this.toggle());
    this.btn.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  private syncUI() {
    const active = !this.muted;
    const label = active ? 'Silenciar audio' : 'Activar audio';

    this.btn.setAttribute('aria-label', label);
    this.btn.setAttribute('title', label);
    this.btn.setAttribute('aria-pressed', String(active));
    this.btn.dataset.muted = String(this.muted);

    this.btn.className = active ? this.cssButtonMusic : (this.cssButtonMusicMuted ?? this.cssButtonMusic);
  }
}
