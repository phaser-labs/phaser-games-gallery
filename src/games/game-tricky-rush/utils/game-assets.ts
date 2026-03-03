import { Scene } from "phaser";

export const ASSETS = {
    cover: { key: 'cover', path: 'images/others/cover.png' },

    // spawn
    glass: {
        glass_I: { key: 'glass_I', path: 'images/blocks/glass_I.png' },
        glass_L: { key: 'glass_L', path: 'images/blocks/glass_L.png' },
        glass_T: { key: 'glass_T', path: 'images/blocks/glass_T.png' },
    },

    normal: {
        normal_I: { key: 'normal_I', path: 'images/blocks/normal_I.png' },
        normal_L: { key: 'normal_L', path: 'images/blocks/normal_L.png' },
        normal_T: { key: 'normal_T', path: 'images/blocks/normal_O.png' },
    },

    stone: {
        stone_I: { key: 'stone_I', path: 'images/blocks/stone_I.png' },
        stone_L: { key: 'stone_L', path: 'images/blocks/stone_L.png' },
        stone_T: { key: 'stone_T', path: 'images/blocks/stone_O.png' },
    },

    // others

    container: {
        container_1: { key: 'container', path: 'images/others/container.png' },
        container_2: { key: 'container_2', path: 'images/others/container_2.png' }
    },

    clouds: {
        cloud_1: { key: 'cloud_1', path: 'images/others/cloud_1.png' },
        cloud_2: { key: 'cloud_2', path: 'images/others/cloud_2.png' },
        cloud_3: { key: 'cloud_3', path: 'images/others/cloud_3.png' }
    },

    hearths: {
        hearth_full: { key: 'hearth_full', path: 'images/others/hearth.png' },
        hearth_empty: { key: 'hearth_empty', path: 'images/others/hearth_empty.png' }
    },

    laser: { key: 'laser', path: 'images/others/laser.png' },

    // players

    player1: {
        idle: { key: 'player1_idle', path: 'images/character/player_1_idle_48x48.png', fw: 48, fh: 48 },
        spell: { key: 'player1_spell', path: 'images/character/player_1_spells_64x48.png', fw: 64, fh: 48 }
    },

    player2: {
        idle: { key: 'player2_idle', path: 'images/character/player_2_idle_48x48.png', fw: 48, fh: 48 },
        spell: { key: 'player2_spell', path: 'images/character/player_2_spells_64x48.png', fw: 64, fh: 48 }
    },

    player3: {
        idle: { key: 'player3_idle', path: 'images/character/player_3_idle_48x48.png', fw: 48, fh: 48 },
        spell: { key: 'player3_spell', path: 'images/character/player_3_spells_64x48.png', fw: 64, fh: 48 }
    },

    player4: {
        idle: { key: 'player4_idle', path: 'images/character/player_4_idle_48x48.png', fw: 48, fh: 48 },
        spell: { key: 'player4_spell', path: 'images/character/player_4_spells_64x48.png', fw: 64, fh: 48 }
    },

    // Sounds
    menu_music: { key: 'menu_music', path: 'sounds/menu-music.mp3' },
    click_sound: { key: 'click_sound', path: 'sounds/click-sound.wav' },
    completed_words: { key: 'completed_words', path: 'sounds/completed-words.wav' },
    player_selected: { key: 'player_selected', path: 'sounds/player-selected.mp3' },
    spell_sound: { key: 'spell_sound', path: 'sounds/spell-sound.mp3' },
    spawn_sound: { key: 'spawn_sound', path: 'sounds/spawn-sound.mp3' },
    incorrect_word: { key: 'incorrect_word', path: 'sounds/incorrect-word.wav' }
} as const;

