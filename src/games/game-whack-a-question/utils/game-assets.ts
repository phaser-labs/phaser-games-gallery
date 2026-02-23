// game-assets.ts - Helper para cargar assets según el tema
import type Phaser from 'phaser';

import { ThemeType } from '../types/types';

/**
 * Carga todos los assets del tema actual
 */
export function preloadThemeAssets(scene: Phaser.Scene, theme: ThemeType) {
  const basePath = 'assets/game-whack-a-question';
  scene.load.setPath(basePath);

  // 1. Cargar TODAS las imágenes del tema (incluyendo las capas del menú)
  const backgroundImages = theme.assets.images;
  backgroundImages.forEach((img) => {
    scene.load.image(img.name, img.path.replace(`${basePath}/`, ''));
  });

  // 2. Cargar spritesheets del tema
  const spritesheets = theme.assets.spritesheets;
  spritesheets.forEach((sprite) => {
    scene.load.spritesheet(sprite.name, sprite.path.replace(`${basePath}/`, ''), {
      frameWidth: 64,
      frameHeight: 64
    });
  });

  // 3. Cargar tilemaps del tema
  const tilemaps = theme.assets.tileMap;
  tilemaps.forEach((tilemap) => {
    scene.load.tilemapTiledJSON(tilemap.name, tilemap.path.replace(`${basePath}/`, ''));
  });
}

/**
 * Carga assets comunes que no dependen del tema
 */
export function preloadCommonAssets(scene: Phaser.Scene) {
  const basePath = 'assets/game-whack-a-question';
  scene.load.setPath(basePath);

  // Imágenes comunes (NO incluye las capas del menú, están en el tema)
  scene.load.image('container-title', 'images/whackBG.webp');
  scene.load.image('start-button', 'images/cartel-inicio.webp');
  scene.load.image('pause_overlay', 'images/pause_overlay.png');
  scene.load.image('play_overlay', 'images/pause_instruction.png');
  scene.load.image('sound-off', 'images/Speaker-Crossed.png');
  scene.load.image('sound-on', 'images/Speaker-0.png');

  // Spritesheets comunes (martillo)
  scene.load.spritesheet('hammer-hit', 'sprites/cursor-maze.png', {
    frameWidth: 70,
    frameHeight: 70
  });
  scene.load.spritesheet('hammer-swing', 'sprites/animation-maze.png', {
    frameWidth: 320,
    frameHeight: 180
  });

  // Sonidos comunes (efectos)
  scene.load.audio('clic_sound', 'music/fx/Click.wav');
  scene.load.audio('pause_sound', 'music/fx/Pause.wav');
  scene.load.audio('hurt_sound', 'music/fx/hurt-mole.mp3');
  scene.load.audio('wrong_sound', 'music/fx/wrong.wav');
  scene.load.audio('success_sound', 'music/fx/success.mp3');
  scene.load.audio('tick', 'music/fx/Select 1.wav');
  scene.load.audio('win_sound', 'music/fx/win-scene.mp3');
  scene.load.audio('lose_sound', 'music/fx/game-over-scene.mp3');
}

/**
 * Carga la música de ambiente según el tema
 */
export function preloadThemeMusic(scene: Phaser.Scene, theme: ThemeType) {
  const basePath = 'assets/game-whack-a-question';
  scene.load.setPath(basePath);

  // Cargar la música de ambiente del tema actual
  const ambienceSounds = theme.assets.ambiencesSounds;
  ambienceSounds.forEach((sound) => {
    scene.load.audio(sound.name, sound.path.replace(`${basePath}/`, ''));
  });

  // Cargar todas las músicas para poder cambiar entre temas
  scene.load.audio('bg_music-normal', 'music/ambience/normal-game.mp3');
  scene.load.audio('bg_music-beach', 'music/ambience/beach-game.mp3');
  scene.load.audio('bg_music-moon', 'music/ambience/moon-game.mp3');
}
