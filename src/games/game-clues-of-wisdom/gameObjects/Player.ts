import Phaser from 'phaser';

export const PLAYER_HEALTH_CHANGED_EVENT = 'playerHealthChanged';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public health!: number;
  public maxHealth: number = 3;
  private moveSpeed: number = 100;
  private jumpSpeed: number = 210;
  private climbSpeed: number = 80;

  private isHurt: boolean = false;
  private hurtCooldown: number = 600;
  private knockbackPower: { x: number; y: number } = { x: 75, y: 150 };

  // Teclas
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  // Estados del jugador
  private isJumping: boolean = false;
  private isDucking: boolean = false;
  public isOnLadder: boolean = false;
  private isTouchingLadder: boolean = false;

  // Para el parpadeo de invencibilidad
  private invincibilityTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'atlas');

    this.health = this.maxHealth; // Iniciar con salud máxima

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.body?.setSize(this.width * 0.3, this.height * 0.6);
    this.setOrigin(0.5, 0.5);

    if (this.scene.input.keyboard) {
      this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keySpace = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    this.play('player_idle');
  }

  public setTouchingLadder(isTouching: boolean): void {
    this.isTouchingLadder = isTouching;

    if (!isTouching && this.isOnLadder) {
      this.isOnLadder = false;
      (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
    }
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (!this.active || !this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;

    if (this.isTouchingLadder) {
      if (this.keyW?.isDown || this.keyS?.isDown) {
        this.isOnLadder = true;
      }
    } else {
      if (this.isOnLadder) {
        this.isOnLadder = false;
      }
    }

    // --- Logica de escaleras ---
    if (this.isOnLadder) {
      body.setAllowGravity(false);

      if (this.keyW?.isDown) {
        body.setVelocityY(-this.climbSpeed);
        this.play('player_climb', true);
      } else if (this.keyS?.isDown) {
        body.setVelocityY(this.climbSpeed);
        this.play('player_climb', true);
      } else {
        body.setVelocityY(0);
        if (this.anims.currentAnim?.key === 'player_climb') {
          this.anims.stop();
          this.setFrame('player-climb/player-climb-1'); // Frame de agarrado
        }
      }

      if (this.keyA?.isDown) {
        this.isOnLadder = false;
        body.setAllowGravity(true);
        body.setVelocityX(-this.moveSpeed * 0.5);
        this.setFlipX(true);
      } else if (this.keyD?.isDown) {
        this.isOnLadder = false;
        body.setAllowGravity(true);
        body.setVelocityX(this.moveSpeed * 0.5);
        this.setFlipX(false);
      }

      if (!this.isOnLadder) body.setAllowGravity(true); // Reactivar gravedad si se despegó

      return;
    }

    // --- Logica de gravedad ---
    body.setAllowGravity(true);

    if (onGround) {
      this.isJumping = false;
    }

    if (body.velocity.y > 0 && !onGround) {
      this.play('player_fall', true);
    }

    // Movimiento horizontal
    if (this.keyA?.isDown) {
      this.setVelocityX(-this.moveSpeed);
      this.setFlipX(true);
      if (onGround) this.play('player-skip', true);
    } else if (this.keyD?.isDown) {
      this.setVelocityX(this.moveSpeed);
      this.setFlipX(false);
      if (onGround) this.play('player-skip', true);
    } else {
      this.setVelocityX(0);
      // La animación de idle o duck se decide más abajo
    }

    // Salto
    if ((this.keyW?.isDown || this.keySpace?.isDown) && onGround && !this.isDucking) {
      this.setVelocityY(-this.jumpSpeed);
      this.isJumping = true;
      this.scene.sound.play('jump', { volume: 0.1 });
      // La animación de salto/caída se maneja más abajo
    }

    // Agacharse
    if (this.keyS?.isDown && onGround && !this.isJumping) {
      this.isDucking = true;
      this.play('player_duck', true);
    } else {
      this.isDucking = false;
    }

    // Decidir animación final basada en el estado si está en el suelo
    if (onGround) {
      if (body.velocity.x !== 0 && !this.isDucking) {
        // Corriendo
        this.play('player-skip', true);
      } else if (body.velocity.x === 0 && !this.isDucking && !this.isJumping) {
        // Idle
        this.play('player_idle', true);
      } else if (this.isDucking) {
        // Agachado
        this.play('player_duck', true);
      }
    } else {
      if (body.velocity.y < 0) {
        this.play('player_jump', true);
      } else if (body.velocity.y > 0) {
        this.play('player_fall', true);
      }
    }
  }
  public takeDamage(amount: number, damageFromRight?: boolean): void {
    if (this.isHurt || !this.active || !this.body) return;

    this.isHurt = true;
    this.health = Math.max(0, this.health - amount);
    this.scene.sound.play('hurt', { volume: 0.2 });

    this.scene.game.events.emit(PLAYER_HEALTH_CHANGED_EVENT, this.health, this.maxHealth);

    this.play('player_hurt', true);
    this.setFrame('player-hurt/player-hurt-2');

    if (this.invincibilityTween) {
      this.invincibilityTween.stop();
      this.setAlpha(1);
    }

    this.invincibilityTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      ease: 'Power1',
      duration: 100,
      yoyo: true,
      repeat: Math.floor(this.hurtCooldown / (100 * 2)) - 1
    });

    const body = this.body as Phaser.Physics.Arcade.Body;
    let knockbackVelX: number;

    if (damageFromRight !== undefined) {
      knockbackVelX = damageFromRight ? -this.knockbackPower.x : this.knockbackPower.x;
    } else {
      knockbackVelX = this.flipX ? this.knockbackPower.x : -this.knockbackPower.x;
    }
    body.setVelocity(knockbackVelX, -this.knockbackPower.y);

    if (this.health <= 0) {
      this.die();
    } else {
      this.scene.time.delayedCall(this.hurtCooldown, () => {
        this.isHurt = false;

        if (this.invincibilityTween) {
          this.invincibilityTween.stop();
        }
        this.setAlpha(1);
      });
    }
  }
  public collectHealthItem(amount: number = 1): void {
    if (!this.active || this.health >= this.maxHealth) return;

    this.health = Math.min(this.maxHealth, this.health + amount);
    this.scene.sound.play('carrot', { volume: 0.5 });
    console.log(`Zanahoria recolectada! Salud actual: ${this.health}`);

    this.scene.game.events.emit(PLAYER_HEALTH_CHANGED_EVENT, this.health, this.maxHealth);
  }

  private die(): void {
    if (!this.active) return;
    this.active = false;
    if (this.invincibilityTween) this.invincibilityTween.stop();
    this.setAlpha(1);

    this.play('player_hurt', true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, -300);
    body.setAllowGravity(true);
    body.setCollideWorldBounds(false);

   
 this.scene.scene.stop('UIScene');
  this.scene.cameras.main.fadeOut(1000, 0, 0, 0);

    this.scene.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.scene.start('endScene', { result: 'dead' });
    });
   
  }
}
