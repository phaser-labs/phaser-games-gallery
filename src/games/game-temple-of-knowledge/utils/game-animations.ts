// src/utils/game-animations.ts
import { Scene } from "phaser";

import { ASSETS } from "./game-assets";

function ensure(scene: Scene, key: string) {
    return !scene.anims.exists(key);
}

type FrameRangeCfg = {
    cols: number;
    row: number;
    len: number; // cantidad de frames
    frameRate: number;
    repeat: number;
};

function createAnimRange(
    scene: Scene,
    animKey: string,
    sheetKey: string,
    cfg: FrameRangeCfg
) {
    if (!ensure(scene, animKey)) return;

    const start = cfg.row * cfg.cols;
    const end = start + (cfg.len - 1);

    scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(sheetKey, { start, end }),
        frameRate: cfg.frameRate,
        repeat: cfg.repeat,
    });
}

function createAnimFrames(
    scene: Scene,
    animKey: string,
    sheetKey: string,
    frames: number[],
    frameRate: number,
    repeat: number
) {
    if (!ensure(scene, animKey)) return;

    scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(sheetKey, { frames }),
        frameRate,
        repeat,
    });
}

export function createAnimations(scene: Scene) {
    // ----------------------------
    // HERO
    // ----------------------------
    createAnimFrames(scene, "hero_idle", ASSETS.hero.key, [0, 9], 2, -1);

    createAnimRange(scene, "hero_run", ASSETS.hero.key, {
        cols: 8,
        row: 3,
        len: 4,
        frameRate: 6,
        repeat: -1,
    });

    createAnimRange(scene, "hero_jump", ASSETS.hero.key, {
        cols: 8,
        row: 5,
        len: 8,
        frameRate: 6,
        repeat: -1,
    });

    createAnimRange(scene, "hero_attack", ASSETS.hero.key, {
        cols: 8,
        row: 8,
        len: 8,
        frameRate: 14,
        repeat: 0,
    });

    createAnimRange(scene, "hero_hurt", ASSETS.hero.key, {
        cols: 8,
        row: 7,
        len: 8,
        frameRate: 8,
        repeat: 0,
    });

    createAnimRange(scene, "hero_death", ASSETS.hero.key, {
        cols: 8,
        row: 6,
        len: 8,
        frameRate: 3,
        repeat: 0,
    });

    // ----------------------------
    // PLANTS
    // ----------------------------
    type PlantKey = "plant1" | "plant2" | "plant3";
    const PLANTS: PlantKey[] = ["plant1", "plant2", "plant3"];

    const PLANT_CFG = {
        idle: { cols: 4, row: 2, frames: 4, frameRate: 4, repeat: -1 },
        run: { cols: 8, row: 2, len: 8, frameRate: 2, repeat: 0 },
        attack: { cols: 7, row: 2, len: 7, frameRate: 14, repeat: 0 },
        death: { cols: 10, row: 2, len: 10, frameRate: 14, repeat: 0 },
    } as const;

    for (const plant of PLANTS) {
        const p = ASSETS[plant];

        // idle: frames explícitos
        {
            const { cols, row, frames, frameRate, repeat } = PLANT_CFG.idle;
            const start = row * cols;
            const list = Array.from({ length: frames }, (_, i) => start + i);

            createAnimFrames(scene, `${plant}_idle`, p.idle.key, list, frameRate, repeat);
        }

        // run / attack / death: rangos
        createAnimRange(scene, `${plant}_run`, p.run.key, PLANT_CFG.run);
        createAnimRange(scene, `${plant}_attack`, p.attack.key, PLANT_CFG.attack);
        createAnimRange(scene, `${plant}_death`, p.death.key, PLANT_CFG.death);
    }

    // ----------------------------
    // SLIMES
    // ----------------------------
    type SlimeKey = "Slime1" | "Slime2" | "Slime3";
    const SLIMES: SlimeKey[] = ["Slime1", "Slime2", "Slime3"];

    const SLIME_CFG = {
        idle: { cols: 6, row: 2, len: 6, frameRate: 6, repeat: -1 },
        run: { cols: 8, row: 2, len: 8, frameRate: 4, repeat: -1 },
        attack: { cols: 10, row: 2, len: 10, frameRate: 8, repeat: 0 }, // recomendado 0
        attack2: { cols: 11, row: 2, len: 11, frameRate: 8, repeat: 0 }, // recomendado 0
        attack3: { cols: 9, row: 2, len: 9, frameRate: 8, repeat: 0 },
        death: { cols: 10, row: 2, len: 10, frameRate: 8, repeat: 0 }, // recomendado 0
    } as const;

    for (let i = 0; i < SLIMES.length; i++) {
        const slime = SLIMES[i];
        const s = ASSETS[slime];
        const num = i + 1; // slime1..3

        createAnimRange(scene, `slime${num}_idle`, s.idle.key, SLIME_CFG.idle);
        createAnimRange(scene, `slime${num}_run`, s.run.key, SLIME_CFG.run);
        if (num === 3 ) {
            createAnimRange(scene, `slime${num}_attack`, s.attack.key, SLIME_CFG.attack3);
        }else if (num === 2 ) {
            createAnimRange(scene, `slime${num}_attack`, s.attack.key, SLIME_CFG.attack2);
        }else{
            createAnimRange(scene, `slime${num}_attack`, s.attack.key, SLIME_CFG.attack);
        }
        createAnimRange(scene, `slime${num}_death`, s.death.key, SLIME_CFG.death);
    }
}
