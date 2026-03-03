import Phaser from 'phaser';

type AudioManagerOptions = {
  musicKey: string;
  x: number;
  y: number;
  depth?: number;
  volume?: number;
  storageKey?: string;
};

export class AudioManager {
  private scene: Phaser.Scene;
  private dom!: Phaser.GameObjects.DOMElement;
  private btn!: HTMLButtonElement;

  private muted = false;

  private readonly storageKey: string;
  private readonly volume: number;

  private currentMusic?: Phaser.Sound.BaseSound;
  private currentMusicKey?: string;

  constructor(scene: Phaser.Scene, opts: AudioManagerOptions) {
    this.scene = scene;

    this.storageKey = opts.storageKey ?? 'memory_music_muted';
    this.volume = opts.volume ?? 0.3;

    this.initState();
    this.createButton(opts.x, opts.y, opts.depth ?? 100);

    this.playMusic(opts.musicKey);
  }

  /** Cambiar la escena de referencia cuando cambiamos de Scene */
  public attachScene(scene: Phaser.Scene) {
    this.scene = scene;

    // Si ya había música, la recreamos en el sound manager de esta escena
    if (this.currentMusicKey) {
      const key = this.currentMusicKey;
      this.stopMusic();
      this.playMusic(key);
    }
  }

  /** Crear el botón visual en una nueva escena */
  public createButtonInScene(_scene: Phaser.Scene, x: number, y: number, depth: number = 100) {
    // Destruir el botón anterior si existe
    if (this.dom) {
      this.dom.destroy();
    }

    // Crear nuevo botón en la escena actual
    this.createButton(x, y, depth);
  }

  /** Reproducir música (detiene anterior y reproduce nueva) */
  public playMusic(key: string) {
    if (this.currentMusicKey === key && this.currentMusic?.isPlaying) return;

    this.stopMusic();

    const music = this.scene.sound.add(key, { loop: true, volume: this.volume });

    music.play();
    if (this.muted) music.pause();

    this.currentMusic = music;
    this.currentMusicKey = key;
  }

  /** Reproducir un sonido de efecto */
  public play(key: string, config?: Phaser.Types.Sound.SoundConfig & { duration?: number }) {
    if (this.muted) return;

    const { duration, ...soundConfig } = config || {};
    const defaultConfig = { volume: 0.5, ...soundConfig };

    const sound = this.scene.sound.add(key, defaultConfig);
    sound.play();

    // Si se especifica duración, detener después
    if (duration) {
      this.scene.time.delayedCall(duration, () => {
        sound.stop();
        sound.destroy();
      });
    } else {
      // Si no tiene duración, auto-destruir cuando termine de reproducirse
      sound.once('complete', () => {
        sound.destroy();
      });
    }

    return sound;
  }

  /** Alternar entre muted/unmuted */
  public toggle() {
    this.setMuted(!this.muted);
  }

  /** Establecer estado muted */
  public setMuted(value: boolean) {
    this.muted = value;
    localStorage.setItem(this.storageKey, value ? '1' : '0');

    // Controlar música
    if (this.currentMusic) {
      if (value) {
        if (this.currentMusic.isPlaying) this.currentMusic.pause();
      } else {
        this.currentMusic.resume();
      }
    }

    this.syncUI();
  }

  /** Obtener estado actual */
  public isMuted() {
    return this.muted;
  }

  /** Destruir el manager */
  public destroy() {
    this.stopMusic();
    this.dom?.destroy();
  }

  // -------------------
  // Métodos privados
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
        class="memory-audio-button ${this.muted ? 'muted' : 'sound'}"
      >
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

    // Cambiar clases CSS según estado
    this.btn.className = `memory-audio-button ${active ? 'sound' : 'muted'}`;
  }
}
