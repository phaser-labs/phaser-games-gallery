// src/game/game-assets.ts
import type { Scene } from 'phaser';

import { ThemeType } from '../types/types';

export const ASSETS = {
  trophy: { key: 'trophy', url: 'images/poisons/trophy.png' },

  // ---------------------------
  // Musics
  // ---------------------------
  sound_initial: { key: 'initial', url: 'sounds/the_Journey.mp3' },
  sound_dungeon: { key: 'dungeon', url: 'sounds/dungeon.ogg' },
  sound_bite: { key: 'bite', url: 'sounds/monster_bite.mp3' },
  sound_punch: { key: 'punch', url: 'sounds/punch_hero.mp3' },
  sound_card: { key: 'card', url: 'sounds/card.mp3' },
  sound_over: { key: 'over', url: 'sounds/over.mp3' },
  sound_slime: { key: 'slime', url: 'sounds/slime_attack.mp3' },

  //----------------------------
  // Heroes
  //----------------------------
  hero: {
    key: 'hero',
    url: 'images/characters/AnimationSheet_Character.png',
    frameWidth: 32,
    frameHeight: 32
  },

  //----------------------------
  // Plants
  //----------------------------
  plant1: {
    idle: { key: 'plant1_idle', url: 'images/enemies/Plant1_Idle_full.png', fw: 64, fh: 64 },
    run: { key: 'plant1_run', url: 'images/enemies/Plant1_Run_full.png', fw: 64, fh: 64 },
    attack: { key: 'plant1_attack', url: 'images/enemies/Plant1_Attack_full.png', fw: 64, fh: 64 },
    death: { key: 'plant1_death', url: 'images/enemies/Plant1_Death_full.png', fw: 64, fh: 64 }
  },
  plant2: {
    idle: { key: 'plant2_idle', url: 'images/enemies/Plant2_Idle_full.png', fw: 64, fh: 64 },
    run: { key: 'plant2_run', url: 'images/enemies/Plant2_Run_full.png', fw: 64, fh: 64 },
    attack: { key: 'plant2_attack', url: 'images/enemies/Plant2_Attack_full.png', fw: 64, fh: 64 },
    death: { key: 'plant2_death', url: 'images/enemies/Plant2_Death_full.png', fw: 64, fh: 64 }
  },
  plant3: {
    idle: { key: 'plant3_idle', url: 'images/enemies/Plant3_Idle_full.png', fw: 64, fh: 64 },
    run: { key: 'plant3_run', url: 'images/enemies/Plant3_Run_full.png', fw: 64, fh: 64 },
    attack: { key: 'plant3_attack', url: 'images/enemies/Plant3_Attack_full.png', fw: 64, fh: 64 },
    death: { key: 'plant3_death', url: 'images/enemies/Plant3_Death_full.png', fw: 64, fh: 64 }
  },

  //----------------------------
  // Slimes
  //----------------------------
  Slime1: {
    idle: { key: 'slime1_idle', url: 'images/enemies/Slime1_Idle_full.png', fw: 64, fh: 64 },
    run: { key: 'slime1_run', url: 'images/enemies/Slime1_Walk_full.png', fw: 64, fh: 64 },
    attack: { key: 'slime1_attack', url: 'images/enemies/Slime1_Attack_full.png', fw: 64, fh: 64 },
    death: { key: 'slime1_death', url: 'images/enemies/Slime1_Death_full.png', fw: 64, fh: 64 }
  },
  Slime2: {
    idle: { key: 'slime2_idle', url: 'images/enemies/Slime2_Idle_full.png', fw: 64, fh: 64 },
    run: { key: 'slime2_run', url: 'images/enemies/Slime2_Walk_full.png', fw: 64, fh: 64 },
    attack: { key: 'slime2_attack', url: 'images/enemies/Slime2_Attack_full.png', fw: 64, fh: 64 },
    death: { key: 'slime2_death', url: 'images/enemies/Slime2_Death_full.png', fw: 64, fh: 64 }
  },
  Slime3: {
    idle: { key: 'slime3_idle', url: 'images/enemies/Slime3_Idle_full.png', fw: 64, fh: 64 },
    run: { key: 'slime3_run', url: 'images/enemies/Slime3_Walk_full.png', fw: 64, fh: 64 },
    attack: { key: 'slime3_attack', url: 'images/enemies/Slime3_Attack_full.png', fw: 64, fh: 64 },
    death: { key: 'slime3_death', url: 'images/enemies/Slime3_Death_full.png', fw: 64, fh: 64 }
  },
} as const;

