import { Scene } from 'phaser';

import { getTotalQuestions, globalState } from '../global-state';
import { ASSETS, checkNpcInteraction, createAnimals, createAnimations, createNPCs, updateNpcBubbles } from '../utils';
import { announce } from '../utils/announce';
import { createAudioButtonsOverlay } from '../utils/audio-manager';
import {
    animateWater,
    buildWalkableSet,
    createBackground,
    GameBackground,
    HOUSE_ENTRANCES,
} from '../utils/background';

import css from '../styles/verdictale.module.css'

const ZOOM = 2;
const PLAYER_SPAWN_X = 568;
const PLAYER_SPAWN_Y = 440; // 🔥 más abajo, lejos de la entrada

export class Game extends Scene {
    private bgMap!: GameBackground;
    private walkableSet = new Set<string>();
    private player!: Phaser.Physics.Arcade.Sprite;

    // Movimiento del player
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private lastDir = 'down';
    private playerSpeed = 60;
    private lastStepTime = 0;
    private STEP_DELAY = 280; // ms (ajusta: 200–350)

    // Spawn
    private spawnX = PLAYER_SPAWN_X;
    private spawnY = PLAYER_SPAWN_Y;

    // NPCs
    private npcs: Phaser.Physics.Arcade.Sprite[] = [];
    private animals: Phaser.Physics.Arcade.Sprite[] = [];
    private enterKey!: Phaser.Input.Keyboard.Key;

    private hud!: Phaser.GameObjects.DOMElement;
    private gameFinished = false;

    constructor() {
        super('Game');
    }

    init(data?: { spawnX?: number; spawnY?: number }) {
        this.gameFinished = false;
        this.spawnX = PLAYER_SPAWN_X;
        this.spawnY = PLAYER_SPAWN_Y;
        this.npcs = [];
        this.animals = [];
        this.lastDir = 'down';
        this.lastStepTime = 0;

        if (data?.spawnX !== undefined && data?.spawnY !== undefined) {
            this.spawnX = data.spawnX;
            this.spawnY = data.spawnY;
        }
    }

    // ========================================================================
    // CREATE
    // ========================================================================
    create() {
        const { map, layers } = createBackground(this);
        this.bgMap = { map, layers };

        this.walkableSet = buildWalkableSet(layers);
        animateWater(this, layers);
        createAnimations(this);

        this.createPlayer();

        // NPCs y colisiones
        this.npcs = createNPCs(this, this.walkableSet, map);
        this.physics.add.collider(this.player, this.npcs);

        // Animales y colisiones
        this.animals = createAnimals(this, this.walkableSet, this.bgMap.map);
        this.physics.add.collider(this.player, this.animals);

        this.setupCamera();

        this.createHUD();

        // Evitar delta enorme al volver el foco
        this.game.events.on('focus', () => {
            this.game.loop.resetDelta();
        });

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // 🔥 reanudar audio
        if ("context" in this.sound) {
            const manager = this.sound as Phaser.Sound.WebAudioSoundManager;
            manager.context.resume();
        }

        const audioManager = this.registry.get("audioManager");

        if (!audioManager.isMusicPlaying()) {
            audioManager.playMusic(ASSETS.menu_music.key);
        }

        createAudioButtonsOverlay(this, ZOOM);

        this.time.delayedCall(500, () => {
            announce(
                `Explorando el pueblo. Has respondido ${globalState.answeredQuestions} de ${getTotalQuestions()} preguntas. ` +
                `Acércate a un personaje y presiona Enter para interactuar.`
            );
        });
    }

    // ========================================================================
    // CAMERA
    // ========================================================================
    private setupCamera(): void {
        const { map } = this.bgMap;
        this.cameras.main
            .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
            .setZoom(ZOOM)
            .setRoundPixels(true)  // 🔥 evita las líneas entre tiles
            .startFollow(this.player, true, 1, 1);
    }

    // ========================================================================
    // CREATE PLAYER
    // ========================================================================
    private createPlayer(): void {
        this.player = this.physics.add
            .sprite(this.spawnX, this.spawnY, ASSETS.player.idle.key)
            .setDepth(21);

        this.player.setBodySize(10, 10);
        this.playAnim('player-idle-down');
    }

    private playAnim(key: string) {
        if (this.player.anims.currentAnim?.key !== key) {
            this.player.play(key, true);
        }
    }

    // ========================================================================
    // WALKABLE CHECK
    // ========================================================================
    private isWalkableAt(worldX: number, worldY: number): boolean {
        const { map } = this.bgMap;
        const tx = map.worldToTileX(worldX);
        const ty = map.worldToTileY(worldY);
        if (tx === null || ty === null) return false;
        return this.walkableSet.has(`${tx}_${ty}`);
    }

    // ========================================================================
    // CREATE HUD
    // ========================================================================
    private createHUD(): void {
        const W = this.scale.gameSize.width;
        const H = this.scale.gameSize.height;

        const html = `
            <div class="${css['hud-counter']}" style="width:${W}px;height:${H}px;">
                <div class="${css['hud-icon']}">
                    <span class="${css['hud-count']}" id="hud-text">Preguntas: 0 / 0</span></div>
                </div>
            </div>
        `;

        this.hud = this.add.dom(W / 2, H / 2)
            .setOrigin(0.5)
            .setDepth(25) // 🔥 encima de todo
            .setScrollFactor(0) // 🔥 fijo en pantalla
            .setScale(1 / ZOOM)
            .createFromHTML(html);

        this.updateHUD();
        announce(`Progreso: ${globalState.answeredQuestions} de ${getTotalQuestions()} preguntas completadas.`);
    }

