import Phaser from 'phaser';

// ─────────────────────────────────────────────────────────────
//  SOUNDS — claves de assets y manager de sonidos del juego
// ─────────────────────────────────────────────────────────────

// Claves de audio — deben coincidir con las del preload
export const SOUND_KEYS = {
  BALL_HIT: 'sfx_ball_hit', // bola blanca golpea ball1
  POCKET: 'sfx_pocket', // bola cae en tronera
  CUEHITBALL: 'sfx_cue_hit_ball', // cue golpea bola blanca
  CORRECT: 'sfx_correct', // respuesta correcta
  INCORRECT: 'sfx_incorrect', // respuesta incorrecta
  CUSHION: 'sfx_cushion',
  FAULD: 'sfx_fauld'
} as const;

// Rutas de los archivos de audio
export const SOUND_PATHS: Record<keyof typeof SOUND_KEYS, string> = {
  BALL_HIT: 'assets/audios/ball_hit.mp3',
  CUEHITBALL: 'assets/audios/cue_hit.mp3',
  POCKET: 'assets/audios/pocket.mp3',
  CORRECT: 'assets/audios/correct.mp3',
  INCORRECT: 'assets/audios/incorrect.mp3',
  CUSHION: 'assets/audios/cushion.mp3',
  FAULD: 'assets/audios/fauld.mp3'
};


// ─────────────────────────────────────────────────────────────
//  SoundManager — instancia única por escena
// ─────────────────────────────────────────────────────────────
export class SoundManager {
  private scene: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private muted = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Carga todos los assets de audio — llamar en preload() */
  // static preload(scene: Phaser.Scene): void {
  //   Object.entries(SOUND_PATHS).forEach(([key, path]) => {
  //     scene.load.audio(SOUND_KEYS[key as keyof typeof SOUND_KEYS], path);
  //   });
  // }

  /** Inicializa los objetos de sonido — llamar en create() */
  init(): void {
    Object.values(SOUND_KEYS).forEach((key) => {
      this.sounds.set(key, this.scene.sound.add(key, { volume: 0.6 }));
    });
  }

  /** Reproduce un sonido por su clave */
  // ✅ así debe estar
  play(key: string, volumeOverride?: number): void {
    if (this.muted) return; // ← esta línea falta
    const sound = this.sounds.get(key);
    if (!sound) return;
    if (volumeOverride !== undefined) {
      (sound as Phaser.Sound.WebAudioSound).setVolume(volumeOverride);
    }
    sound.play();
  }
  toggleMute(): boolean {
    this.muted = !this.muted;
    // Detener todo lo que esté sonando al silenciar
    if (this.muted) this.sounds.forEach((s) => s.stop());
    return this.muted; // retorna el nuevo estado para actualizar el botón
  }
  isMuted(): boolean {
    return this.muted;
  }

  /** Detiene todos los sonidos */
  stopAll(): void {
    this.sounds.forEach((s) => s.stop());
  }
}
