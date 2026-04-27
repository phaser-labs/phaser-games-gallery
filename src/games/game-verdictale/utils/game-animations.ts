import { Scene } from 'phaser';

import { ASSETS } from './game-assets';

// ─────────────────────────────────────────────────────────────────────────────
// ESTRUCTURA DE SPRITES
//
// Player (Walk / Idle / Attack): 8cols x 8rows de 16x16
//   fila 0 → down   (frames 0-7)
//   fila 1 → left   (frames 8-15)
//   fila 2 → right  (frames 16-23)
//   fila 3 → up     (frames 24-31)
//
// Player Dead: 2cols x 4rows → 8 frames totales
//
// NPCs / Enemigos (4cols x 7rows de 16x16):
//   fila 0 → idle       (frames 0-3)
//   fila 1 → walk-down  (frames 4-7)
//   fila 2 → walk-left  (frames 8-11)
//   fila 3 → walk-right (frames 12-15)
//   fila 4 → walk-up    (frames 16-19)
//   fila 5 → attack     (frames 20-23)
//   fila 6 → dead       (frames 24-27)
//
// Animales (racoon / cat): 2cols x 1row → solo idle 2 frames
// ─────────────────────────────────────────────────────────────────────────────

export function createAnimations(scene: Scene): void {
    const { anims } = scene;

    // ── Player Walk ───────────────────────────────────────────────────────────
    [
        { key: 'player-walk-down', col: 0 },
        { key: 'player-walk-up', col: 1 },
        { key: 'player-walk-left', col: 2 },
        { key: 'player-walk-right', col: 3 },
    ].forEach(({ key, col }) => {
        if (anims.exists(key)) return;
        anims.create({
            key,
            frames: [0, 1, 2, 3].map(row => ({
                key: ASSETS.player.walk.key,
                frame: col + row * 4,
            })),
            frameRate: 8,
            repeat: -1,
        });
    });

    // ── Player Idle ───────────────────────────────────────────────────────────
    [
        { key: 'player-idle-down', col: 0 },
        { key: 'player-idle-up', col: 1 },
        { key: 'player-idle-left', col: 2 },
        { key: 'player-idle-right', col: 3 },
    ].forEach(({ key, col }) => {
        if (anims.exists(key)) return;
        anims.create({
            key,
            frames: [0, 1].map(row => ({
                key: ASSETS.player.idle.key,
                frame: col + row * 4,
            })),
            frameRate: 2,
            repeat: -1,
        });
    });

    // ── Player Attack ─────────────────────────────────────────────────────────
    [
        { key: 'player-attack-down', col: 0 },
        { key: 'player-attack-left', col: 1 },
        { key: 'player-attack-right', col: 2 },
        { key: 'player-attack-up', col: 3 },
    ].forEach(({ key, col }) => {
        if (anims.exists(key)) return;
        anims.create({
            key,
            frames: [0, 1, 2, 3].map(row => ({
                key: ASSETS.player.attack.key,
                frame: col + row * 4,
            })),
            frameRate: 8,
            repeat: 0,
        });
    });

    // ── Player Dead ───────────────────────────────────────────────────────────
    if (!anims.exists('player-dead')) {
        anims.create({
            key: 'player-dead',
            frames: anims.generateFrameNumbers(ASSETS.player.dead.key, { start: 0, end: 7 }),
            frameRate: 4,
            repeat: 0,
        });
    }

    // ── NPCs ──────────────────────────────────────────────────────────────────
    [
        ASSETS.npc.camuflage.key,
        ASSETS.npc.eskimo.key,
        ASSETS.npc.inspector.key,
        ASSETS.npc.princess.key,
        ASSETS.npc.village.key,
    ].forEach(key => createCharacterAnimations(scene, key));

    // ── Enemigos ──────────────────────────────────────────────────────────────
    [
        ASSETS.enemies.skeleton.key,
        ASSETS.enemies.monkey.key,
        ASSETS.enemies.spirit.key,
    ].forEach(key => createCharacterAnimations(scene, key));

    // ── Animales ──────────────────────────────────────────────────────────────
    [ASSETS.animals.cat.key, ASSETS.animals.racoon.key].forEach(key => {
        if (!anims.exists(`${key}-walk-right`)) {
            anims.create({
                key: `${key}-walk-right`,
                frames: anims.generateFrameNumbers(key, { start: 0, end: 1 }),
                frameRate: 4,
                repeat: -1,
            });
        }
    });

    // Dialogo info animation
    if (!anims.exists(`${ASSETS.items.dialog_info.key}-anim`)) {
        anims.create({
            key: `${ASSETS.items.dialog_info.key}-anim`,
            frames: anims.generateFrameNumbers(ASSETS.items.dialog_info.key, { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1,
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — crea las 7 animaciones estándar para NPCs y enemigos
// ─────────────────────────────────────────────────────────────────────────────
function createCharacterAnimations(scene: Scene, key: string): void {
    const { anims } = scene;

    const defs = [
        { suffix: 'walk-down', col: 0, rate: 6, repeat: -1 },
        { suffix: 'walk-up', col: 1, rate: 6, repeat: -1 },
        { suffix: 'walk-left', col: 2, rate: 6, repeat: -1 },
        { suffix: 'walk-right', col: 3, rate: 6, repeat: -1 },
    ];

    defs.forEach(({ suffix, col, rate, repeat }) => {
        const animKey = `${key}-${suffix}`;
        if (anims.exists(animKey)) return;
        anims.create({
            key: animKey,
            frames: [0, 1, 2, 3].map(row => ({
                key: key,
                frame: col + row * 4,
            })),
            frameRate: rate,
            repeat,
        });
    });
}