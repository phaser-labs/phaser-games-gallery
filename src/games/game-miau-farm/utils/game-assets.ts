import { Scene } from "phaser";

export const ASSETS = {
    // ── Titulo  ─────────────────────────────────────────────────────────────
    title: {
        key: 'title',
        path: 'background/cover.png',
    },

    board: {
        start: {
            key: 'start',
            path: 'plants/board_wood.png',
        },
        controls:{
            key: 'controls',
            path: 'plants/board_wood2.png',
        }
    },

    // ── Personaje principal ──────────────────────────────────────────────────
    player: {
        spritesheet: {
            key: 'player',
            path: 'characters/Basic Charakter Spritesheet.png',
            fw: 48,
            fh: 48,
        },
        spritesheetActions: {
            key: 'player_actions',
            path: 'characters/Basic Charakter Actions.png',
            fw: 48,
            fh: 48,
        }
    },

    // ── NPCs ─────────────────────────────────────────────────────────────────
    chicken: {
        spritesheet: {
            key: 'chicken',
            path: 'characters/Free Chicken Sprites.png',
            fw: 16,
            fh: 16,
        },
    },

    cow: {
        spritesheet: {
            key: 'cow',
            path: 'characters/Free Cow Sprites.png',
            fw: 32,
            fh: 32,
        },
    },

    // ── Objetos ───────────────────────────────────────────────────────────────
    egg: {
        spritesheet: {
            key: 'egg',
            path: 'characters/Egg_And_Nest.png',
            fw: 16,
            fh: 16,
        },
    },

    plants: {
        spritesheet: {
            key: 'plants',
            path: 'plants/Basic Plants.png',
            fw: 16,
            fh: 16,
        },
    },

    // ── chest ───────────────────────────────────────────────────────────────
    chest: {
        spritesheet: {
            key: 'chest',
            path: 'characters/chest.png',
            fw: 48,
            fh: 48,
        },
        image: {
            key: 'chest_img',
            path: 'plants/chest_only.png',
        }
    },

    // ── Sounds ───────────────────────────────────────────────────────────────
    menu_music: { key: 'menu_music', path: 'sounds/menu-music.mp3' },
    click_sound: { key: 'click_sound', path: 'sounds/click-sound.wav' },
    collect_item: { key: 'collect_item', path: 'sounds/collect-item.mp3' },
    watering: { key: 'watering', path: 'sounds/watering.wav' },
    plant : { key: 'plant', path: 'sounds/plant.mp3' },
    footsteps: { key: 'footsteps', path: 'sounds/footsteps.wav' },
    chest_open: { key: 'chest', path: 'sounds/chest.mp3' },

} as const;

export function preloadAssets(scene: Scene) {
    scene.load.setPath('assets/game-kitty-farmer');

    scene.load.image(ASSETS.title.key, ASSETS.title.path);

    scene.load.image(ASSETS.board.start.key, ASSETS.board.start.path);
    scene.load.image(ASSETS.board.controls.key, ASSETS.board.controls.path);

    scene.load.spritesheet(
        ASSETS.player.spritesheet.key,
        ASSETS.player.spritesheet.path,
        { frameWidth: ASSETS.player.spritesheet.fw, frameHeight: ASSETS.player.spritesheet.fh }
    );

    scene.load.spritesheet(
        ASSETS.player.spritesheetActions.key,
        ASSETS.player.spritesheetActions.path,
        { frameWidth: ASSETS.player.spritesheetActions.fw, frameHeight: ASSETS.player.spritesheetActions.fh }
    );

    scene.load.spritesheet(
        ASSETS.chicken.spritesheet.key,
        ASSETS.chicken.spritesheet.path,
        { frameWidth: ASSETS.chicken.spritesheet.fw, frameHeight: ASSETS.chicken.spritesheet.fh }
    );

    scene.load.spritesheet(
        ASSETS.cow.spritesheet.key,
        ASSETS.cow.spritesheet.path,
        { frameWidth: ASSETS.cow.spritesheet.fw, frameHeight: ASSETS.cow.spritesheet.fh }
    );

    scene.load.spritesheet(
        ASSETS.egg.spritesheet.key,
        ASSETS.egg.spritesheet.path,
        { frameWidth: ASSETS.egg.spritesheet.fw, frameHeight: ASSETS.egg.spritesheet.fh }
    );

    scene.load.spritesheet(
        ASSETS.plants.spritesheet.key,
        ASSETS.plants.spritesheet.path,
        { frameWidth: ASSETS.plants.spritesheet.fw, frameHeight: ASSETS.plants.spritesheet.fh }
    );

    scene.load.spritesheet(
        ASSETS.chest.spritesheet.key,
        ASSETS.chest.spritesheet.path,
        { frameWidth: ASSETS.chest.spritesheet.fw, frameHeight: ASSETS.chest.spritesheet.fh }
    );

    scene.load.image(
        ASSETS.chest.image.key,
        ASSETS.chest.image.path
    );

    scene.load.audio(ASSETS.menu_music.key, ASSETS.menu_music.path);
    scene.load.audio(ASSETS.click_sound.key, ASSETS.click_sound.path);
    scene.load.audio(ASSETS.collect_item.key, ASSETS.collect_item.path);
    scene.load.audio(ASSETS.watering.key, ASSETS.watering.path);
    scene.load.audio(ASSETS.plant.key, ASSETS.plant.path);
    scene.load.audio(ASSETS.footsteps.key, ASSETS.footsteps.path);
    scene.load.audio(ASSETS.chest_open.key, ASSETS.chest_open.path);
}