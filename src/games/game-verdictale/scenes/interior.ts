import { Scene } from 'phaser';

import { globalState, isHouseCompleted } from '../global-state';
import { AnswerResult, Question } from '../types/types';
import { ASSETS, BattleManager, dismissEnemies, getClosestEnemy, playDamageAnimation, showEndModal } from '../utils';
import { assignQuestionsToHouses, createEnemies, Enemy } from '../utils';
import { announce, announceMessage } from '../utils/announce';

import css from '../styles/verdictale.module.css';

const ZOOM = 2;

const INTERIOR_TILESETS: Record<string, string> = {
    TilesetInteriorFloor: 'tilesets/TilesetInteriorFloor.png',
    TilesetInterior: 'tilesets/TilesetInterior.png',
    tileset_bed: 'tilesets/tileset_bed.png',
    TilesetElement: 'tilesets/TilesetElement.png',
    TilesetHouse: 'tilesets/TilesetHouse.png',
    TilesetVillageAbandoned: 'tilesets/TilesetVillageAbandoned.png',
};

const INTERIOR_COLLISION_LAYERS = ['walls', 'features', 'features2'];


export class Interior extends Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private walkableSet = new Set<string>();
    private map!: Phaser.Tilemaps.Tilemap;

    private interiorKey = '';
    private lastDir = 'down';
    private playerSpeed = 60;
    private canExit = false;
    private entryPosition = { x: 0, y: 0 };
    
    private lastStepTime = 0;
    private STEP_DELAY = 280; // ms (ajusta: 200–350)

    private exitPosition = { x: 0, y: 0 };

    private houseQuestions: Question[] = [];
    private enemies: Enemy[] = [];
    private battle!: BattleManager;

    private wasNearEntry = false;

    constructor() {
        super('Interior');
    }

    // ========================================================================
    // LIFECYCLE
    // ========================================================================
    init(data: { interiorKey: string; exitX: number; exitY: number }) {
        this.interiorKey = data.interiorKey;
        this.canExit = false;

        this.exitPosition = {
            x: data.exitX,
            y: data.exitY,
        };

        if (globalState.questionMap.size === 0) {
            globalState.questionMap = assignQuestionsToHouses(globalState.questions);
        }

        // Asignar preguntas a esta casa
        this.houseQuestions = globalState.questionMap.get(data.interiorKey) ?? [];
    }

    preload() {
        this.load.setPath('assets/game-verdictale/background');
        this.load.tilemapTiledJSON(this.interiorKey, `${this.interiorKey}.json`);

        Object.entries(INTERIOR_TILESETS).forEach(([name, path]) => {
            if (!this.textures.exists(name)) {
                this.load.image(name, path);
            }
        });
    }

    create() {
        this.createMap();
        this.createPlayer();
        this.setupCamera();
        this.setupInput();

        // ✅ Crear siempre el BattleManager, antes del early return
        this.createBattleManager();

        if (isHouseCompleted(this.interiorKey)) {
            this.createMessage();

            this.canExit = true;
            return; // 🚨 ESTO sí corta create()
        }

        this.createEnemies();

        // 🔥 reanudar audio
        if ("context" in this.sound) {
            const manager = this.sound as Phaser.Sound.WebAudioSoundManager;
            manager.context.resume();
        }

        const audioManager = this.registry.get("audioManager");

        if (!audioManager.isMusicPlaying()) {
            audioManager.playMusic(ASSETS.menu_music.key);
        }

        this.time.delayedCall(800, () => {
            this.canExit = true;
        });
    }

    update(): void {
        if (!this.cursors) return;

        this.handlePlayerMovement();

        // 🔥 ANNOUNCE SALIDA
        const isNear = this.isNearEntry();
        if (isNear && !this.wasNearEntry) {
            announce('Estás en la salida. Presiona flecha abajo para salir.');
        }
        this.wasNearEntry = isNear;

        if (
            this.canExit &&
            isNear &&
            Phaser.Input.Keyboard.JustDown(this.cursors.down!)
        ) {
            this.scene.start('Game', {
                spawnX: this.exitPosition.x,
                spawnY: this.exitPosition.y + 10
            });
        }

        if (this.battle.isBlocking) {
            this.battle.update();
            return;
        }

        this.checkBattle();
    }

    // ========================================================================
    // MAP
    // ========================================================================
    private createMap(): void {
        this.map = this.make.tilemap({ key: this.interiorKey });

        const tilesets: Phaser.Tilemaps.Tileset[] = [];
        this.map.tilesets.forEach(tilesetData => {
            if (!INTERIOR_TILESETS[tilesetData.name]) return;
            const tileset = this.map.addTilesetImage(tilesetData.name, tilesetData.name);
            if (tileset) tilesets.push(tileset);
        });

        this.map.layers.forEach((layerData, index) => {
            const layer = this.map.createLayer(layerData.name, tilesets, 0, 0);
            if (!layer) return;
            layer.setDepth(index);
        });

        this.walkableSet = this.buildWalkableSet();
    }

    // ========================================================================
    // WALKABLE SET
    // ========================================================================
    private buildWalkableSet(): Set<string> {
        const walkable = new Set<string>();

        const floorLayer = this.map.getLayer('floor');
        if (floorLayer) {
            floorLayer.data.forEach(row => {
                row.forEach(tile => {
                    if (tile.index > 0) walkable.add(`${tile.x}_${tile.y}`);
                });
            });
        }

        INTERIOR_COLLISION_LAYERS.forEach(name => {
            const layer = this.map.getLayer(name);
            if (!layer) return;
            layer.data.forEach(row => {
                row.forEach(tile => {
                    if (tile.index > 0) walkable.delete(`${tile.x}_${tile.y}`);
                });
            });
        });

        return walkable;
    }

    private isWalkableAt(worldX: number, worldY: number): boolean {
        const tx = this.map.worldToTileX(worldX);
        const ty = this.map.worldToTileY(worldY);
        if (tx === null || ty === null) return false;
        return this.walkableSet.has(`${tx}_${ty}`);
    }

    // ========================================================================
    // ENTRY POSITION
    // ========================================================================
    private getEntryPosition(): { x: number; y: number } {
        const floorLayer = this.map.getLayer('floor');
        if (!floorLayer) return this.getFallbackPosition();

        const data = floorLayer.data;

        for (let row = 0; row < data.length; row++) {
            for (let col = 0; col < data[row].length; col++) {
                const tile = data[row][col];
                if (!tile || tile.index === -1) continue;

                if (tile.properties?.entry === true) {
                    return {
                        x: tile.getCenterX(),
                        y: tile.getCenterY(),
                    };
                }
            }
        }

        return this.getFallbackPosition();
    }
    private getFallbackPosition() {
        return {
            x: this.map.widthInPixels / 2,
            y: this.map.heightInPixels / 2,
        };
    }

    // ========================================================================
    // PLAYER
    // ========================================================================
    private createPlayer(): void {
        this.entryPosition = this.getEntryPosition();

        this.player = this.physics.add
            .sprite(this.entryPosition.x, this.entryPosition.y, ASSETS.player.idle.key)
            .setDepth(50);

        this.player.setBodySize(10, 10);
        this.player.play('player-idle-up');
    }

    // ========================================================================
    // ENEMIES
    // ========================================================================
    private createEnemies(): void {
        this.enemies = createEnemies(this, this.houseQuestions, this.map);

        this.enemies.forEach(enemy => {
            this.physics.add.collider(this.player, enemy.sprite);
        });
    }

    private createMessage(): void {
        const width = this.scale.gameSize.width;
        const height = this.scale.gameSize.height;

        const html = `
            <div class="${css.resultContainer}" style="width:${width}px; height:${height}px;">
                <div class="${css.resultPanel}">
                    <div class="${css.resultTitle} ${css.correct}">* ¡Casa completada!</div>
                    <div class="${css.resultText}">Ya respondiste todas las preguntas aquí.</div>
                </div>
            </div>
        `;

        const dom = this.add.dom(width / 2, height / 2)
            .setOrigin(0.5).setDepth(100)
            .setScrollFactor(0).setScale(1 / ZOOM)
            .createFromHTML(html);

        this.time.delayedCall(2500, () => dom.destroy());

        announceMessage(
            'Casa completada',
            'Ya respondiste todas las preguntas aquí. Puedes moverte y salir con la flecha abajo.'
        );
        return;
    }

    // ========================================================================
    // BATTLE
    // ========================================================================
    private createBattleManager(): void {
        this.battle = new BattleManager(
            this,
            // onAllAnswered — todas las preguntas respondidas
            () => {
                globalState.completedHouses.add(this.interiorKey);
                dismissEnemies(this, this.enemies);
                showEndModal(this, 'victory', () => { });
            },
            // onGameOver
            () => {
                showEndModal(this, 'gameover', () => {
                    globalState.lives = 3; // 🔥 resetear vidas
                    this.scene.restart({ interiorKey: this.interiorKey, exitX: this.exitPosition.x, exitY: this.exitPosition.y });
                });
            },
            // onDamage
            () => playDamageAnimation(this, this.player),
            // onAnswer
            (result) => this.emitResult(result)
        );
    }

    // ========================================================================
    // CAMERA
    // ========================================================================
    private setupCamera(): void {
        const cam = this.cameras.main;

        const mapHeight = this.map.heightInPixels;

        const screenHeight = this.scale.height;

        cam.setZoom(ZOOM);
        cam.setRoundPixels(true);

        // 🔥 ESTE ES EL QUE TIENES QUE MODIFICAR
        const offsetY = -70; // 👈 ajusta este número

        cam.scrollX = 30;
        cam.scrollY = (mapHeight - screenHeight / ZOOM) / 2 + offsetY;
    }

    // ========================================================================
    // INPUT
    // ========================================================================
    private setupInput(): void {
        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    private isNearEntry(): boolean {

        const dx = this.player.x - this.entryPosition.x;
        const dy = this.player.y - this.entryPosition.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < 10; // 🔥 ajusta radio
    }

    private emitResult(result: AnswerResult): void {
        const cb = this.game.registry.get('onResultCallback') as ((r: AnswerResult) => void) | undefined;
        cb?.(result);
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

        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }

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

        if (vy < 0) { this.lastDir = 'up'; this.player.play('player-walk-up', true); }
        else if (vy > 0) { this.lastDir = 'down'; this.player.play('player-walk-down', true); }
        else if (vx < 0) { this.lastDir = 'left'; this.player.play('player-walk-left', true); }
        else if (vx > 0) { this.lastDir = 'right'; this.player.play('player-walk-right', true); }
        else { this.player.play(`player-idle-${this.lastDir}`, true); }
    }

    private checkBattle(): void {
        if (this.battle.isActive) return;

        const closest = getClosestEnemy(this.enemies, this.player.x, this.player.y, 32);
        if (closest) {
            this.battle.startBattle(closest);
        }
    }
}