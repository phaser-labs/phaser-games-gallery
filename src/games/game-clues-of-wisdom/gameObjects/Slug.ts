import Phaser from 'phaser';

import { Player } from './Player';

export class SlugEnemy extends Phaser.Physics.Arcade.Sprite {
  private initialX: number;
  private patrolDistance: number;
  private moveSpeed: number;
  private patrolDirection: number = 1; 

  private isDying: boolean = false;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    frameKey: string | number | undefined,
    distance: number,
    speed: number = 20,
    initialDir: 1 | -1 = 1
  ) {
    super(scene, x, y, textureKey, frameKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.initialX = this.x;
    this.patrolDistance = distance;
    this.moveSpeed = speed;
    this.patrolDirection = initialDir;

    const arcadeBody = this.body as Phaser.Physics.Arcade.Body;
    if (arcadeBody) {
      arcadeBody.setAllowGravity(true);
      arcadeBody.setGravityY(500);
      arcadeBody.setCollideWorldBounds(true);
      arcadeBody.setBounce(0, 0.2);
      this.setScale(1.4);

      arcadeBody.setSize(this.width * 0.8, this.height * 0.35);
      arcadeBody.setOffset(this.width * 0.05, this.height * 0.3);

      // Establecer velocidad inicial
      arcadeBody.setVelocityX(this.moveSpeed * this.patrolDirection);
    } else {
      console.error('[SlugEnemy] ERROR: no hay cuerpo definido.');
    }

    this.anims.play('slug', true);

    this.setFlipX(true);
    if (this.patrolDirection === -1) {
      this.setFlipX(false);
    }
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.isDying || !this.body || !this.body.enable) return;
    const arcadeBody = this.body as Phaser.Physics.Arcade.Body;

    // Solo patrulla si está en el suelo
    const isOnGround = arcadeBody.blocked.down || arcadeBody.touching.down;

    if (isOnGround) {
      if (this.patrolDirection === 1 && this.x >= this.initialX + this.patrolDistance) {
        // Moviéndose a la derecha, llegó al límite
        this.patrolDirection = -1;
        arcadeBody.setVelocityX(this.moveSpeed * this.patrolDirection);
        this.setFlipX(false); // Mirar a la izquierda
      } else if (this.patrolDirection === -1 && this.x <= this.initialX - this.patrolDistance) {
        // Moviéndose a la izquierda, llegó al límite
        this.patrolDirection = 1;
        arcadeBody.setVelocityX(this.moveSpeed * this.patrolDirection);
        this.setFlipX(true); // Mirar a la derecha
      } else if (arcadeBody.velocity.x === 0 && this.patrolDirection !== 0) {
        arcadeBody.setVelocityX(this.moveSpeed * this.patrolDirection);
      }
    }

    if (arcadeBody.blocked.right) {
      this.patrolDirection = -1;
      arcadeBody.setVelocityX(this.moveSpeed * this.patrolDirection);
      this.setFlipX(false);
    } else if (arcadeBody.blocked.left) {
      this.patrolDirection = 1;
      arcadeBody.setVelocityX(this.moveSpeed * this.patrolDirection);
      this.setFlipX(true);
    }
  }

  
public getHitByPlayer(player: Player): void {
    if (this.isDying || !this.active || !player.body || !this.body) {
        return;
    }

    const arcadePlayerBody = player.body as Phaser.Physics.Arcade.Body;
    const arcadeEnemyBody = this.body as Phaser.Physics.Arcade.Body;

 
    const isPlayerFalling = arcadePlayerBody.velocity.y > 0;
    
    const playerFeet = arcadePlayerBody.bottom;
    const enemyHead = arcadeEnemyBody.top;
    const previousPlayerFeet = arcadePlayerBody.prev.y + arcadePlayerBody.height;

    // --- Lógica para CUANDO EL JUGADOR PISA AL ENEMIGO ---
    if (
        isPlayerFalling &&
        previousPlayerFeet <= enemyHead && 
        playerFeet >= enemyHead - 5
    ) {
        this.scene.sound.play('enemy-death', { volume: 0.5 }); 
        // Hacer que el jugador rebote
        arcadePlayerBody.setVelocityY(-200);
        if (player.play) { 
             player.play('player_jump', true);
        }


        this.die();
    }
    // --- Lógica para CUANDO EL ENEMIGO CHOCA CON EL JUGADOR
    else {
        player.takeDamage(1); // El jugador recibe 1 punto de daño
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
