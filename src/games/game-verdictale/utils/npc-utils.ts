import Phaser from 'phaser';

import { announce } from './announce';
import { ASSETS } from './game-assets';

import css from '../styles/verdictale.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface NpcSpawn {
    x: number;
    y: number;
}

type WanderDir = 'horizontal' | 'vertical';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const NPC_KEYS = [
    ASSETS.npc.camuflage.key,
    ASSETS.npc.eskimo.key,
    ASSETS.npc.inspector.key,
    ASSETS.npc.princess.key,
    ASSETS.npc.village.key,
] as const;

const ANIMAL_KEYS = [
    ASSETS.animals.cat.key,
    ASSETS.animals.racoon.key,
] as const;

const NPC_SPAWNS: NpcSpawn[] = [
    { x: 568, y: 424 }, // house1
    { x: 552, y: 584 }, // house2
    { x: 616, y: 584 }, // house3
    { x: 680, y: 584 }, // house4
    { x: 744, y: 664 }, // house5
    { x: 552, y: 664 }, // house6
    { x: 984, y: 424 }, // house7
    { x: 280, y: 280 }, // house-util-1
    { x: 360, y: 280 }, // house-util-2
    { x: 680, y: 408 }, // house-util-3
    { x: 632, y: 648 }, // house-util-4
    { x: 280, y: 792 }, // house-util-5
];


const WANDER_RANGE = 32; // 2 tiles
const WANDER_SPEED = 25;
const TILE_SIZE = 16;

// ─────────────────────────────────────────────────────────────────────────────
// NPC HINTS
// ─────────────────────────────────────────────────────────────────────────────

const NPC_HINTS: Record<string, { name: string; lines: string[] }> = {
    [ASSETS.npc.camuflage.key]: {
        name: 'SOLDADO',
        lines: [
            '* He patrullado estas calles\n  durante años...',
            '* Hay criaturas en las casas.\n  No entres sin prepararte.',
            '* La casa del norte es\n  la más peligrosa. Te lo advierto.',
        ],
    },
    [ASSETS.npc.eskimo.key]: {
        name: 'ESQUIMAL',
        lines: [
            '* Brr... hace frío aquí.',
            '* Dicen que un espíritu vaga\n  por las casas del este...',
            '* Yo no me acercaría\n  si fuera tú.',
        ],
    },
    [ASSETS.npc.inspector.key]: {
        name: 'INSPECTOR',
        lines: [
            '* Según mis registros...',
            '* Hay criaturas en 7 casas\n  de este pueblo.',
            '* Responde sus preguntas\n  y te dejarán pasar.',
        ],
    },
    [ASSETS.npc.princess.key]: {
        name: 'PRINCESA',
        lines: [
            '* ¡Hola, viajero!',
            '* El esqueleto de la primera\n  casa lleva siglos esperando.',
            '* Sé valiente y\n  entrará en razón. ¡Suerte!',
        ],
    },
    [ASSETS.npc.village.key]: {
        name: 'ALDEANO',
        lines: [
            '* Bienvenido al pueblo.',
            '* Ten cuidado con los animales.',
            '* El inspector puede ayudarte.',
        ],
    },
};

const HINT_RANGE = 40;
const HINT_COOLDOWN = 8000;

// Perfil del NPC — reutiliza el mismo sprite como perfil
const NPC_PROFILE_MAP: Record<string, string> = {
    [ASSETS.npc.camuflage.key]: ASSETS.profile.camuflage.key,
    [ASSETS.npc.eskimo.key]: ASSETS.profile.eskimo.key,
    [ASSETS.npc.inspector.key]: ASSETS.profile.inspector.key,
    [ASSETS.npc.princess.key]: ASSETS.profile.princess.key,
    [ASSETS.npc.village.key]: ASSETS.profile.village.key,
};


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function isWalkable(
    wx: number,
    wy: number,
    walkableSet: Set<string>,
    map: Phaser.Tilemaps.Tilemap
): boolean {
    const tx = map.worldToTileX(wx);
    const ty = map.worldToTileY(wy);
    if (tx === null || ty === null) return false;
    return walkableSet.has(`${tx}_${ty}`);
}

function isAnimalKey(key: string): boolean {
    return key === ASSETS.animals.cat.key || key === ASSETS.animals.racoon.key;
}

