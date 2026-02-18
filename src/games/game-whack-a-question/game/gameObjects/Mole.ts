import Phaser from 'phaser';

import { AudioManager } from '../../utils/AudioManager';

export interface MoleConfig {
  x: number;
  y: number;
  scale: number;
  holeDepth: number;
  containerDepth: number;
}

export class Mole extends Phaser.GameObjects.Container {
  // Sprites del mole
  private hole: Phaser.GameObjects.Sprite;
  private moleBody: Phaser.GameObjects.Sprite;
  private hurtMole: Phaser.GameObjects.Sprite;
  private answerText: Phaser.GameObjects.DOMElement;

  // Estados del mole
  public isActive: boolean = false;
  public isVisible: boolean = false; // Si el mole está arriba o abajo
  public hasAnswer: boolean = false; // Si este mole tiene una opción de respuesta
  public correctAnswer: boolean = false;
  public answerIndex: number = 0;
  public isBeingHit: boolean = false; // Indica si el mole está en proceso de ser golpeado

  private isSelected: boolean = false;
  private glowEffect?: Phaser.FX.Glow;

  // Timer para comportamiento dinámico
  public popTimer?: Phaser.Time.TimerEvent;

  // Callback para cuando se hace clic en el mole
  private onClickCallback?: (mole: Mole) => void;
  
  // AudioManager global
  private audioManager?: AudioManager;

  constructor(scene: Phaser.Scene, config: MoleConfig) {
    super(scene, config.x, config.y);

    // Obtener AudioManager del registry global
    this.audioManager = scene.registry.get('audioManager') as AudioManager;

    // Añadir el container a la escena
    scene.add.existing(this);

    // Crear el sprite del agujero - inicia en vacio
    this.hole = scene.add
      .sprite(config.x, config.y + 1, 'hole', 9)
      .setScale(config.scale)
      .setDepth(config.holeDepth);

    // Crea el sprite del topo normal - inicia en escondido
    this.moleBody = scene.add.sprite(0, 0, 'mole', 9).setScale(config.scale);

    // Crea el sprite del topo herido (inicialmente invisible)
    this.hurtMole = scene.add.sprite(0, 0, 'hurt-mole', 8).setScale(config.scale).setVisible(false);

    // Texto encima del topo como elemento HTML (inicialmente oculto)
    this.answerText = scene.add
      .dom(0, 62, 'p', '', '')
      .setClassName('mole-answer-text')
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    // Añadir los sprites al container
    this.add([this.moleBody, this.hurtMole, this.answerText]);
    this.setDepth(config.containerDepth);

    // Configurar interactividad
    this.moleBody.setInteractive();
    this.moleBody.on('pointerdown', () => this.handleClick());

    this.hurtMole.setInteractive();
    this.hurtMole.on('pointerdown', () => this.handleClick());
  }

  /**
   * Configura el mole con una respuesta
   */
  public setAnswer(answerText: string, isCorrect: boolean, index: number): void {
    this.hasAnswer = true;
    this.correctAnswer = isCorrect;
    this.answerIndex = index;
    // Actualizar el contenido del elemento HTML
    const element = this.answerText.node as HTMLParagraphElement;
    element.textContent = answerText;
  }

  /**
   * Limpia la respuesta del mole
   */
  public clearAnswer(): void {
    this.hasAnswer = false;
    this.correctAnswer = false;
    const element = this.answerText.node as HTMLParagraphElement;
    element.textContent = '';
    this.answerText.setVisible(false);
  }

  /**
   * Resetea el mole a su estado inicial
   */
  public reset(): void {
    this.isActive = true;
    this.isVisible = false;
    this.hasAnswer = false;
    this.correctAnswer = false;
    const element = this.answerText.node as HTMLParagraphElement;
    element.textContent = '';
    this.answerText.setVisible(false);
    this.moleBody.clearTint();
    this.moleBody.setVisible(true);
    this.hurtMole.setVisible(false);
    this.moleBody.play('mole-idle-down');
    this.hole.play('hole-idle-down');

    // Desactivar el glow de selección
    this.setFocus(false);

    // Limpiar timer si existe
    if (this.popTimer) {
      this.popTimer.destroy();
      this.popTimer = undefined;
    }
  }

  /**
   * Hace que el mole suba
   */
  public popUp(onComplete?: () => void): void {
    if (this.isVisible) return;

    // Asegurar que se muestra el mole normal, no el herido
    this.moleBody.setVisible(true);
    this.hurtMole.setVisible(false);

    this.isVisible = true;
    this.moleBody.play('mole-up');
    this.hole.play('hole-up');

    // Mostrar el texto si el mole tiene una respuesta
    const element = this.answerText.node as HTMLParagraphElement;
    if (this.hasAnswer && element.textContent) {
      this.answerText.setVisible(true);
    }

    this.moleBody.once('animationcomplete', () => {
      this.moleBody.play('mole-idle-up');
      this.hole.play('hole-idle-up');

      if (onComplete) {
        onComplete();
      }
    });
  }

