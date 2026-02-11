import Phaser from 'phaser';

import { WhackQuestion } from '../../game-whack-a-question';

/**
 * Interfaz mejorada usando Containers para agrupar elementos
 * Inspirado en el código de referencia con mejoras adicionales
 */
interface MoleContainer {
  container: Phaser.GameObjects.Container;
  hole: Phaser.GameObjects.Sprite;
  moleBody: Phaser.GameObjects.Sprite;
  hurtMole: Phaser.GameObjects.Sprite;
  text: Phaser.GameObjects.Text;
  isActive: boolean;
  isVisible: boolean; // Si el mole está arriba o abajo
  hasAnswer: boolean; // Si este mole tiene una opción de respuesta
  correctAnswer: boolean;
  answerIndex: number;
  initialY: number;
  hiddenY: number;
  popTimer?: Phaser.Time.TimerEvent; // Timer para aparecer/desaparecer
}

export class Main extends Phaser.Scene {
  private questions: WhackQuestion[] = [];
  private gameEvents!: Phaser.Events.EventEmitter;
  private currentQuestionIndex: number = 0;
  private moles: MoleContainer[] = [];
  private questionText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private timeLeft: number = 25; // 25 segundos por pregunta
  private timerEvent?: Phaser.Time.TimerEvent;
  private feedbackText!: Phaser.GameObjects.Text;
  private isAnswering: boolean = false;
  private lives: number = 3; // Sistema de vidas
  private speedMultiplier: number = 1.0; // Multiplicador de velocidad (aumenta con el tiempo)
  private map!: Phaser.Tilemaps.Tilemap;
  private spawnPoints: Phaser.Types.Tilemaps.TiledObject[] = [];
  molePopTimers: Phaser.Time.TimerEvent[] = []; // Timers para animaciones automáticas

  // Capas de nubes para el efecto parallax
  backgroudSky!: Phaser.GameObjects.Image;
  cloudsMedium!: Phaser.GameObjects.TileSprite;
  cloudsSmall!: Phaser.GameObjects.TileSprite;
  private readonly MAP_SCALE = 0.84; // Escala del mapa

  constructor() {
    super('gameScene');
  }

  init() {
    // Obtener datos del registry
    this.questions = this.registry.get('questionsData') || [];
    this.gameEvents = this.registry.get('gameEvents');
    this.currentQuestionIndex = 0;
    this.lives = 3; // Inicializar vidas

    if (this.questions.length === 0) {
      console.error('No hay preguntas disponibles');
    }
  }

  private createAnimations() {
    // === ANIMACIONES DEL MOLE ===
    // Animación de subir el topo (frame 9 escondido -> frame 0 visible)
    if (!this.anims.exists('mole-up')) {
      this.anims.create({
        key: 'mole-up',
        frames: this.anims.generateFrameNumbers('mole', { start: 9, end: 0 }),
        frameRate: 20,
        repeat: 0
      });
    }

    // Animación de bajar el topo (frame 0 visible -> frame 9 escondido)
    if (!this.anims.exists('mole-down')) {
      this.anims.create({
        key: 'mole-down',
        frames: this.anims.generateFrameNumbers('mole', { start: 0, end: 9 }),
        frameRate: 20,
        repeat: 0
      });
    }

    // Animación idle cuando está arriba (frame 0)
    if (!this.anims.exists('mole-idle-up')) {
      this.anims.create({
        key: 'mole-idle-up',
        frames: [{ key: 'mole', frame: 0 }],
        frameRate: 1
      });
    }

    // Animación idle cuando está escondido (frame 9)
    if (!this.anims.exists('mole-idle-down')) {
      this.anims.create({
        key: 'mole-idle-down',
        frames: [{ key: 'mole', frame: 9 }],
        frameRate: 1
      });
    }

    // === ANIMACIONES DEL MOLE HERIDO ===
    // Animación de bajada del topo herido (frame 0 arriba golpeado -> frame 8 escondido)
    if (!this.anims.exists('mole-hurt')) {
      this.anims.create({
        key: 'mole-hurt',
        frames: this.anims.generateFrameNumbers('hurt-mole', { start: 0, end: 8 }),
        frameRate: 13,
        repeat: 0
      });
    }

    // === ANIMACIONES DEL HOLE ===
    // Animación del agujero cuando sube el topo (frame 9 vacío -> frame 0 ocupado)
    if (!this.anims.exists('hole-up')) {
      this.anims.create({
        key: 'hole-up',
        frames: this.anims.generateFrameNumbers('hole', { start: 9, end: 0 }),
        frameRate: 20,
        repeat: 0
      });
    }

    // Animación del agujero cuando baja el topo (frame 0 ocupado -> frame 9 vacío)
    if (!this.anims.exists('hole-down')) {
      this.anims.create({
        key: 'hole-down',
        frames: this.anims.generateFrameNumbers('hole', { start: 0, end: 9 }),
        frameRate: 20,
        repeat: 0
      });
    }

    // Animación idle del agujero con topo visible (frame 0)
    if (!this.anims.exists('hole-idle-up')) {
      this.anims.create({
        key: 'hole-idle-up',
        frames: [{ key: 'hole', frame: 0 }],
        frameRate: 1
      });
    }

    // Animación idle del agujero vacío (frame 9)
    if (!this.anims.exists('hole-idle-down')) {
      this.anims.create({
        key: 'hole-idle-down',
        frames: [{ key: 'hole', frame: 9 }],
        frameRate: 1
      });
    }
  }