function drawProfile(profileCanvas: HTMLCanvasElement, scene: Phaser.Scene, profileKey: string): void {
    if (!profileCanvas) return;
    const texture = scene.textures.get(profileKey);
    if (!texture || texture.key === '__MISSING') return;

    const img = texture.getSourceImage() as HTMLImageElement;
    if (!img || !img.naturalWidth) return;

    const ctx = profileCanvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, 40, 40, 0, 0, 40, 40);
}

// ─────────────────────────────────────────────────────────────────────────────
// WANDER
// ─────────────────────────────────────────────────────────────────────────────

function scheduleWander(
    scene: Phaser.Scene,
    npc: Phaser.Physics.Arcade.Sprite,
    originX: number,
    originY: number,
    dir: WanderDir,
    walkableSet: Set<string>,
    map: Phaser.Tilemaps.Tilemap
): void {
    const key = npc.texture.key;
    const animal = isAnimalKey(key);
    let goingForward = true;

    const stopNpc = () => {
        npc.setVelocity(0, 0);
        npc.anims.stop();
        npc.setFrame(0);
        npc.setFlipX(false);
    };

    const wander = () => {
        if (!npc.active) return;

        // 🔥 pausar wander si el dialog está abierto
        if (npc.getData('dialogOpen')) {
            scene.time.delayedCall(500, wander);
            return;
        }

        const offset = goingForward ? WANDER_RANGE : -WANDER_RANGE;
        goingForward = !goingForward;

        const targetX = dir === 'horizontal' ? originX + offset : originX;
        const targetY = dir === 'vertical' ? originY + offset : originY;

        let vx = 0;
        let vy = 0;

        if (dir === 'horizontal') {
            vx = offset > 0 ? WANDER_SPEED : -WANDER_SPEED;
            if (animal) {
                npc.play(`${key}-walk-right`, true); // 🔥 animación
                npc.setFlipX(offset < 0);
            } else {
                npc.setFlipX(offset < 0);
                npc.play(`${key}-walk-right`, true);
            }

        } else {
            vy = offset > 0 ? WANDER_SPEED : -WANDER_SPEED;
            if (animal) {
                npc.setFrame(1);
            } else {
                npc.play(offset > 0 ? `${key}-walk-down` : `${key}-walk-up`, true);
            }
        }

        npc.setVelocity(vx, vy);

        const check = scene.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => {
                if (!npc.active) { check.remove(); return; }

                // 🔥 detener si dialog abierto
                if (npc.getData('dialogOpen')) {
                    stopNpc();
                    check.remove();
                    scene.time.delayedCall(500, wander);
                    return;
                }

                const margin = 8;
                const blocked =
                    (vx !== 0 && !isWalkable(npc.x + Math.sign(vx) * margin, npc.y, walkableSet, map)) ||
                    (vy !== 0 && !isWalkable(npc.x, npc.y + Math.sign(vy) * margin, walkableSet, map));

                const reached =
                    (dir === 'horizontal' && Math.abs(npc.x - targetX) < 4) ||
                    (dir === 'vertical' && Math.abs(npc.y - targetY) < 4);

                if (reached || blocked) {
                    stopNpc();
                    check.remove();
                    scene.time.delayedCall(
                        Phaser.Math.Between(800, 2500),
                        wander
                    );
                }
            },
        });
    };

    scene.time.delayedCall(Phaser.Math.Between(0, 2000), wander);
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE NPCS
// ─────────────────────────────────────────────────────────────────────────────