  /**
   * Hace que el mole se esconda
   */
  public popDown(onComplete?: () => void): void {
    if (!this.isVisible) return;

    this.isVisible = false;
    this.moleBody.play('mole-down');
    this.hole.play('hole-down');

    // Ocultar el texto cuando el mole baja
    this.answerText.setVisible(false);
    
    // Desactivar el glow de selección
    this.setFocus(false);

    this.moleBody.once('animationcomplete', () => {
      this.moleBody.play('mole-idle-down');
      this.hole.play('hole-idle-down');

      if (onComplete) {
        onComplete();
      }
    });
  }

  /**
   * Anima al mole siendo golpeado
   */
  public hit(onComplete?: () => void): void {
    // Desactivar el mole durante la animación para evitar conflictos
    const wasActive = this.isActive;
    this.isActive = false;
    this.isBeingHit = true; // Marcar que está siendo golpeado
    
    // Reproducir sonido de golpe
    this.audioManager?.play('hurt_sound', { volume: 0.01 });
    // Desactivar el glow de selección
    this.setFocus(false);
    
      // Reemplazar mole normal por mole herido
      this.moleBody.setVisible(false);
    this.hurtMole.setVisible(true);
    this.hurtMole.setFrame(0);

    // Ocultar el texto inmediatamente
    this.answerText.setVisible(false);


    // Mantener el frame inicial del mole herido por 1segs antes de bajar
    this.scene.time.delayedCall(1000, () => {
      // Animar el mole herido bajando
      this.hurtMole.play('mole-hurt');
      this.hole.play('hole-down');

      // Cuando termine la animación, restaurar
      this.hurtMole.once('animationcomplete', () => {
        this.hurtMole.setVisible(false);
        this.moleBody.setVisible(true);
        this.moleBody.play('mole-idle-down');
        this.hole.play('hole-idle-down');
        this.isVisible = false;
        this.isBeingHit = false; // Marcar que terminó de ser golpeado
        
        // Reactivar el mole solo si estaba activo antes
        if (wasActive) {
          this.isActive = true;
        }

        if (onComplete) {
          onComplete();
        }
      });
    });
  }

  /**
   * Fuerza el mole a bajar sin animación
   */
  public forceDown(): void {
    this.isVisible = false;
    this.answerText.setVisible(false);
    this.moleBody.setVisible(true);
    this.hurtMole.setVisible(false);
    this.moleBody.play('mole-idle-down');
    this.hole.play('hole-idle-down');
    
    // Desactivar el glow de selección
    this.setFocus(false);
  }

  /**
   * Maneja el click en el mole
   */
  private handleClick(): void {
    if (!this.isActive || !this.isVisible) return;

    if (this.onClickCallback) {
      this.onClickCallback(this);
    }
  }

  /**
   * Establece el callback para cuando se hace clic en el mole
   */
  public setOnClickCallback(callback: (mole: Mole) => void): void {
    this.onClickCallback = callback;
  }

  /**
   * Limpia el timer de pop si existe
   */
  public clearPopTimer(): void {
    if (this.popTimer) {
      this.popTimer.destroy();
      this.popTimer = undefined;
    }
  }

  /**
   * Obtiene el agujero del mole (para configuraciones de depth)
   */
  public getHole(): Phaser.GameObjects.Sprite {
    return this.hole;
  }

  /**
   * Obtiene el texto de respuesta
   */
  public getAnswerText(): string {
    const element = this.answerText.node as HTMLParagraphElement;
    return element.textContent || '';
  }

 public setFocus(active: boolean): void {
  // Verificar que el moleBody exista y tenga postFX antes de continuar
  if (!this.moleBody || !this.moleBody.postFX) {
    return;
  }
  
  // Si ya está en el estado deseado, no hacemos nada (optimización)
  if (this.isSelected === active) return; 
  this.isSelected = active;

  if (active) {
    if (!this.glowEffect) {
      this.glowEffect = this.moleBody.postFX.addGlow(0xffff00, 4, 0);
      this.scene.tweens.add({
        targets: this.glowEffect,
        outerStrength: 6,
        duration: 500,
        yoyo: true,
        loop: -1
      });
    }
  } else {
    this.moleBody.postFX.clear();
    this.glowEffect = undefined;
    this.scene.tweens.killTweensOf(this.glowEffect || {});
  }
}

   public triggerWhack(): void {
    this.handleClick();
  }

  /**
   * Limpia los recursos antes de destruir el mole
   */
  public cleanup(): void {
    this.clearPopTimer();
    this.moleBody.off('pointerdown');
    this.hurtMole.off('pointerdown');
    this.hole.destroy();
  }

  /**
   * Destruye el mole y todos sus recursos
   */
  destroy(fromScene?: boolean): void {
    this.cleanup();
    super.destroy(fromScene);
  }
}
