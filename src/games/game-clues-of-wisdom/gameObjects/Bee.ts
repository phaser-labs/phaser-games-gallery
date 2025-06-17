/* eslint-disable @typescript-eslint/no-explicit-any */

import Phaser from 'phaser';

import { Player } from './Player';

export class BeeEnemy extends Phaser.Physics.Arcade.Sprite {
    private initialX: number;
    private initialY: number;
    public patrolDistance: number;
     public patrolDirection: number;
    private moveSpeed: number = 30; 
    private isHorizontalPatrol: boolean;

    private isDying: boolean = false; // Para evitar múltiples llamadas a 'die'

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        textureKey: string,
        frameKey: string | number | undefined,
        distance: number,
        horizontal: boolean // true si patrulla horizontalmente, false si verticalmente
    ) {
        super(scene, x, y, textureKey, frameKey);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.initialX = this.x;
        this.initialY = this.y;
        this.patrolDistance = distance;
        this.isHorizontalPatrol = horizontal;

        this.patrolDirection = horizontal ? 1 : -1;
        

        if (this.body) {
            const arcadeBody = this.body as Phaser.Physics.Arcade.Body;
           
         
            arcadeBody.setSize(this.width * 0.8, this.height * 0.7); 
            arcadeBody.setOffset(this.width * 0.1, this.height * 0.15);
            arcadeBody.setImmovable(false);
            arcadeBody.setCollideWorldBounds(false);
        } else {
            console.error('[BeeEnemy CONSTRUCTOR] ERROR: this.body no está definido!');
        }

        this.anims.play('bee', true); 
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta); 

        if (this.isDying || !this.body) return;

        if (this.isHorizontalPatrol) {
            this.horizontalMove();
        } else {
            this.verticalMove();
        }

        // Orientación opcional hacia el jugador
        if (this.scene && (this.scene as any).player && (this.scene as any).player.active) { // Verificar que player exista y esté activo
            const player = (this.scene as any).player as Player;
            if (player.x < this.x) {
                this.setFlipX(false); // Jugador a la izquierda, abeja mira a la izquierda
            } else {
                this.setFlipX(true); // Jugador a la derecha, abeja mira a la derecha
            }
        }
    }

    private verticalMove(): void {
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body.velocity.y > 0 && this.y >= this.initialY + this.patrolDistance) {
            body.setVelocityY(-this.moveSpeed); 
        } else if (body.velocity.y < 0 && this.y <= this.initialY - this.patrolDistance) {
            body.setVelocityY(this.moveSpeed);
        }
    }

    private horizontalMove(): void {
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body.velocity.x > 0 && this.x >= this.initialX + this.patrolDistance) {
            // Moviéndose a la derecha y ha alcanzado o superado el límite derecho
            body.setVelocityX(-this.moveSpeed);
        } else if (body.velocity.x < 0 && this.x <= this.initialX - this.patrolDistance) {
            // Moviéndose a la izquierda y ha alcanzado o superado el límite izquierdo
            body.setVelocityX(this.moveSpeed);
        }
    }

 public getHitByPlayer(player: Player): void {
    // Saltar encima del enemigo
    if (this.isDying || !player.body) return; // Asegurarse de que el cuerpo del jugador existe

    // Se verifica si el jugador está pisando al enemigo
    if (
        player.body &&
        this.body &&
        player.body.bottom < this.body.top + (this.body.height * 0.3) &&
        (player.body as Phaser.Physics.Arcade.Body).velocity.y > 0
    ) {
        console.log('Enemigo pisado!');
        this.scene.sound.play('enemy-death');
        this.play('player_jump', true); // Reproducir animación de salto del jugador

        (player.body as Phaser.Physics.Arcade.Body).setVelocityY(-200);
        this.die(); 
    } else {
        player.takeDamage(1);
    }
}

    // Método para destruir al enemigo
public die(): void {
    if (this.isDying || !this.active) return;

    this.isDying = true;

    if (this.body) {
        const arcadeBody = this.body as Phaser.Physics.Arcade.Body;
        arcadeBody.setVelocity(0, 0);
    }

    const anim = this.anims.play('enemy_death_anim', true);

    if (!anim) {
        console.error("ERROR: Falló al iniciar la animación 'enemy_death_anim'");

        this.scene.time.delayedCall(200, () => {
            if (this.scene) { 
                 this.setActive(false);
                 if (this.body) (this.body as Phaser.Physics.Arcade.Body).setEnable(false);
                 this.destroy();
            }
        });
        return;
    };

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (currentAnim: Phaser.Animations.Animation) => {
      
        if (currentAnim.key === 'enemy_death_anim') {
            this.setActive(false);
            if (this.body) {
                (this.body as Phaser.Physics.Arcade.Body).setEnable(false);
            }
            this.destroy();
        } 
    });

    this.scene.time.delayedCall(800, () => {
        if (this.scene && this.isDying && this.active !== false) {
            console.warn("Fallback: Destruyendo enemigo por temporizador porque ANIMATION_COMPLETE no se disparó o tardó demasiado.");
            this.setActive(false);
            if (this.body) (this.body as Phaser.Physics.Arcade.Body).setEnable(false);
            this.destroy();
        }
    }, [], this);
}
}