export function createNPCs(
    scene: Phaser.Scene,
    walkableSet: Set<string>,
    map: Phaser.Tilemaps.Tilemap
): Phaser.Physics.Arcade.Sprite[] {
    const npcs: Phaser.Physics.Arcade.Sprite[] = [];

    const shuffledKeys = Phaser.Utils.Array.Shuffle([...NPC_KEYS]);
    const shuffledSpawns = Phaser.Utils.Array.Shuffle([...NPC_SPAWNS]).slice(0, 5);

    shuffledSpawns.forEach(({ x, y }, index) => {
        const key = shuffledKeys[index % shuffledKeys.length];

        const npc = scene.physics.add
            .sprite(x, y, key)
            .setDepth(21);

        npc.setFrame(0);

        const body = npc.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.pushable = false;

        npcs.push(npc);

        const dir: WanderDir = Phaser.Math.Between(0, 1) === 0 ? 'horizontal' : 'vertical';
        scheduleWander(scene, npc, x, y, dir, walkableSet, map);
    });

    return npcs;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE ANIMALS
// ─────────────────────────────────────────────────────────────────────────────

export function createAnimals(
    scene: Phaser.Scene,
    walkableSet: Set<string>,
    map: Phaser.Tilemaps.Tilemap
): Phaser.Physics.Arcade.Sprite[] {
    const animals: Phaser.Physics.Arcade.Sprite[] = [];

    // Convertir walkableSet a posiciones world
    const walkableTiles: { x: number; y: number }[] = [];
    walkableSet.forEach(k => {
        const [tx, ty] = k.split('_').map(Number);
        walkableTiles.push({
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2,
        });
    });

    ANIMAL_KEYS.forEach(key => {
        const spawn = walkableTiles[Phaser.Math.Between(0, walkableTiles.length - 1)];

        const animal = scene.physics.add
            .sprite(spawn.x, spawn.y, key)
            .setDepth(21);

        animal.setFrame(0);

        const body = animal.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.pushable = false;

        animals.push(animal);

        const dir: WanderDir = 'horizontal' // Los animales solo deambulan horizontalmente para simplificar;
        scheduleWander(scene, animal, spawn.x, spawn.y, dir, walkableSet, map);
    });

    return animals;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUBBLE — puntitos animados encima del NPC
// ─────────────────────────────────────────────────────────────────────────────

export function updateNpcBubbles(
    scene: Phaser.Scene,
    npcs: Phaser.Physics.Arcade.Sprite[],
    playerX: number,
    playerY: number,
): void {
    npcs.forEach(npc => {
        if (!npc.active) return;

        const dist = Phaser.Math.Distance.Between(playerX, playerY, npc.x, npc.y);
        const inRange = dist < HINT_RANGE;
        const hasBubble = !!npc.getData('bubbleObj');
        const dialogOpen = !!npc.getData('dialogOpen');

        if (inRange && !hasBubble && !dialogOpen) {
            _showBubble(scene, npc);
        } else if (!inRange && hasBubble) {
            _destroyBubble(npc);
        }
    });
}

function _showBubble(scene: Phaser.Scene, npc: Phaser.Physics.Arcade.Sprite): void {
    const ZOOM = 2;

    const bubble = scene.add
        .sprite(npc.x, npc.y - 20, ASSETS.items.dialog_info.key, 0) // 👈 frame inicial
        .setDepth(200)
        .setScale(1 / ZOOM);

    // 🔥 IMPORTANTE: play DESPUÉS de crear
    bubble.anims.play(`${ASSETS.items.dialog_info.key}-anim`, true);

    // Seguir al NPC
    const tracker = scene.time.addEvent({
        delay: 16,
        loop: true,
        callback: () => {
            if (!npc.active || !bubble.active) {
                tracker.remove();
                return;
            }
            bubble.setPosition(npc.x, npc.y - 20);
        },
    });

    npc.setData('bubbleObj', bubble);
    npc.setData('bubbleTracker', tracker);
}

function _destroyBubble(npc: Phaser.Physics.Arcade.Sprite): void {
    const bubble = npc.getData('bubbleObj') as Phaser.GameObjects.Sprite;
    const tracker = npc.getData('bubbleTracker') as Phaser.Time.TimerEvent;

    if (bubble?.active) bubble.destroy();
    if (tracker) tracker.remove();

    npc.setData('bubbleObj', null);
    npc.setData('bubbleTracker', null);
}

// ─────────────────────────────────────────────────────────────────────────────
// DIALOG — estilo Undertale con perfil
// ─────────────────────────────────────────────────────────────────────────────

export function checkNpcInteraction(
    scene: Phaser.Scene,
    npcs: Phaser.Physics.Arcade.Sprite[],
    playerX: number,
    playerY: number,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    enterKey: Phaser.Input.Keyboard.Key
): void {
    if (!Phaser.Input.Keyboard.JustDown(cursors.space!) &&
        !Phaser.Input.Keyboard.JustDown(enterKey)) return;

    for (const npc of npcs) {
        if (!npc.active) continue;
        if (npc.getData('dialogOpen')) continue;

        const dist = Phaser.Math.Distance.Between(playerX, playerY, npc.x, npc.y);
        if (dist > HINT_RANGE) continue;

        const lastSpoken = npc.getData('lastSpoken') ?? 0;
        if (scene.time.now - lastSpoken < HINT_COOLDOWN) continue;

        npc.setData('lastSpoken', scene.time.now);
        _destroyBubble(npc);
        _showNpcDialog(scene, npc, enterKey, cursors);
        break;
    }
}

function _showNpcDialog(
    scene: Phaser.Scene,
    npc: Phaser.Physics.Arcade.Sprite,
    enterKey: Phaser.Input.Keyboard.Key,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
): void {
    const ZOOM = 2;

    const npcKey = npc.texture.key;
    const profileKey = NPC_PROFILE_MAP[npcKey] ?? npcKey;

    const lore = NPC_HINTS[npcKey] ?? { name: 'ALDEANO', lines: ['* ...'] };
    const W = scene.scale.gameSize.width;
    const H = scene.scale.gameSize.height;

    npc.setData('dialogOpen', true);
    scene.physics.pause();

    const audioManager = scene.registry.get("audioManager");
    audioManager?.playSFX(ASSETS.bubble_pop.key, 0.4);

    announce(`Hablando con ${lore.name}. Presiona Enter o Espacio para avanzar.`);

    let lineIndex = 0;

    let dom: Phaser.GameObjects.DOMElement;

    const close = () => {
        if (dom?.active) dom.destroy();
        npc.setData('dialogOpen', false);
        scene.physics.resume();
        scene.events.off('update', onKey);
        announce('Fin del diálogo.');
    };


    const advance = () => {
        const audioManager = scene.registry.get("audioManager");
        audioManager?.playSFX(ASSETS.ui_hover.key, 0.4);

        lineIndex++;
        if (lineIndex < lore.lines.length) {
            renderLine();
        } else {
            close();
        }
    };

    const onKey = () => {
        if (Phaser.Input.Keyboard.JustDown(enterKey) ||
            Phaser.Input.Keyboard.JustDown(cursors.space!)) {
            advance();
        }
    };

    scene.events.on('update', onKey);

    const renderLine = () => {
        const line = lore.lines[lineIndex];

        // 🔥 limpiar saltos de línea para lector
        const cleanLine = line.replace(/\n/g, ' ');
        announce(`${lore.name}. ${cleanLine}. Línea ${lineIndex + 1} de ${lore.lines.length}. Presiona Enter o Espacio para avanzar.`);

        const html = `
             <div class="${css.container}" style="width:${W}px; height:${H}px;">
                <div class="${css.panel}">
                    <!-- HEADER: perfil + nombre -->
                    <div class="${css.header}">
                        <canvas id="npc-profile" width="40" height="40"
                            style="image-rendering:pixelated; border:2px solid #fff; flex-shrink:0;">
                        </canvas>
                        <div>
                            <div class="${css.enemyName}">${lore.name}</div>
                            <div class="${css.questionCount}">
                                ${lineIndex + 1} / ${lore.lines.length}
                            </div>
                        </div>
                        <div style="margin-left:auto; font-size:10px; color:#555;">
                            [ESPACIO / ENTER]
                        </div>
                    </div>

                    <div class="${css.divider}"></div>

                    <!-- TEXTO -->
                    <div style="padding:10px 12px; font-size:12px; line-height:1.7; min-height:48px;">
                        ${line}
                    </div>

                    <div style="padding:0 12px 8px; text-align:right;">
                        <span style="font-size:10px; color:#888; animation:blink 1s infinite;">▼</span>
                    </div>
                </div>
            </div>`;

        if (dom?.active) dom.destroy();

        dom = scene.add
            .dom(W / 2, H / 2)
            .setOrigin(0.5)
            .setDepth(30)
            .setScrollFactor(0)
            .setScale(1 / ZOOM)
            .createFromHTML(html);

        const canvas = (dom.node as HTMLDivElement).querySelector('#npc-profile') as HTMLCanvasElement;
        drawProfile(canvas, scene, profileKey);

        (dom.node as HTMLDivElement).addEventListener('click', advance);
    };

    renderLine();
}