  create() {
    const { width, height } = this.scale;

    // --- FONDO CON PARALLAX ---
    // Fondo de cielo estático
    this.backgroudSky = this.add
      .image(0, -200, 'background_sky')
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setDepth(-2);

    // Nubes medianas (velocidad media)
    this.cloudsMedium = this.add
      .tileSprite(0, 0, width, height, 'clouds_medium')
      .setOrigin(0, 0)
      .setDepth(-1)
      .setScale(1.2);

    // Nubes pequeñas (más rápidas, más cerca)
    this.cloudsSmall = this.add
      .tileSprite(0, 50, width, height, 'clouds_small')
      .setOrigin(0, 0)
      .setDepth(-2)
      .setScale(1)
      .setAlpha(0.8);

    // Crear las animaciones de los sprites
    this.createAnimations();

    // --- MAPA TILEMAP

    this.map = this.make.tilemap({ key: 'mapa_bosque' });

    const tilesetGround = this.map.addTilesetImage('Topdown RPG 32x32 - Ground Tileset 1.2', 'tiles_ground');
    const tilesetTrees = this.map.addTilesetImage('Topdown RPG 32x32 - Trees 1.2', 'tiles_trees');

    if (!tilesetGround || !tilesetTrees) {
      console.error('No se encontraron los tilesets');
      return;
    }

    // Crear las capas - IMPORTANTE: ambas capas deben tener acceso a ambos tilesets
    const tierraLayer = this.map.createLayer('Tierra', [tilesetGround, tilesetTrees], 0, 0);
    const objetosLayer = this.map.createLayer('Objetos', [tilesetGround, tilesetTrees], 0, 0);

    // Escalar ambas capas con el mismo factor para que estén alineadas
    tierraLayer?.setScale(this.MAP_SCALE);
    objetosLayer?.setScale(this.MAP_SCALE);

    tierraLayer?.setDepth(0); // El pasto al fondo
    // La capa de Objetos (árboles) en depth 3 para que tapen a los topos si están atrás
    objetosLayer?.setDepth(3);

    // --- LOGICA DE OBJETOS (SPAWN TOPOS)

    const spawnLayer = this.map.getObjectLayer('SpawnTopos');

    if (spawnLayer) {
      this.spawnPoints = spawnLayer.objects;
      console.log('Puntos de spawn encontrados:', this.spawnPoints.length);
    } else {
      console.error('❌ No se encontró la capa SpawnTopos');
    }

    this.moles.forEach((m) => m.hole.setDepth(1));
    // Los contenedores de los topos en depth 2
    this.moles.forEach((m) => m.container.setDepth(2));

    // --- GUI

    // Texto de pregunta
    this.questionText = this.add
      .text(width / 2, 80, '', {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
        wordWrap: { width: width - 100 }
      })
      .setOrigin(0.5);

    // Timer
    this.timerText = this.add
      .text(width - 20, 20, '25', {
        fontSize: '24px',
        color: '#ffff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(1, 0);

    // Vidas
    this.livesText = this.add
      .text(20, 20, '❤️ x 3', {
        fontSize: '24px',
        color: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(0, 0);

    // Texto de feedback (oculto inicialmente)
    this.feedbackText = this.add
      .text(width / 2, height / 2, '', {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setVisible(false);

    // Crear agujeros y topos usando Containers
    this.createMoles();

    // Cargar primera pregunta
    this.loadQuestion();
  }

  private createMoles() {
    if (this.spawnPoints.length === 0) return;

    const maxMoles = Math.min(this.spawnPoints.length, 10);

    for (let index = 0; index < maxMoles; index++) {
      const spawnPoint = this.spawnPoints[index];

      // Coordenadas escaladas
      const posX = (spawnPoint.x || 0) * this.MAP_SCALE;
      const posY = (spawnPoint.y || 0) * this.MAP_SCALE;

      // El container permanece fijo en la posición del spawn
      const container = this.add.container(posX, posY);

      // Crear el sprite del agujero - inicia en frame 9 (vacío)
      const hole = this.add
        .sprite(posX, posY + 1, 'hole', 9)
        .setScale(1.5)
        .setDepth(3); // Entre la tierra y el topo

      // Crear el sprite del topo normal (64x64) - inicia en frame 9 (escondido)
      const moleBody = this.add.sprite(0, 0, 'mole', 9).setScale(1.5);

      // Crear el sprite del topo herido (inicialmente invisible)
      const hurtMole = this.add.sprite(0, 0, 'hurt-mole', 8).setScale(1.5).setVisible(false);

      // Texto encima del topo (inicialmente oculto)
      const text = this.add
        .text(0, -10, '', {
          fontSize: `${14 * this.MAP_SCALE}px`,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3,
          align: 'center',
          fontStyle: 'bold',
          wordWrap: { width: 60 * this.MAP_SCALE }
        })
        .setOrigin(0.5)
        .setVisible(false); // Inicialmente oculto

      container.add([moleBody, hurtMole, text]);
      container.setDepth(2); // Arriba del agujero, abajo de los árboles

      // Interactividad (zona de click del sprite)
      moleBody.setInteractive();
      moleBody.on('pointerdown', () => this.onMoleClicked(index));

      // También hacer interactivo el hurtMole
      hurtMole.setInteractive();
      hurtMole.on('pointerdown', () => this.onMoleClicked(index));

      this.moles.push({
        container,
        hole,
        moleBody,
        hurtMole,
        text,
        isActive: false,
        isVisible: false,
        hasAnswer: false,
        correctAnswer: false,
        answerIndex: index,
        initialY: posY,
        hiddenY: posY
      });
    }
  }

  private loadQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      // No hay más preguntas, terminar juego
      this.endGame();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];

    // Actualizar texto de pregunta
    this.questionText.setText(question.question);

    // Reiniciar estados
    this.timeLeft = 25;
    this.speedMultiplier = 1.0; // Reiniciar velocidad
    this.timerText.setText(`${this.timeLeft}`).setColor('#ffff00');
    this.isAnswering = false;

    // Detener timer anterior si existe
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    // Iniciar nuevo timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // Detener timers anteriores de moles
    this.stopAllMoleTimers();

    // Mostrar topos con las opciones después de un pequeño delay
    this.time.delayedCall(300, () => {
      this.showMoles(question);
      // Iniciar comportamiento dinámico de moles
      this.startDynamicMoleBehavior();
    });
  }

  private showMoles(question: WhackQuestion) {
    const numOptions = Math.min(question.options.length, this.moles.length);

    // Resetear todos los moles
    this.moles.forEach((mole) => {
      mole.hasAnswer = false;
      mole.isActive = true; // Todos están activos para el comportamiento dinámico
      mole.correctAnswer = false;
      mole.text.setText('');
      mole.text.setVisible(false); // Ocultar el texto inicialmente
      mole.moleBody.clearTint();

      // Asegurar que el mole normal esté visible y el herido oculto
      mole.moleBody.setVisible(true);
      mole.hurtMole.setVisible(false);

      // Forzar que todos estén escondidos
      mole.isVisible = false;
      mole.moleBody.play('mole-idle-down');
      mole.hole.play('hole-idle-down');
    });

    // Seleccionar índices aleatorios para las opciones de respuesta
    const selectedIndices = this.getRandomIndices(this.moles.length, numOptions);

    // Crear un array de índices de opciones y mezclarlo
    const optionIndices = Array.from({ length: numOptions }, (_, i) => i);
    Phaser.Utils.Array.Shuffle(optionIndices);

    // Asignar las opciones de respuesta a moles aleatorios con orden aleatorio
    selectedIndices.forEach((moleIndex, arrayPosition) => {
      const optionIndex = optionIndices[arrayPosition];
      const mole = this.moles[moleIndex];
      mole.hasAnswer = true;
      mole.correctAnswer = optionIndex === question.correctAnswer;
      mole.text.setText(question.options[optionIndex]);
    });
  }

  // Obtener índices aleatorios únicos
  private getRandomIndices(maxIndex: number, count: number): number[] {
    const indices: number[] = [];
    while (indices.length < count) {
      const randomIndex = Phaser.Math.Between(0, maxIndex - 1);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    return indices;
  }

  // Sistema dinámico de aparición/desaparición de moles
  private startDynamicMoleBehavior() {
    this.moles.forEach((mole, index) => {
      // Delay inicial aleatorio para cada mole
      const initialDelay = Phaser.Math.Between(100, 1000);
      console.log(mole);

      this.time.delayedCall(initialDelay, () => {
        this.scheduleMolePop(index);
      });
    });
  }

  private scheduleMolePop(moleIndex: number) {
    if (this.isAnswering) return;

    const mole = this.moles[moleIndex];
    if (!mole) return;

    // Si el mole está escondido, programar para que suba
    if (!mole.isVisible) {
      const basePopDelay = Phaser.Math.Between(500, 2000);
      const popDelay = basePopDelay / this.speedMultiplier; // Aplicar multiplicador

      mole.popTimer = this.time.delayedCall(popDelay, () => {
        this.popMoleUp(moleIndex);
      });
    }
  }

  private popMoleUp(moleIndex: number) {
    if (this.isAnswering) return;

    const mole = this.moles[moleIndex];
    if (!mole || mole.isVisible) return;

    // Asegurar que se muestra el mole normal, no el herido
    mole.moleBody.setVisible(true);
    mole.hurtMole.setVisible(false);

    mole.isVisible = true;
    mole.moleBody.play('mole-up');
    mole.hole.play('hole-up');

    // Mostrar el texto si el mole tiene una respuesta
    if (mole.hasAnswer && mole.text.text) {
      mole.text.setVisible(true);
    }

    mole.moleBody.once('animationcomplete', () => {
      mole.moleBody.play('mole-idle-up');
      mole.hole.play('hole-idle-up');

      // Programar para que baje después de un tiempo
      const baseStayUpTime = mole.hasAnswer
        ? Phaser.Math.Between(1500, 3000) // Moles con respuesta permanecen más tiempo
        : Phaser.Math.Between(800, 1500); // Distractores son más rápidos

      const stayUpTime = baseStayUpTime / this.speedMultiplier; // Aplicar multiplicador

      mole.popTimer = this.time.delayedCall(stayUpTime, () => {
        this.popMoleDown(moleIndex);
      });
    });
  }

  private popMoleDown(moleIndex: number) {
    if (this.isAnswering) return;

    const mole = this.moles[moleIndex];
    if (!mole || !mole.isVisible) return;

    mole.isVisible = false;
    mole.moleBody.play('mole-down');
    mole.hole.play('hole-down');

    // Ocultar el texto cuando el mole baja
    mole.text.setVisible(false);

    mole.moleBody.once('animationcomplete', () => {
      mole.moleBody.play('mole-idle-down');
      mole.hole.play('hole-idle-down');

      // Programar siguiente aparición
      this.scheduleMolePop(moleIndex);
    });
  }

  private stopAllMoleTimers() {
    this.moles.forEach((mole) => {
      if (mole.popTimer) {
        mole.popTimer.destroy();
        mole.popTimer = undefined;
      }
    });
  }

  private onMoleClicked(index: number) {
    if (this.isAnswering) return;

    const mole = this.moles[index];
    if (!mole.isActive || !mole.isVisible) return;

    // Determinar si es distractor o respuesta
    const isDistractor = !mole.hasAnswer;

    // ===== ANIMACIÓN COMÚN PARA TODOS LOS MOLES =====
    // Reemplazar mole normal por mole herido
    mole.moleBody.setVisible(false);
    mole.hurtMole.setVisible(true);
    mole.hurtMole.setFrame(0);
    
    // Ocultar el texto inmediatamente
    mole.text.setVisible(false);
    
    // Animar el mole herido bajando
    mole.hurtMole.play('mole-hurt');
    mole.hole.play('hole-down');

    // LÓGICA ESPECÍFICA SEGÚN TIPO DE MOLE
    if (isDistractor) {
      // DISTRACTOR: Solo penalización de tiempo, no detener el juego
      this.timeLeft = Math.max(this.timeLeft - 2, 0);
      this.timerText.setText(`${this.timeLeft}`);
      
      // Cuando termine la animación, restaurar y continuar
      mole.hurtMole.once('animationcomplete', () => {
        mole.hurtMole.setVisible(false);
        mole.moleBody.setVisible(true);
        mole.moleBody.play('mole-idle-down');
        mole.hole.play('hole-idle-down');
        mole.isVisible = false;
      });
      
      return; // No bloquear el juego
    }

    // RESPUESTA (correcta o incorrecta): Pausar el juego
    this.isAnswering = true;

    // Detener todos los timers de moles
    this.stopAllMoleTimers();

    // Detener timer de pregunta
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = mole.correctAnswer;

    // Mostrar feedback visual de texto
    this.showFeedback(isCorrect);

    // Cuando termine la animación del mole herido
    mole.hurtMole.once('animationcomplete', () => {
      mole.hurtMole.setVisible(false);
      mole.moleBody.setVisible(true);
      mole.moleBody.play('mole-idle-down');
      mole.hole.play('hole-idle-down');
      mole.isVisible = false;
    });

    // Lógica diferente según si es correcta o incorrecta
    if (isCorrect) {
      // RESPUESTA CORRECTA: Avanzar a siguiente pregunta
      this.time.delayedCall(1200, () => {
        this.gameEvents.emit('question-answered', {
          isCorrect: true,
          questionIndex: this.currentQuestionIndex,
          selectedAnswer: mole.text.text,
          correctAnswer: question.options[question.correctAnswer],
          question: question.question
        });

        // Ocultar feedback y topos antes de siguiente pregunta
        this.feedbackText.setVisible(false);
        this.hideMoles();
      });
    } else {
      // RESPUESTA INCORRECTA: Restar vida y continuar
      this.lives--;
      this.updateLivesDisplay();

      this.time.delayedCall(1000, () => {
        this.gameEvents.emit('question-answered', {
          isCorrect: false,
          questionIndex: this.currentQuestionIndex,
          selectedAnswer: mole.text.text,
          correctAnswer: question.options[question.correctAnswer],
          question: question.question
        });

        this.feedbackText.setVisible(false);

        // Verificar si se acabaron las vidas
        if (this.lives <= 0) {
          this.gameOver();
        } else {
          // Continuar en la misma pregunta
          this.resumeCurrentQuestion();
        }
      });
    }
  }

  private hideMoles() {
    // Detener todos los timers
    this.stopAllMoleTimers();

    // Animar todos los topos bajando
    const hidePromises = this.moles.map((mole, i) => {
      return new Promise<void>((resolve) => {
        // Solo animar los que están visibles
        if (mole.isVisible) {
          this.time.delayedCall(i * 30, () => {
            // Si está mostrando el mole herido, ya habrá bajado
            if (mole.hurtMole.visible) {
              resolve();
            } else {
              mole.moleBody.play('mole-down');
              mole.hole.play('hole-down');

              // Ocultar el texto inmediatamente cuando empieza a bajar
              mole.text.setVisible(false);

              mole.moleBody.once('animationcomplete', () => {
                mole.isActive = false;
                mole.isVisible = false;
                mole.moleBody.play('mole-idle-down');
                mole.hole.play('hole-idle-down');
                mole.moleBody.setVisible(true);
                mole.hurtMole.setVisible(false);
                resolve();
              });
            }
          });
        } else {
          mole.isActive = false;
          mole.isVisible = false;
          mole.text.setVisible(false);
          mole.moleBody.setVisible(true);
          mole.hurtMole.setVisible(false);
          resolve();
        }
      });
    });

    // Cuando todos se escondieron, cargar siguiente pregunta
    Promise.all(hidePromises).then(() => {
      this.currentQuestionIndex++;
      this.time.delayedCall(300, () => {
        this.loadQuestion();
      });
    });
  }

  private showFeedback(isCorrect: boolean) {
    this.feedbackText
      .setText(isCorrect ? '¡Bien!' : '¡Mal!')
      .setColor(isCorrect ? '#00ff00' : '#ff0000')
      .setVisible(true);

    // Animación de feedback
    this.tweens.add({
      targets: this.feedbackText,
      scale: { from: 0.5, to: 1.2 },
      duration: 300,
      yoyo: true
    });
  }

  private updateTimer() {
    this.timeLeft--;
    this.timerText.setText(`${this.timeLeft}`);

    // Calcular multiplicador de velocidad basado en tiempo restante
    // A menos tiempo, más velocidad (valores entre 1.0 y 2.5)
    if (this.timeLeft >= 20) {
      this.speedMultiplier = 1.0;
    } else if (this.timeLeft >= 15) {
      this.speedMultiplier = 1.3;
    } else if (this.timeLeft >= 10) {
      this.speedMultiplier = 1.6;
    } else if (this.timeLeft >= 5) {
      this.speedMultiplier = 2.0;
    } else {
      this.speedMultiplier = 2.5;
    }

    // MEJORA: Cambiar color del timer cuando queda poco tiempo
    if (this.timeLeft <= 10) {
      this.timerText.setColor('#ffa500'); // Naranja a partir de 10 segundos
    }

    if (this.timeLeft <= 5) {
      this.timerText.setColor('#ff0000'); // Rojo en los últimos 5

      // Efecto de parpadeo en los últimos 3 segundos
      if (this.timeLeft <= 3) {
        this.tweens.add({
          targets: this.timerText,
          alpha: 0.3,
          duration: 200,
          yoyo: true
        });
      }
    }

    if (this.timeLeft <= 0) {
      // Se acabó el tiempo, considerar como respuesta incorrecta
      if (this.timerEvent) {
        this.timerEvent.destroy();
      }

      if (!this.isAnswering) {
        this.isAnswering = true;

        // Detener todos los timers de moles
        this.stopAllMoleTimers();

        const question = this.questions[this.currentQuestionIndex];

        // Restar vida por timeout
        this.lives--;
        this.updateLivesDisplay();

        this.showFeedback(false);

        // Emitir resultado (timeout = incorrecto)
        this.time.delayedCall(1000, () => {
          this.gameEvents.emit('question-answered', {
            isCorrect: false,
            questionIndex: this.currentQuestionIndex,
            selectedAnswer: 'Tiempo agotado',
            correctAnswer: question.options[question.correctAnswer],
            question: question.question
          });

          this.feedbackText.setVisible(false);

          // Verificar si se acabaron las vidas
          if (this.lives <= 0) {
            this.gameOver();
          } else {
            // Continuar en la misma pregunta
            this.resumeCurrentQuestion();
          }
        });
      }
    }
  }

  private updateLivesDisplay() {
    this.livesText.setText(`❤️ x ${this.lives}`);

    // Animación de parpadeo al perder vida
    this.tweens.add({
      targets: this.livesText,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }

  private resumeCurrentQuestion() {
    // Primero bajar todos los topos visibles
    const hidePromises = this.moles.map((mole) => {
      return new Promise<void>((resolve) => {
        if (mole.isVisible) {
          // Asegurar que se usa el sprite correcto
          if (mole.hurtMole.visible) {
            // Si está mostrando el mole herido, dejarlo terminar su animación
            resolve();
          } else {
            mole.moleBody.play('mole-down');
            mole.hole.play('hole-down');
            mole.text.setVisible(false);

            mole.moleBody.once('animationcomplete', () => {
              mole.isVisible = false;
              mole.moleBody.play('mole-idle-down');
              mole.hole.play('hole-idle-down');
              mole.moleBody.clearTint();
              mole.moleBody.setVisible(true);
              mole.hurtMole.setVisible(false);
              resolve();
            });
          }
        } else {
          mole.moleBody.clearTint();
          mole.moleBody.setVisible(true);
          mole.hurtMole.setVisible(false);
          resolve();
        }
      });
    });

    // Cuando todos hayan bajado, reiniciar la pregunta
    Promise.all(hidePromises).then(() => {
      this.isAnswering = false;

      // Solo reiniciar el timer si se acabó el tiempo (0 segundos)
      if (this.timeLeft <= 0) {
        this.timeLeft = 25;
        this.speedMultiplier = 1.0;
        this.timerText.setText(`${this.timeLeft}`).setColor('#ffff00');
      } else {
        // Mantener el tiempo actual y solo actualizar el color según el tiempo
        if (this.timeLeft >= 11) {
          this.timerText.setColor('#ffff00');
        } else if (this.timeLeft >= 6) {
          this.timerText.setColor('#ffa500');
        } else {
          this.timerText.setColor('#ff0000');
        }
      }

      // Reanudar el timer
      if (this.timerEvent) {
        this.timerEvent.destroy();
      }

      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
      });

      // Reasignar opciones a diferentes topos aleatoriamente
      const question = this.questions[this.currentQuestionIndex];
      this.showMoles(question);

      // Reiniciar comportamiento dinámico de moles después de un delay
      this.time.delayedCall(300, () => {
        this.startDynamicMoleBehavior();
      });
    });
  }

  private gameOver() {
    // Detener todo
    this.stopAllMoleTimers();
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    // Ocultar todos los moles
    this.moles.forEach((mole) => {
      mole.isVisible = false;
      mole.moleBody.setVisible(true);
      mole.hurtMole.setVisible(false);
      mole.moleBody.play('mole-idle-down');
      mole.hole.play('hole-idle-down');
      mole.text.setVisible(false);
    });

    // Mostrar mensaje de Game Over
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, '¡Game Over!\nSin Vidas', {
        fontSize: '48px',
        color: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      })
      .setOrigin(0.5);

    // Emitir evento de fin de juego
    this.gameEvents.emit('game-over', {
      reason: 'no-lives',
      questionsAnswered: this.currentQuestionIndex
    });
  }

  private endGame() {
    // Limpiar timers
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }
    this.stopAllMoleTimers();

    // Mostrar mensaje de fin exitoso
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, '¡Felicidades!', {
        fontSize: '48px',
        color: '#00ff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      })
      .setOrigin(0.5);
  }

  update(): void {
    // Animación de parallax - actualizar en el update()
    // Animación de parallax - mover las nubes a diferentes velocidades
    if (this.cloudsMedium) {
      this.cloudsMedium.tilePositionX += 0.3; // Nubes medianas velocidad media
    }
    if (this.cloudsSmall) {
      this.cloudsSmall.tilePositionX += 0.08; // Nubes pequeñas más rápidas
    }
  }
}