export function preloadAssets(scene: Scene, theme: ThemeType) {
  scene.load.setPath('assets/game-attack');

  // ✅ siempre mismas keys: 'bg' y 'card'
  const bg = theme.assets.images.find(i => i.name === "bg")?.path;
  const card = theme.assets.cardImages[0];

  if (bg) scene.load.image("bg", bg);
  if (card) scene.load.image("card", card);

  scene.load.image(ASSETS.trophy.key, ASSETS.trophy.url);

  //----------------------------
  // Sounds
  //----------------------------
  scene.load.audio(ASSETS.sound_initial.key, ASSETS.sound_initial.url);
  scene.load.audio(ASSETS.sound_dungeon.key, ASSETS.sound_dungeon.url);
  scene.load.audio(ASSETS.sound_bite.key, ASSETS.sound_bite.url);
  scene.load.audio(ASSETS.sound_punch.key, ASSETS.sound_punch.url);
  scene.load.audio(ASSETS.sound_card.key, ASSETS.sound_card.url);
  scene.load.audio(ASSETS.sound_over.key, ASSETS.sound_over.url);
  scene.load.audio(ASSETS.sound_slime.key, ASSETS.sound_slime.url);

  //----------------------------
  // Heroes
  //----------------------------

  scene.load.spritesheet(ASSETS.hero.key, ASSETS.hero.url, {
    frameWidth: ASSETS.hero.frameWidth,
    frameHeight: ASSETS.hero.frameHeight
  });

  //----------------------------
  // Plants
  //----------------------------

  // Plant 1
  scene.load.spritesheet(ASSETS.plant1.idle.key, ASSETS.plant1.idle.url, { frameWidth: ASSETS.plant1.idle.fw, frameHeight: ASSETS.plant1.idle.fh });
  scene.load.spritesheet(ASSETS.plant1.run.key, ASSETS.plant1.run.url, { frameWidth: ASSETS.plant1.run.fw, frameHeight: ASSETS.plant1.run.fh });
  scene.load.spritesheet(ASSETS.plant1.attack.key, ASSETS.plant1.attack.url, { frameWidth: ASSETS.plant1.attack.fw, frameHeight: ASSETS.plant1.attack.fh });
  scene.load.spritesheet(ASSETS.plant1.death.key, ASSETS.plant1.death.url, { frameWidth: ASSETS.plant1.death.fw, frameHeight: ASSETS.plant1.death.fh });

  // Plant 2
  scene.load.spritesheet(ASSETS.plant2.idle.key, ASSETS.plant2.idle.url, { frameWidth: ASSETS.plant2.idle.fw, frameHeight: ASSETS.plant2.idle.fh });
  scene.load.spritesheet(ASSETS.plant2.run.key, ASSETS.plant2.run.url, { frameWidth: ASSETS.plant2.run.fw, frameHeight: ASSETS.plant2.run.fh });
  scene.load.spritesheet(ASSETS.plant2.attack.key, ASSETS.plant2.attack.url, { frameWidth: ASSETS.plant2.attack.fw, frameHeight: ASSETS.plant2.attack.fh });
  scene.load.spritesheet(ASSETS.plant2.death.key, ASSETS.plant2.death.url, { frameWidth: ASSETS.plant2.death.fw, frameHeight: ASSETS.plant2.death.fh });

  // Plant 3
  scene.load.spritesheet(ASSETS.plant3.idle.key, ASSETS.plant3.idle.url, { frameWidth: ASSETS.plant3.idle.fw, frameHeight: ASSETS.plant3.idle.fh });
  scene.load.spritesheet(ASSETS.plant3.run.key, ASSETS.plant3.run.url, { frameWidth: ASSETS.plant3.run.fw, frameHeight: ASSETS.plant3.run.fh });
  scene.load.spritesheet(ASSETS.plant3.attack.key, ASSETS.plant3.attack.url, { frameWidth: ASSETS.plant3.attack.fw, frameHeight: ASSETS.plant3.attack.fh });
  scene.load.spritesheet(ASSETS.plant3.death.key, ASSETS.plant3.death.url, { frameWidth: ASSETS.plant3.death.fw, frameHeight: ASSETS.plant3.death.fh });

  //----------------------------
  // Slimes
  //----------------------------

  // Slime 1
  scene.load.spritesheet(ASSETS.Slime1.idle.key, ASSETS.Slime1.idle.url, { frameWidth: ASSETS.Slime1.idle.fw, frameHeight: ASSETS.Slime1.idle.fh });
  scene.load.spritesheet(ASSETS.Slime1.run.key, ASSETS.Slime1.run.url, { frameWidth: ASSETS.Slime1.run.fw, frameHeight: ASSETS.Slime1.run.fh });
  scene.load.spritesheet(ASSETS.Slime1.attack.key, ASSETS.Slime1.attack.url, { frameWidth: ASSETS.Slime1.attack.fw, frameHeight: ASSETS.Slime1.attack.fh });
  scene.load.spritesheet(ASSETS.Slime1.death.key, ASSETS.Slime1.death.url, { frameWidth: ASSETS.Slime1.death.fw, frameHeight: ASSETS.Slime1.death.fh });

  // Slime 2
  scene.load.spritesheet(ASSETS.Slime2.idle.key, ASSETS.Slime2.idle.url, { frameWidth: ASSETS.Slime2.idle.fw, frameHeight: ASSETS.Slime2.idle.fh });
  scene.load.spritesheet(ASSETS.Slime2.run.key, ASSETS.Slime2.run.url, { frameWidth: ASSETS.Slime2.run.fw, frameHeight: ASSETS.Slime2.run.fh });
  scene.load.spritesheet(ASSETS.Slime2.attack.key, ASSETS.Slime2.attack.url, { frameWidth: ASSETS.Slime2.attack.fw, frameHeight: ASSETS.Slime2.attack.fh });
  scene.load.spritesheet(ASSETS.Slime2.death.key, ASSETS.Slime2.death.url, { frameWidth: ASSETS.Slime2.death.fw, frameHeight: ASSETS.Slime2.death.fh });

  // Slime 3
  scene.load.spritesheet(ASSETS.Slime3.idle.key, ASSETS.Slime3.idle.url, { frameWidth: ASSETS.Slime3.idle.fw, frameHeight: ASSETS.Slime3.idle.fh });
  scene.load.spritesheet(ASSETS.Slime3.run.key, ASSETS.Slime3.run.url, { frameWidth: ASSETS.Slime3.run.fw, frameHeight: ASSETS.Slime3.run.fh });
  scene.load.spritesheet(ASSETS.Slime3.attack.key, ASSETS.Slime3.attack.url, { frameWidth: ASSETS.Slime3.attack.fw, frameHeight: ASSETS.Slime3.attack.fh });
  scene.load.spritesheet(ASSETS.Slime3.death.key, ASSETS.Slime3.death.url, { frameWidth: ASSETS.Slime3.death.fw, frameHeight: ASSETS.Slime3.death.fh });
}
