/* eslint-disable @typescript-eslint/no-explicit-any */
import Phaser from 'phaser';

import { Player } from './Player';

export class PiranhaPlantEnemy extends Phaser.Physics.Arcade.Sprite {
    private attackRange: number;
    private isAttacking: boolean = false;
    private isDying: boolean = false;

    private attackTimer: Phaser.Time.TimerEvent | null = null;
    private attackAnimationDuration: number = 900;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        textureKey: string, // 'atlas'
        frameKey: string | number | undefined,
        attackRange: number = 80 
    ) {
        super(scene, x, y, textureKey, frameKey);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.attackRange = attackRange;
        this.setOrigin(0.5, 1)
        this.setScale(1.2); 

        const arcadeBody = this.body as Phaser.Physics.Arcade.Body;
        if (arcadeBody) {
            arcadeBody.setAllowGravity(true);
            arcadeBody.setImmovable(true);
            arcadeBody.setCollideWorldBounds(true);
            arcadeBody.setSize(this.width * 0.7, this.height * 0.9);
            arcadeBody.setOffset(this.width * 0.15, this.height * 0.05);
        } else {
            console.error('[PiranhaPlantEnemy] ERROR: this.body no se inicializó.');
        }

        this.anims.play('piranha_idle', true);
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        if (this.isDying || !this.active || !this.body || !this.body.enable) {
            return;
        }

        const player = (this.scene as any).player as Player;

        if (player && player.active) {
            const distanceToPlayer = Phaser.Math.Distance.Between(
                this.x,
                this.y - this.height / 2,
                player.x,
                player.y
            );

            if (distanceToPlayer <= this.attackRange) {
                if (!this.isAttacking) {
                    this.startAttack();
                }
            } else {
                if (this.isAttacking) {
                  this.anims.play('piranha_idle', true);
                }
            }

            // Orientación
            if (player.x < this.x) {
                this.setFlipX(false);
            } else {
                this.setFlipX(true);
            }
        } else if (this.isAttacking) {
            this.stopAttack();
        }
    }

    private startAttack(): void {
        if (this.isAttacking || this.isDying) return;

        this.isAttacking = true;
        this.anims.play('piranha_attack', true);
       
        if (this.attackTimer) this.attackTimer.remove();
        this.attackTimer = this.scene.time.delayedCall(this.attackAnimationDuration, () => {
           
             if(this.active && !this.isDying) {
                const player = (this.scene as any).player as Player;
                 if (player && player.active) {
                     const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y - this.height / 2, player.x, player.y);
                     if (distanceToPlayer > this.attackRange) {
                         this.stopAttack();
                     } else {
                         this.anims.play('piranha_attack', true);
                          this.attackTimer = this.scene.time.delayedCall(this.attackAnimationDuration, this.startAttack, [], this);
                     }
                 } else {
                     this.stopAttack();
                 }
             }
        }, [], this);
    }

    private stopAttack(): void {
        if (!this.isAttacking && !this.anims.isPlaying && this.anims.currentAnim?.key !== 'piranha_attack') return;
        
        this.isAttacking = false;
        if (this.attackTimer) {
            this.attackTimer.remove();
            this.attackTimer = null;
        }
        if (this.active && !this.isDying) {
            this.anims.play('piranha_idle', true);
            // console.log("Planta volviendo a idle");
        }
    }

    // Este método se llama cuando el CUERPO PRINCIPAL de la planta es tocado por el jugador
    public getHitByPlayer(player: Player): void {
        if (this.isDying || !this.active || !player.body || !this.body) return;

        const arcadePlayerBody = player.body as Phaser.Physics.Arcade.Body;
        const arcadeEnemyBody = this.body as Phaser.Physics.Arcade.Body;

        // Condición para PISAR la planta
        if (
            arcadePlayerBody.velocity.y > 0 &&
            player.getBounds().bottom < arcadeEnemyBody.top + (arcadeEnemyBody.height * 0.55) // Ajusta este umbral
        ) {
            console.log('Planta Piraña pisada!');
            this.scene.sound.play('enemy-death', {volume: 0.7});
            arcadePlayerBody.setVelocityY(-150); 
            this.die();
        }
        // Condición para que la PLANTA DAÑE AL JUGADOR
        else if (this.isAttacking) {
            player.takeDamage(1, this.x > player.x); 
            console.log('Jugador dañado por Planta Piraña atacando');
        }
    }

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