// src/game-clues-of-wisdom/utils/MusicManager.ts
import Phaser from 'phaser';

class MusicManager {
  private static instance: MusicManager;
  private music?: Phaser.Sound.BaseSound;
  private currentVolume: number = 1;

  private constructor() {}

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  public play(scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig) {
    if (!this.music) {
      this.music = scene.sound.add(key, { loop: true, volume: this.currentVolume, ...config });
      this.music.play();
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.music) {
      if (this.music instanceof Phaser.Sound.WebAudioSound || this.music instanceof Phaser.Sound.HTML5AudioSound) {
        this.music.setVolume(volume);
      }
    }
  }

  public stop() {
    if (this.music) {
      this.music.stop();
      this.music = undefined;
    }
  }
}

export default MusicManager;