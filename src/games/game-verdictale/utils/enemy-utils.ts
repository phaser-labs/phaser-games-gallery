import Phaser from 'phaser';

import { Question } from '../types/types';

import { ASSETS } from './game-assets';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Enemy {
    sprite: Phaser.Physics.Arcade.Sprite;
    questions: Question[];       // Array de preguntas
    currentIndex: number;        // Pregunta actual
    answered: boolean;           // true cuando todas respondidas
    introShown?: boolean;        // para mostrar intro solo la primera vez
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const ENEMY_KEYS = [
    ASSETS.enemies.skeleton.key,
    ASSETS.enemies.monkey.key,
    ASSETS.enemies.spirit.key,
    ASSETS.enemies.lion.key,
] as const;

export const ENEMY_LORE: Record<string, EnemyLore> = {
    [ASSETS.enemies.skeleton.key]: {
        name: 'ESQUELETO',
        title: 'El Guardián Olvidado',
        intro: [
            '* ... ... ...',
            '* ¿Quién osa despertar mis huesos?',
            '* Llevo 300 años custodiando este lugar.',
            '* Demuestra que mereces pasar.',
        ],
        victoryLine: '* Impresionante... Hacía siglos que nadie me vencía.',
        defeatLine: '* Ja. Vuelve cuando sepas algo.',
        personality: 'arrogante y lento', // para referencia de diseño
    },
    [ASSETS.enemies.monkey.key]: {
        name: 'MONO',
        title: 'El Travieso del Tejado',
        intro: [
            '* ¡Eeek! ¡Eeek! ¡Un visitante!',
            '* ¡Yo soy Chispa, el más listo del barrio!',
            '* ¡Si me ganas te doy un plátano... mágico!',
            '* ¡Aunque dudo mucho que puedas, jejeje!',
        ],
        victoryLine: '* ¡Eeeek! ¡No puede seeeer! ¡Trampa!',
        defeatLine: '* ¡Lo sabía! ¡Eres muy tonto! ¡Jiji!',
        personality: 'caótico y burlón',
    },
    [ASSETS.enemies.spirit.key]: {
        name: 'ESPÍRITU',
        title: 'La Memoria de la Casa',
        intro: [
            '* Bienvenido... viajero...',
            '* Yo fui quien vivió aquí, hace mucho.',
            '* Si respondes bien... quizás recuerde la paz.',
            '* Procede con respeto.',
        ],
        victoryLine: '* Gracias... por escucharme. Ahora puedo descansar.',
        defeatLine: '* Aún no estás listo para comprender.',
        personality: 'melancólico y sabio',
    },
    [ASSETS.enemies.lion.key]: {
        name: 'LEÓN',
        title: 'El Rey de la Selva',
        intro: [
            '* Roar! ¡Soy el rey de la selva!',
            '* ¡No me conoces, pero te conozco a ti!',
            '* ¡Si me vences, podrás pasar!',
            '* ¡Pero no será fácil!',
        ],
        victoryLine: '* Impresionante... No esperaba que fueras tan fuerte.',
        defeatLine: '* Ja. Vuelve cuando sepas algo.',
        personality: 'orgulloso y feroz',
    }
};

export interface EnemyLore {
    name: string;
    title: string;
    intro: string[];
    victoryLine: string;
    defeatLine: string;
    personality: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGN QUESTIONS TO HOUSES
// Distribuye las preguntas aleatoriamente entre 7 casas (1-3 por casa)
// ─────────────────────────────────────────────────────────────────────────────

export function assignQuestionsToHouses(
    questions: Question[]
): Map<string, Question[]> {
    const houses = ['interior-1', 'interior-2', 'interior-3', 'interior-4', 'interior-5', 'interior-6', 'interior-7'];
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const map = new Map<string, Question[]>();

    let idx = 0;
    houses.forEach(house => {
        const count = Phaser.Math.Between(1, 3);
        const houseQuestions: Question[] = [];

        for (let i = 0; i < count && idx < shuffled.length; i++, idx++) {
            houseQuestions.push(shuffled[idx]);
        }

        if (houseQuestions.length > 0) {
            map.set(house, houseQuestions);
        }
    });

    return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE ENEMIES IN INTERIOR
// Crea un enemigo por pregunta en posiciones distribuidas en el interior
// ─────────────────────────────────────────────────────────────────────────────

export function createEnemies(
    scene: Phaser.Scene,
    questions: Question[],
    map: Phaser.Tilemaps.Tilemap
): Enemy[] {
    if (!questions.length) return [];

    // Calcular centro del floor
    const floorLayerData = map.layers.find(l => l.name === 'floor');
    if (!floorLayerData) return [];

    const floorTiles = floorLayerData.data.flat().filter(t => t.index > 0);
    const xs = floorTiles.map(t => t.x);
    const ys = floorTiles.map(t => t.y);

    const centerX = ((Math.min(...xs) + Math.max(...xs)) / 2) * 16 + 8;
    const centerY = ((Math.min(...ys) + Math.max(...ys)) / 2) * 16 + 8;

    const key = ENEMY_KEYS[Phaser.Math.Between(0, ENEMY_KEYS.length - 1)];

    const sprite = scene.physics.add
        .sprite(centerX, centerY, key)
        .setDepth(20);

    sprite.setBodySize(12, 12);
    (sprite.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    sprite.play(`${key}-idle`);

    // 🔥 un solo Enemy con todas las preguntas
    return [{ sprite, questions, answered: false, currentIndex: 0 }];
}

// ─────────────────────────────────────────────────────────────────────────────
// GET CLOSEST ENEMY
// Devuelve el enemigo más cercano al player dentro de un rango
// ─────────────────────────────────────────────────────────────────────────────

export function getClosestEnemy(
    enemies: Enemy[],
    playerX: number,
    playerY: number,
    range: number
): Enemy | null {
    let closest: Enemy | null = null;
    let closestDist = Infinity;

    for (const enemy of enemies) {
        if (!enemy.sprite.active) continue;
        if (enemy.answered) continue;

        const dist = Phaser.Math.Distance.Between(
            playerX, playerY,
            enemy.sprite.x, enemy.sprite.y
        );

        if (dist < range && dist < closestDist) {
            closestDist = dist;
            closest = enemy;
        }
    }

    return closest;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK ALL ANSWERED
// ─────────────────────────────────────────────────────────────────────────────

export function allEnemiesAnswered(enemies: Enemy[]): boolean {
    return enemies.every(e => e.answered);
}

// ─────────────────────────────────────────────────────────────────────────────
// DISMISS ENEMIES
// Hace desaparecer todos los enemigos con una animación
// ─────────────────────────────────────────────────────────────────────────────

export function dismissEnemies(
    scene: Phaser.Scene,
    enemies: Enemy[]
): void {
    enemies.forEach(({ sprite }) => {
        if (!sprite.active) return;
        scene.tweens.add({
            targets: sprite,
            alpha: 0,
            scale: 0,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => sprite.destroy(),
        });
    });
}