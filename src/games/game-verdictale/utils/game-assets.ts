import { Scene } from "phaser";

export const ASSETS = {
    // ── Personaje principal ──────────────────────────────────────────────────
    player: {
        walk: { key: 'player-walk', path: 'characters/player/Walk.png', fw: 32, fh: 32 },
        idle: { key: 'player-idle', path: 'characters/player/Idle.png', fw: 32, fh: 32 },
        attack: { key: 'player-attack', path: 'characters/player/Attack.png', fw: 32, fh: 32 },
        dead: { key: 'player-dead', path: 'characters/player/Dead.png', fw: 32, fh: 32 },
    },

    // ── NPCs ─────────────────────────────────────────────────────────────────
    npc: {
        camuflage: { key: 'npc-camouflage', path: 'characters/npcs/CamouflageGreen_SpriteSheet.png', fw: 16, fh: 16 },
        eskimo: { key: 'npc-eskimo', path: 'characters/npcs/Eskimo_SpriteSheet.png', fw: 16, fh: 16 },
        inspector: { key: 'npc-inspector', path: 'characters/npcs/Inspector_SpriteSheet.png', fw: 16, fh: 16 },
        princess: { key: 'npc-princess', path: 'characters/npcs/Princess_SpriteSheet.png', fw: 16, fh: 16 },
        village: { key: 'npc-village', path: 'characters/npcs/Village_SpriteSheet.png', fw: 16, fh: 16 },
    },

    // ── Enemigos ───────────────────────────────────────────────────────────────
    enemies:{
        skeleton: { key: 'enemy-skeleton', path: 'characters/npcs/Skeleton_SpriteSheet.png', fw: 16, fh: 16 },
        monkey: { key: 'enemy-monkey', path: 'characters/npcs/Monkey_SpriteSheet.png', fw: 16, fh: 16 },
        spirit: { key: 'enemy-spirit', path: 'characters/npcs/Spirit_SpriteSheet.png', fw: 16, fh: 16 },
        lion: { key: 'enemy-lion', path: 'characters/npcs/Lion_SpriteSheet.png', fw: 16, fh: 16 },
    },

    // ── Animales ───────────────────────────────────────────────────────────────
    animals:{
        cat: { key: 'animal-cat', path: 'characters/animals/cat_SpriteSheet.png', fw: 16, fh: 16 },
        racoon: { key: 'animal-raccoon', path: 'characters/animals/racoon_SpriteSheet.png', fw: 16, fh: 16 },
    },

    // ── Perfiles ───────────────────────────────────────────────────────────────
    profile:{
        camuflage: { key: 'profile-camouflage', path: 'characters/npcs/CamouflageGreen_Faceset.png', fw: 40, fh: 40 },
        eskimo: { key: 'profile-eskimo', path: 'characters/npcs/Eskimo_Faceset.png', fw: 40, fh: 40 },
        inspector: { key: 'profile-inspector', path: 'characters/npcs/Inspector_Faceset.png', fw: 40, fh: 40 },
        princess: { key: 'profile-princess', path: 'characters/npcs/Princess_Faceset.png', fw: 40, fh: 40 },
        village: { key: 'profile-village', path: 'characters/npcs/Village_Faceset.png', fw: 40, fh: 40 },
        skeleton: { key: 'profile-skeleton', path: 'characters/npcs/Skeleton_Faceset.png', fw: 40, fh: 40 },
        monkey: { key: 'profile-monkey', path: 'characters/npcs/Monkey_Faceset.png', fw: 40, fh: 40 },
        spirit: { key: 'profile-spirit', path: 'characters/npcs/Spirit_Faceset.png', fw: 40, fh: 40 },
        lion: { key: 'profile-lion', path: 'characters/npcs/Lion_Faceset.png', fw: 40, fh: 40 },
    },

    // ── Otros assets (fondos, objetos, etc.) se pueden agregar aquí de forma similar
    items:{
        dialog_info: { key: 'item-dialog-info', path: 'items/DialogInfo.png', fw: 20, fh: 16 },
        cover: { key: 'item-cover', path: 'items/Cover.png' },
        music: { key: 'item-music', path: 'items/Music.png' },
        sound: { key: 'item-sound', path: 'items/Sound.png' },
    },

     // ── Sounds ───────────────────────────────────────────────────────────────
    menu_music: { key: 'menu_music', path: 'sounds/menu-music.mp3' },
    ui_confirm: { key: 'ui-confirm', path: 'sounds/ui-confirm.wav' },
    ui_hover: { key: 'ui-hover', path: 'sounds/ui-hover.wav' },
    ui_move : { key: 'ui-move', path: 'sounds/ui-move.mp3' },
    ui_success: { key: 'ui-success', path: 'sounds/ui-success.wav' },
    ui_wrong: { key: 'ui-wrong', path: 'sounds/ui-wrong.wav' },
    ui_typing: { key: 'ui-typing', path: 'sounds/ui-typing.wav' },
    footStep: { key: 'footstep', path: 'sounds/footstep.wav' },
    bubble_pop: { key: 'bubble-pop', path: 'sounds/bubble-pop.wav' },
    bleep: { key: 'bleep', path: 'sounds/bleep.mp3' },
    hurt: { key: 'hurt', path: 'sounds/hurt.mp3' },

} as const;