    private updateHUD(): void {
        if (!this.hud) return;

        const answered = globalState.answeredQuestions;
        const total = getTotalQuestions();

        const el = (this.hud.node as HTMLDivElement).querySelector('#hud-text');
        if (!el) return;

        el.textContent = `Preguntas: ${answered} / ${total}`;

        // 🔥 announce dinámico
        announce(`Progreso actualizado: ${answered} de ${total}.`);
    }

    // ========================================================================
    // CHECK ANSWER (called desde utils/npc-utils.ts)
    // ========================================================================
    private showVictoryMessage(): void {
        const W = this.scale.gameSize.width;
        const H = this.scale.gameSize.height;
        const audioManager = this.registry.get("audioManager");

        // 🔊 sonido al mostrar el mensaje de victoria
        audioManager?.playSFX(ASSETS.ui_success.key, 0.35);

        const html = `
           <div class="${css.resultContainer}" style="width:${W}px; height:${H}px;">
                <div class="${css.resultPanel}">
                    <div class="${css.resultText}">
                        * Has completado todas las casas.<br>
                        * El pueblo está en paz gracias a ti.<br>
                        * Es hora de ver tus resultados...
                    </div>
                    <div class="${css.resultActions}">
                        <button id="btn-end"class="${css['panel-button']}">▶ Ver resultados</button>
                    </div>
                </div>
            </div>
        `;

        const dom = this.add.dom(W / 2, H / 2)
            .setOrigin(0.5)
            .setDepth(100)
            .setScrollFactor(0)
            .setScale(1 / ZOOM)
            .createFromHTML(html);

        const btn = (dom.node as HTMLDivElement).querySelector('#btn-end') as HTMLButtonElement;

        const goToEnd = () => {
            audioManager?.playSFX(ASSETS.ui_confirm.key, 0.2)
            dom.destroy();
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('EndGame');
            });
        };

        btn.onclick = goToEnd;

        // También Enter
        this.input.keyboard!.once('keydown-ENTER', goToEnd);
    }

    // ========================================================================
    // UPDATE
    // ========================================================================
    update(): void {
        this.handlePlayerMovement();
        this.checkHouseEntrance();

        // Mostrar/ocultar burbujas según proximidad
        updateNpcBubbles(this, this.npcs, this.player.x, this.player.y);

        // Abrir diálogo con Espacio o Enter
        checkNpcInteraction(
            this,
            this.npcs,
            this.player.x,
            this.player.y,
            this.cursors,
            this.enterKey  // Phaser.Input.Keyboard.Key — el mismo que ya tienes
        );

        this.checkGameCompletion();
    }

    // ========================================================================
    // PLAYER MOVEMENT
    // ========================================================================
    private handlePlayerMovement(): void {
        const { left, right, up, down } = this.cursors;

        let vx = 0;
        let vy = 0;

        if (left.isDown) vx = -this.playerSpeed;
        if (right.isDown) vx = this.playerSpeed;
        if (up.isDown) vy = -this.playerSpeed;
        if (down.isDown) vy = this.playerSpeed;

        // diagonal
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }

        // walkable check
        const margin = 6;
        if (vx !== 0 && !this.isWalkableAt(this.player.x + Math.sign(vx) * margin, this.player.y)) vx = 0;
        if (vy !== 0 && !this.isWalkableAt(this.player.x, this.player.y + Math.sign(vy) * margin)) vy = 0;

        this.player.setVelocity(vx, vy);

        const moving = vx !== 0 || vy !== 0;

        if (moving) {
            const now = this.time.now;

            if (now - this.lastStepTime > this.STEP_DELAY) {
                const audioManager = this.registry.get("audioManager");

                audioManager?.playSFX(ASSETS.footStep.key, 0.2, {
                    detune: Phaser.Math.Between(-100, 100)
                });

                this.lastStepTime = now;
            }
        }

        if (vy < 0) { this.lastDir = 'up'; this.playAnim('player-walk-up'); }
        else if (vy > 0) { this.lastDir = 'down'; this.playAnim('player-walk-down'); }
        else if (vx < 0) { this.lastDir = 'left'; this.playAnim('player-walk-left'); }
        else if (vx > 0) { this.lastDir = 'right'; this.playAnim('player-walk-right'); }
        else { this.playAnim(`player-idle-${this.lastDir}`); }
    }

    // ========================================================================
    // INTERIOR
    // ========================================================================
    private checkHouseEntrance(): void {
        for (const entrance of HOUSE_ENTRANCES) {
            const offsetX = 0;
            const offsetY = -10;

            const dx = Math.abs(this.player.x - (entrance.x + offsetX));
            const dy = Math.abs(this.player.y - (entrance.y + offsetY));

            if (dx < 8 && dy < 8) {
                this.scene.start('Interior', {
                    interiorKey: entrance.interiorKey,
                    exitX: entrance.x,
                    exitY: entrance.y,
                });
            }
        }
    }

    // ========================================================================
    // FINISH GAME
    // ========================================================================
    private checkGameCompletion(): void {
        if (this.gameFinished) return;

        const total = getTotalQuestions();
        const answered = globalState.answeredQuestions;

        if (answered >= total && total > 0) {
            this.gameFinished = true;
            this.physics.pause();

            // 🔥 esperar 1.5 segundos antes de mostrar el mensaje
            this.time.delayedCall(1500, () => {
                this.showVictoryMessage();
            });
        }
    }
}