// src/utils/combat.ts
import Phaser from 'phaser';

export type PlantType = 1 | 2 | 3 | 4 | 5 | 6;

export type CombatDeps = {
    scene: Phaser.Scene;

    hero: Phaser.GameObjects.Sprite;
    plant: Phaser.GameObjects.Sprite;

    getPlantType: () => PlantType;
    setPlantType: (t: PlantType) => void;

    // hp state
    getHeroHP: () => { hp: number; maxHP: number };
    setHeroHP: (hp: number) => void;

    getPlantHP: () => { hp: number; maxHP: number };
    setPlantHP: (hp: number) => void;

    // barras (valores dibujados, animables)
    setPlantDisplayPct: (pct: number) => void;
    getPlantDisplayPct: () => number;

    setHeroDisplayPct: (pct: number) => void;
    getHeroDisplayPct: () => number;

    // UI hooks
    updateHealthBars: () => void;
    setAnswersEnabled: (enabled: boolean) => void;
    onEnemyDefeated?: () => void;

    // si quieres fill bar cuando muere
    fillPlantBar?: () => Promise<void>;
    onHeroDeath?: () => void; // opcional para que la Scene haga algo (mostrar modal, reiniciar, etc.)
};

export function createCombat(deps: CombatDeps) {
    const { scene } = deps;

    function animKeyByPlant(base: string) {
        const t = deps.getPlantType();

        // 1-3 => plant1..plant3
        if (t <= 3) return `plant${t}_${base}`;

        // 4-6 => slime1..slime3
        const slimeN = (t - 3) as 1 | 2 | 3;
        return `slime${slimeN}_${base}`;
    }


    function playAnimAndWait(sprite: Phaser.GameObjects.Sprite, key: string, soundKey?: string, volume = 0.6) {
        return new Promise<void>((resolve) => {
            if (!scene.anims.exists(key)) {
                console.warn(`❌ Anim no existe: ${key}`);
                resolve();
                return;
            }
            sprite.play(key, true);
            // 🎵 Reproducir sonido al mismo tiempo que la animación
            if (soundKey) {
                scene.sound.play(soundKey, { volume });
            }
            sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + key, () => resolve());
        });
    }

    function tweenTo(target: Phaser.GameObjects.Sprite, toX: number, duration = 280) {
        return new Promise<void>((resolve) => {
            scene.tweens.add({
                targets: target,
                x: toX,
                duration,
                ease: 'Sine.easeInOut',
                onComplete: () => resolve()
            });
        });
    }

    function tweenPct(from: number, to: number, duration = 420, onUpdate?: (v: number) => void) {
        return new Promise<void>((resolve) => {
            const holder = { v: from };
            scene.tweens.add({
                targets: holder,
                v: to,
                duration,
                ease: 'Sine.easeOut',
                onUpdate: () => onUpdate?.(holder.v),
                onComplete: () => resolve()
            });
        });
    }

    async function animateHeroBarTo(toPct: number, duration = 420) {
        const from = deps.getHeroDisplayPct();
        await tweenPct(from, toPct, duration, (v) => {
            deps.setHeroDisplayPct(v);
            deps.updateHealthBars();
        });
    }

    async function animatePlantBarTo(toPct: number, duration = 420) {
        const from = deps.getPlantDisplayPct();
        await tweenPct(from, toPct, duration, (v) => {
            deps.setPlantDisplayPct(v);
            deps.updateHealthBars();
        });
    }

    async function plantWalkAttackHero() {
        const idleAnim = animKeyByPlant('idle');
        const attackAnim = animKeyByPlant('attack');

        const startX = deps.plant.x;
        const attackX = deps.hero.x + getPlantAttackOffsetX();


        deps.plant.play(idleAnim);
        await tweenTo(deps.plant, attackX, 2080);

        const sound = attackSoundByPlant();
        await playAnimAndWait(deps.plant, attackAnim, sound);

        const h = deps.getHeroHP();
        const newHP = Math.max(0, h.hp - 1);
        deps.setHeroHP(newHP);

        const heroToPct = h.maxHP > 0 ? newHP / h.maxHP : 0;

        // ✅ ANIMA LA BARRA EN EL IMPACTO (antes del hurt queda muy bien)
        await animateHeroBarTo(heroToPct, 380);

        // héroe se queja (hurt) después del impacto
        await playAnimAndWait(deps.hero, 'hero_hurt');

        // volver atrás
        deps.plant.play(idleAnim, true);
        await tweenTo(deps.plant, startX, 2080);

        deps.plant.play(idleAnim, true);

        return newHP; // ✅ devuelve hp final para decidir muerte
    }

    async function heroRunAttackPlant(plantToPct: number, willDie: boolean) {
        const startX = deps.hero.x;
        const attackX = deps.plant.x - 35; // ajusta 50-110 según escala

        // correr hacia la planta
        if (scene.anims.exists('hero_run')) deps.hero.play('hero_run', true);
        await tweenTo(deps.hero, attackX, 2080);

        // atacar (una vez)
        await playAnimAndWait(deps.hero, 'hero_attack', 'punch');

        // ✅ AQUI animas la barra (momento de impacto)
        await animatePlantBarTo(plantToPct, 380);

        // ✅ si muere, ejecuta anim de muerte aquí mismo
        if (willDie) {
            await playAnimAndWait(deps.plant, animKeyByPlant('death'));
            deps.plant.anims.stop();
        } else {
            // si no muere, vuelve a idle
            deps.plant.play(animKeyByPlant('idle'), true);
        }

        // volver corriendo
        if (scene.anims.exists('hero_run')) deps.hero.play('hero_run', true);
        await tweenTo(deps.hero, startX, 2060);

        // idle final
        deps.hero.play('hero_idle', true);
    }

    async function resolveAnswer(correct: boolean) {
        deps.setAnswersEnabled(false);
        let shouldReEnable = true;

        const idlePlant = animKeyByPlant('idle');

        try {
            if (correct) {
                const p = deps.getPlantHP();
                const newPlantHP = Math.max(0, p.hp - 1);

                // guarda el HP real ANTES de animar
                deps.setPlantHP(newPlantHP);

                const plantToPct = p.maxHP > 0 ? newPlantHP / p.maxHP : 0;
                const willDie = newPlantHP === 0;

                // el héroe corre, ataca, baja barra y (si aplica) mata dentro de la función
                await heroRunAttackPlant(plantToPct, willDie);

                // si murió: death -> (opcional fill) -> cambio de planta
                if (willDie) {
                    deps.onEnemyDefeated?.();

                    // asegurar displayPct 0 antes de morir
                    deps.setPlantDisplayPct(0);
                    deps.updateHealthBars();

                    // que se quede en el último frame de la anim (no regresa a idle)
                    deps.plant.anims.stop();

                    // opcional: “llenar barra” antes de cambiar de planta
                    if (deps.fillPlantBar) await deps.fillPlantBar();

                    // si quieres cambiar a planta 2 después de morir (por ejemplo)
                    const current = deps.getPlantType();
                    const next = (current === 6 ? 1 : (current + 1)) as PlantType;
                    deps.setPlantType(next);


                    // y listo: no hacemos plant.play(idle)
                    deps.hero.play('hero_idle', true);
                    return; // corta flujo para no tocar más
                }

                deps.plant.play(idlePlant);
                deps.hero.play('hero_idle');
            } else {
                const newHP = await plantWalkAttackHero();

                // si murió
                if (newHP === 0) {
                    if (scene.anims.exists('hero_death')) {
                        await playAnimAndWait(deps.hero, 'hero_death', 'over');
                    } else {
                        console.warn('❌ Anim no existe: hero_death');
                    }

                    deps.hero.anims.stop();
                    deps.setAnswersEnabled(false);

                    await deps.onHeroDeath?.();
                    shouldReEnable = false;

                    return;
                }

                deps.hero.play('hero_idle', true);
                deps.plant.play(animKeyByPlant('idle'), true);
            }
        } finally {
            if (shouldReEnable) deps.setAnswersEnabled(true);
        }
    }

    // ----------------------
    // Helper
    // ----------------------

    function attackSoundByPlant(): string {
        const t = deps.getPlantType();
        // 1-3 plants => bite
        if (t <= 3) return 'bite';
        // 4-6 slimes => slime_attack
        return 'slime';
    }

    function isSlime() {
        return deps.getPlantType() >= 4;
    }

    function getPlantAttackOffsetX() {
        // distancia “hasta dónde llega” a golpear al héroe
        return isSlime() ? 30 : 40;   // slime suele necesitar más/menos, ajusta a ojo
    }

    return { resolveAnswer };
}