export function preloadAssets(scene: Scene) {
    scene.load.setPath('assets/game-verdictale');

    // ── Personaje principal ───────────────────────────────────────────────────
    scene.load.spritesheet(ASSETS.player.walk.key, ASSETS.player.walk.path, { frameWidth: ASSETS.player.walk.fw, frameHeight: ASSETS.player.walk.fh });
    scene.load.spritesheet(ASSETS.player.idle.key, ASSETS.player.idle.path, { frameWidth: ASSETS.player.idle.fw, frameHeight: ASSETS.player.idle.fh });
    scene.load.spritesheet(ASSETS.player.attack.key, ASSETS.player.attack.path, { frameWidth: ASSETS.player.attack.fw, frameHeight: ASSETS.player.attack.fh });
    scene.load.spritesheet(ASSETS.player.dead.key, ASSETS.player.dead.path, { frameWidth: ASSETS.player.dead.fw, frameHeight: ASSETS.player.dead.fh });

    // ── NPCs ─────────────────────────────────────────────────────────────────
    scene.load.spritesheet(ASSETS.npc.camuflage.key, ASSETS.npc.camuflage.path, { frameWidth: ASSETS.npc.camuflage.fw, frameHeight: ASSETS.npc.camuflage.fh });
    scene.load.spritesheet(ASSETS.npc.eskimo.key, ASSETS.npc.eskimo.path, { frameWidth: ASSETS.npc.eskimo.fw, frameHeight: ASSETS.npc.eskimo.fh });
    scene.load.spritesheet(ASSETS.npc.inspector.key, ASSETS.npc.inspector.path, { frameWidth: ASSETS.npc.inspector.fw, frameHeight: ASSETS.npc.inspector.fh });
    scene.load.spritesheet(ASSETS.npc.princess.key, ASSETS.npc.princess.path, { frameWidth: ASSETS.npc.princess.fw, frameHeight: ASSETS.npc.princess.fh });
    scene.load.spritesheet(ASSETS.npc.village.key, ASSETS.npc.village.path, { frameWidth: ASSETS.npc.village.fw, frameHeight: ASSETS.npc.village.fh });

    // ── Enemigos ──────────────────────────────────────────────────────────────
    scene.load.spritesheet(ASSETS.enemies.skeleton.key, ASSETS.enemies.skeleton.path, { frameWidth: ASSETS.enemies.skeleton.fw, frameHeight: ASSETS.enemies.skeleton.fh });
    scene.load.spritesheet(ASSETS.enemies.monkey.key, ASSETS.enemies.monkey.path, { frameWidth: ASSETS.enemies.monkey.fw, frameHeight: ASSETS.enemies.monkey.fh });
    scene.load.spritesheet(ASSETS.enemies.spirit.key, ASSETS.enemies.spirit.path, { frameWidth: ASSETS.enemies.spirit.fw, frameHeight: ASSETS.enemies.spirit.fh });
    scene.load.spritesheet(ASSETS.enemies.lion.key, ASSETS.enemies.lion.path, { frameWidth: ASSETS.enemies.lion.fw, frameHeight: ASSETS.enemies.lion.fh });

    // ── Animales ───────────────────────────────────────────────────────────────
    scene.load.spritesheet(ASSETS.animals.cat.key, ASSETS.animals.cat.path, { frameWidth: ASSETS.animals.cat.fw, frameHeight: ASSETS.animals.cat.fh });
    scene.load.spritesheet(ASSETS.animals.racoon.key, ASSETS.animals.racoon.path, { frameWidth: ASSETS.animals.racoon.fw, frameHeight: ASSETS.animals.racoon.fh });

    // ── Perfiles ───────────────────────────────────────────────────────────────
    scene.load.spritesheet(ASSETS.profile.camuflage.key, ASSETS.profile.camuflage.path, { frameWidth: ASSETS.profile.camuflage.fw, frameHeight: ASSETS.profile.camuflage.fh });
    scene.load.spritesheet(ASSETS.profile.eskimo.key, ASSETS.profile.eskimo.path, { frameWidth: ASSETS.profile.eskimo.fw, frameHeight: ASSETS.profile.eskimo.fh });
    scene.load.spritesheet(ASSETS.profile.inspector.key, ASSETS.profile.inspector.path, { frameWidth: ASSETS.profile.inspector.fw, frameHeight: ASSETS.profile.inspector.fh });
    scene.load.spritesheet(ASSETS.profile.princess.key, ASSETS.profile.princess.path, { frameWidth: ASSETS.profile.princess.fw, frameHeight: ASSETS.profile.princess.fh });
    scene.load.spritesheet(ASSETS.profile.skeleton.key, ASSETS.profile.skeleton.path, { frameWidth: ASSETS.profile.skeleton.fw, frameHeight: ASSETS.profile.skeleton.fh });
    scene.load.spritesheet(ASSETS.profile.monkey.key, ASSETS.profile.monkey.path, { frameWidth: ASSETS.profile.monkey.fw, frameHeight: ASSETS.profile.monkey.fh });
    scene.load.spritesheet(ASSETS.profile.spirit.key, ASSETS.profile.spirit.path, { frameWidth: ASSETS.profile.spirit.fw, frameHeight: ASSETS.profile.spirit.fh });
    scene.load.spritesheet(ASSETS.profile.lion.key, ASSETS.profile.lion.path, { frameWidth: ASSETS.profile.lion.fw, frameHeight: ASSETS.profile.lion.fh });
    scene.load.spritesheet(ASSETS.profile.village.key, ASSETS.profile.village.path, { frameWidth: ASSETS.profile.village.fw, frameHeight: ASSETS.profile.village.fh });

    // ── Otros assets (fondos, objetos, etc.) ───────────────────────────────────
    scene.load.spritesheet(ASSETS.items.dialog_info.key, ASSETS.items.dialog_info.path, { frameWidth: ASSETS.items.dialog_info.fw, frameHeight: ASSETS.items.dialog_info.fh });
    scene.load.image(ASSETS.items.cover.key, ASSETS.items.cover.path);
    scene.load.image(ASSETS.items.music.key, ASSETS.items.music.path);
    scene.load.image(ASSETS.items.sound.key, ASSETS.items.sound.path);

    // ── MUSIC ────────────────────────────────────────────────────────
    scene.load.audio(ASSETS.menu_music.key, ASSETS.menu_music.path);
    scene.load.audio(ASSETS.ui_confirm.key, ASSETS.ui_confirm.path);
    scene.load.audio(ASSETS.ui_hover.key, ASSETS.ui_hover.path);
    scene.load.audio(ASSETS.ui_move.key, ASSETS.ui_move.path);
    scene.load.audio(ASSETS.ui_success.key, ASSETS.ui_success.path);
    scene.load.audio(ASSETS.ui_wrong.key, ASSETS.ui_wrong.path);
    scene.load.audio(ASSETS.ui_typing.key, ASSETS.ui_typing.path);
    scene.load.audio(ASSETS.footStep.key, ASSETS.footStep.path);
    scene.load.audio(ASSETS.bubble_pop.key, ASSETS.bubble_pop.path);
    scene.load.audio(ASSETS.bleep.key, ASSETS.bleep.path);
    scene.load.audio(ASSETS.hurt.key, ASSETS.hurt.path);

}