export function preloadAssets(scene: Scene) {
    scene.load.setPath('assets/game-tricky-tower');

    scene.load.image(ASSETS.cover.key, ASSETS.cover.path);

    scene.load.image(ASSETS.glass.glass_I.key, ASSETS.glass.glass_I.path);
    scene.load.image(ASSETS.glass.glass_L.key, ASSETS.glass.glass_L.path);
    scene.load.image(ASSETS.glass.glass_T.key, ASSETS.glass.glass_T.path);

    scene.load.image(ASSETS.normal.normal_I.key, ASSETS.normal.normal_I.path);
    scene.load.image(ASSETS.normal.normal_L.key, ASSETS.normal.normal_L.path);
    scene.load.image(ASSETS.normal.normal_T.key, ASSETS.normal.normal_T.path);

    scene.load.image(ASSETS.stone.stone_I.key, ASSETS.stone.stone_I.path);
    scene.load.image(ASSETS.stone.stone_L.key, ASSETS.stone.stone_L.path);
    scene.load.image(ASSETS.stone.stone_T.key, ASSETS.stone.stone_T.path);

    scene.load.image(ASSETS.container.container_1.key, ASSETS.container.container_1.path);
    scene.load.image(ASSETS.container.container_2.key, ASSETS.container.container_2.path);

    scene.load.image(ASSETS.clouds.cloud_1.key, ASSETS.clouds.cloud_1.path);
    scene.load.image(ASSETS.clouds.cloud_2.key, ASSETS.clouds.cloud_2.path);
    scene.load.image(ASSETS.clouds.cloud_3.key, ASSETS.clouds.cloud_3.path);

    scene.load.image(ASSETS.hearths.hearth_full.key, ASSETS.hearths.hearth_full.path);
    scene.load.image(ASSETS.hearths.hearth_empty.key, ASSETS.hearths.hearth_empty.path);

    scene.load.image(ASSETS.laser.key, ASSETS.laser.path);

    scene.load.spritesheet(ASSETS.player1.idle.key, ASSETS.player1.idle.path, { frameWidth: ASSETS.player1.idle.fw, frameHeight: ASSETS.player1.idle.fh });
    scene.load.spritesheet(ASSETS.player1.spell.key, ASSETS.player1.spell.path, { frameWidth: ASSETS.player1.spell.fw, frameHeight: ASSETS.player1.spell.fh });

    scene.load.spritesheet(ASSETS.player2.idle.key, ASSETS.player2.idle.path, { frameWidth: ASSETS.player2.idle.fw, frameHeight: ASSETS.player2.idle.fh });
    scene.load.spritesheet(ASSETS.player2.spell.key, ASSETS.player2.spell.path, { frameWidth: ASSETS.player2.spell.fw, frameHeight: ASSETS.player2.spell.fh });

    scene.load.spritesheet(ASSETS.player3.idle.key, ASSETS.player3.idle.path, { frameWidth: ASSETS.player3.idle.fw, frameHeight: ASSETS.player3.idle.fh });
    scene.load.spritesheet(ASSETS.player3.spell.key, ASSETS.player3.spell.path, { frameWidth: ASSETS.player3.spell.fw, frameHeight: ASSETS.player3.spell.fh });

    scene.load.spritesheet(ASSETS.player4.idle.key, ASSETS.player4.idle.path, { frameWidth: ASSETS.player4.idle.fw, frameHeight: ASSETS.player4.idle.fh });
    scene.load.spritesheet(ASSETS.player4.spell.key, ASSETS.player4.spell.path, { frameWidth: ASSETS.player4.spell.fw, frameHeight: ASSETS.player4.spell.fh });

    //----------------------------
    // Sounds
    //----------------------------

    scene.load.audio(ASSETS.menu_music.key, ASSETS.menu_music.path);
    scene.load.audio(ASSETS.click_sound.key, ASSETS.click_sound.path);
    scene.load.audio(ASSETS.completed_words.key, ASSETS.completed_words.path);
    scene.load.audio(ASSETS.player_selected.key, ASSETS.player_selected.path);
    scene.load.audio(ASSETS.spell_sound.key, ASSETS.spell_sound.path);
    scene.load.audio(ASSETS.spawn_sound.key, ASSETS.spawn_sound.path);
    scene.load.audio(ASSETS.incorrect_word.key, ASSETS.incorrect_word.path);
}
