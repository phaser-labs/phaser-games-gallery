import { Scene } from "phaser";

import { ASSETS } from "./game-assets";

export function createAnimations(scene: Scene) {
    const { anims } = scene;

    // ── Player (48×48, 4 cols × 4 rows) ─────────────────────────────────────
    // fila 0 → walk-down  (frames  0-3)
    // fila 1 → walk-up    (frames  4-7)
    // fila 2 → walk-left  (frames  8-11)
    // fila 3 → walk-right (frames 12-15)

    const playerWalk = [
        { key: 'player-walk-down', start: 0, end: 3 },
        { key: 'player-walk-up', start: 4, end: 7 },
        { key: 'player-walk-left', start: 8, end: 11 },
        { key: 'player-walk-right', start: 12, end: 15 },
    ];

    playerWalk.forEach(({ key, start, end }) => {
        if (anims.exists(key)) return;
        anims.create({
            key,
            frames: anims.generateFrameNumbers(ASSETS.player.spritesheet.key, { start, end }),
            frameRate: 8,
            repeat: -1,
        });
    });

    const playerIdle = [
        { key: 'player-idle-down', start: 0, end: 1 },
        { key: 'player-idle-up', start: 4, end: 5 },
        { key: 'player-idle-left', start: 8, end: 9 },
        { key: 'player-idle-right', start: 12, end: 13 },
    ];

    playerIdle.forEach(({ key, start, end }) => {
        if (anims.exists(key)) return;
        anims.create({
            key,
            frames: anims.generateFrameNumbers(ASSETS.player.spritesheet.key, { start: start, end: end }),
            frameRate: 2,
            repeat: -1,
        });
    });

    const playerActions = [
        // ⚔️ espada
        { key: 'player-attack-down', frames: [0, 1] },
        { key: 'player-attack-up', frames: [2, 3] },
        { key: 'player-attack-left', frames: [4, 5] },
        { key: 'player-attack-right', frames: [6, 7] },

        // 🛠️ herramienta
        { key: 'player-tool-down', frames: [8, 9] },
        { key: 'player-tool-up', frames: [10, 11] },
        { key: 'player-tool-left', frames: [12, 13] },
        { key: 'player-tool-right', frames: [14, 15] },

        // 💧 watering
        { key: 'player-water-down', frames: [16, 17] },
        { key: 'player-water-up', frames: [18, 19] },
        { key: 'player-water-left', frames: [20, 21] },
        { key: 'player-water-right', frames: [22, 23] },
    ];

    playerActions.forEach(({ key, frames }) => {
        if (anims.exists(key)) return;

        anims.create({
            key,
            frames: frames.map(frame => ({
                key: ASSETS.player.spritesheetActions.key,
                frame
            })),
            frameRate: 2,
            repeat: 0, // 🔥 MUY IMPORTANTE (no loop)
        });
    });

    // ── Chicken (16×16, 4 cols × 2 rows) ─────────────────────────────────────
    // fila 0 → walk (frames 0-3)
    // fila 1 → idle (frames 4-7)

    if (!anims.exists('chicken-idle')) {
        anims.create({
            key: 'chicken-idle',
            frames: anims.generateFrameNumbers(ASSETS.chicken.spritesheet.key, { start: 0, end: 1 }),
            frameRate: 1,
            repeat: -1,
        });
    }

    if (!anims.exists('chicken-walk')) {
        anims.create({
            key: 'chicken-walk',
            frames: anims.generateFrameNumbers(ASSETS.chicken.spritesheet.key, { start: 4, end: 7 }),
            frameRate: 5,
            repeat: -1,
        });
    }

    // ── Cow (32×32, 3 cols × 2 rows) ─────────────────────────────────────────
    // fila 0 → walk (frames 0-2)
    // fila 1 → idle (frames 3-5)

    if (!anims.exists('cow-idle')) {
        anims.create({
            key: 'cow-idle',
            frames: anims.generateFrameNumbers(ASSETS.cow.spritesheet.key, { start: 0, end: 2 }),
            frameRate: 3,
            repeat: -1,
        });
    }

    if (!anims.exists('cow-walk')) {
        anims.create({
            key: 'cow-walk',
            frames: anims.generateFrameNumbers(ASSETS.cow.spritesheet.key, { start: 3, end: 4 }),
            frameRate: 3,
            repeat: -1,
        });
    }

    // ── Plants (16×16, 6 cols × 2 rows) ──────────────────────────────────────
    // fila 0 → etapas de crecimiento (frames 0-5)
    // fila 1 → variantes             (frames 6-11)

    if (!anims.exists('plant-idle-corn')) {
        anims.create({
            key: 'plant-idle-corn',
            frames: [{ key: ASSETS.plants.spritesheet.key, frame: 0 }],
            frameRate: 1,
        });
    }

    if (!anims.exists('plant-idle-tomato')) {
        anims.create({
            key: 'plant-idle-tomato',
            frames: [{ key: ASSETS.plants.spritesheet.key, frame: 6 }],
            frameRate: 1,
        });
    }

    if (!anims.exists('plant-grow-corn')) {
        anims.create({
            key: 'plant-grow-corn',
            frames: anims.generateFrameNumbers(ASSETS.plants.spritesheet.key, { start: 0, end: 4 }),
            frameRate: 5,
            repeat: 0,
        });
    }

    if (!anims.exists('plant-grow-tomato')) {
        anims.create({
            key: 'plant-grow-tomato',
            frames: anims.generateFrameNumbers(ASSETS.plants.spritesheet.key, { start: 6, end: 10 }),
            frameRate: 5,
            repeat: 0,
        });
    }

    if (!anims.exists('plant-corn')) {
        anims.create({
            key: 'plant-corn',
            frames: [{ key: ASSETS.plants.spritesheet.key, frame: 5 }],
            frameRate: 1,
        });
    }

    if (!anims.exists('plant-tomato')) {
        anims.create({
            key: 'plant-tomato',
            frames: [{ key: ASSETS.plants.spritesheet.key, frame: 11 }],
            frameRate: 1,
        });
    }

    // ── Chest (16×16, 5 cols × 2 row) ──────────────────────────────────────
    // fila 0 → closed front (frames 0-4)
    // fila 1 → side left closed   (frames 5-9)

    if (!anims.exists('chest-idle-front')) {
        anims.create({
            key: 'chest-idle-front',
            frames: [{ key: ASSETS.chest.spritesheet.key, frame: 0 }],
            frameRate: 2,
            repeat: -1,
        });
    }

    if (!anims.exists('chest-open-front')) {
        anims.create({
            key: 'chest-open-front',
            frames: anims.generateFrameNumbers(ASSETS.chest.spritesheet.key, { start: 0, end: 4 }),
            frameRate: 6,
            repeat: 0,
        });
    }

    if (!anims.exists('chest-idle-side')) {
        anims.create({
            key: 'chest-idle-side',
            frames: [{ key: ASSETS.chest.spritesheet.key, frame: 5 }],
            frameRate: 2,
            repeat: -1,
        });
    }

    if (!anims.exists('chest-open-side')) {
        anims.create({
            key: 'chest-open-side',
            frames: anims.generateFrameNumbers(
                ASSETS.chest.spritesheet.key,
                { start: 5, end: 9 }
            ),
            frameRate: 6,
            repeat: 0,
        });
    }
}