import Phaser from 'phaser';

import { WhackQuestion } from '../../game-whack-a-question';

/**
 * Interfaz mejorada usando Containers para agrupar elementos
 * Inspirado en el código de referencia con mejoras adicionales
 */
interface MoleContainer {
  container: Phaser.GameObjects.Container;
  hole: Phaser.GameObjects.Ellipse;
  moleBody: Phaser.GameObjects.Arc;
  text: Phaser.GameObjects.Text;
  isActive: boolean;
  correctAnswer: boolean;
  answerIndex: number;
  initialY: number;
  hiddenY: number;
}

export class Main extends Phaser.Scene {
  private questions: WhackQuestion[] = [];
  private gameEvents!: Phaser.Events.EventEmitter;
  private currentQuestionIndex: number = 0;
  private moles: MoleContainer[] = [];
  private questionText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private timeLeft: number = 25; // 15 segundos por pregunta
  private timerEvent?: Phaser.Time.TimerEvent;
  private feedbackText!: Phaser.GameObjects.Text;
  private isAnswering: boolean = false;
  private readonly MOLE_COLOR = 0x8b4513; // Color café del topo
  private readonly HOLE_COLOR = 0x3d2817; // Color del agujero
  private map!: Phaser.Tilemaps.Tilemap;
  private spawnPoints: Phaser.Types.Tilemaps.TiledObject[] = [];

  // Capas de nubes para el efecto parallax
  backgroudSky!: Phaser.GameObjects.Image;
  cloudsMedium!: Phaser.GameObjects.TileSprite;
  cloudsSmall!: Phaser.GameObjects.TileSprite;
  private readonly MAP_SCALE = 0.84; // Escala del mapa (ajustar según el tamaño del tilemap)

  constructor() {
    super('gameScene');
  }

  init() {
    // Obtener datos del registry
    this.questions = this.registry.get('questionsData') || [];
    this.gameEvents = this.registry.get('gameEvents');
    this.currentQuestionIndex = 0;

    if (this.questions.length === 0) {
      console.error('No hay preguntas disponibles');
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
    this.cloudsMedium = this.add.tileSprite(0, 0, width, height, 'clouds_medium').setOrigin(0, 0).setDepth(-1).setScale(1.2);

    // Nubes pequeñas (más rápidas, más cerca)
   this.cloudsSmall = this.add.tileSprite(0, 50, width, height, 'clouds_small').setOrigin(0, 0).setDepth(-2).setScale(1).setAlpha(0.8);


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

      // Visualizar los puntos de spawn para debug
      this.spawnPoints.forEach((point) => {
        // Aplicar el mismo escalado que al mapa
        const x = (point.x || 0) * this.MAP_SCALE;
        const y = (point.y || 0) * this.MAP_SCALE;

        // Círculos rojos para visualizar los puntos de spawn
        this.add.circle(x, y, 10, 0xff0000);
      });
    } else {
      console.error('❌ No se encontró la capa SpawnTopos');
    }

    this.moles.forEach((m) => m.hole.setDepth(1));
    // Los contenedores de los topos en depth 2
    this.moles.forEach((m) => m.container.setDepth(2));

    // Título
    this.add
      .text(width / 2, 30, '¡Atrapa la Respuesta Correcta!', {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      })
      .setOrigin(0.5);

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
      .text(width - 20, 20, '15', {
        fontSize: '24px',
        color: '#ffff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(1, 0);

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

      const holeY = posY;
      // El topo se esconde bajando 60px (ajustado a tiles de 32px)
      const hiddenY = posY + 60 * this.MAP_SCALE;

      const container = this.add.container(posX, hiddenY);

      // AJUSTE DE TAMAÑO PARA 32x32:
      // Agujero: Aproximadamente 80px de ancho para que se vea bien en tiles de 32px escalados
      const holeWidth = 70 * this.MAP_SCALE;
      const hole = this.add
        .ellipse(posX, holeY, holeWidth, holeWidth / 2, this.HOLE_COLOR)
        .setStrokeStyle(2, 0x000000)
        .setDepth(1); // Entre la tierra y el topo

      // Topo: Radio de 22px aprox.
      const moleRadius = 22 * this.MAP_SCALE;
      const moleBody = this.add.circle(0, 0, moleRadius, this.MOLE_COLOR).setStrokeStyle(2, 0x000000);

      const text = this.add
        .text(0, 0, '', {
          fontSize: `${12 * this.MAP_SCALE}px`,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2,
          align: 'center',
          wordWrap: { width: moleRadius * 2.5 }
        })
        .setOrigin(0.5);

      container.add([moleBody, text]);
      container.setDepth(2); // Arriba del agujero, abajo de los árboles

      // Interactividad
      moleBody.setInteractive(new Phaser.Geom.Circle(0, 0, moleRadius), Phaser.Geom.Circle.Contains);
      moleBody.on('pointerdown', () => this.onMoleClicked(index));

      this.moles.push({
        container,
        hole,
        moleBody,
        text,
        isActive: false,
        correctAnswer: false,
        answerIndex: index,
        initialY: holeY,
        hiddenY
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
    this.timeLeft = 15;
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

    // Mostrar topos con las opciones después de un pequeño delay
    this.time.delayedCall(300, () => {
      this.showMoles(question);
    });
  }

  private showMoles(question: WhackQuestion) {
    // Determinar cuántos topos mostrar basado en opciones disponibles
    const numOptions = Math.min(question.options.length, 4);

    for (let i = 0; i < numOptions; i++) {
      const mole = this.moles[i];
      mole.isActive = true;
      mole.correctAnswer = i === question.correctAnswer;
      mole.text.setText(question.options[i]);

      // Reset color del topo
      mole.moleBody.setFillStyle(this.MOLE_COLOR);

      // MEJORA: Animación de aparecer más suave con efecto escalonado
      this.tweens.add({
        targets: mole.container,
        y: mole.initialY,
        duration: 400,
        ease: 'Back.easeOut',
        delay: i * 100 // Efecto escalonado
      });
    }

    // Ocultar topos no usados
    for (let i = numOptions; i < this.moles.length; i++) {
      const mole = this.moles[i];
      mole.isActive = false;
      mole.container.setPosition(mole.container.x, mole.hiddenY);
    }
  }

  private onMoleClicked(index: number) {
    if (this.isAnswering) return; // Evitar múltiples clics

    const mole = this.moles[index];
    if (!mole.isActive) return;

    this.isAnswering = true;

    // Detener timer
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = mole.correctAnswer;

    // MEJORA: Feedback de color en el topo clickeado
    const feedbackColor = isCorrect ? 0x00ff00 : 0xff0000;
    mole.moleBody.setFillStyle(feedbackColor);

    // Mostrar feedback visual de texto
    this.showFeedback(isCorrect);

    // MEJORA: Animación de "golpe" (squash and stretch)
    this.tweens.add({
      targets: mole.container,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 100,
      yoyo: true
    });

    // Emitir resultado a React y preparar siguiente pregunta
    this.time.delayedCall(1200, () => {
      this.gameEvents.emit('question-answered', {
        isCorrect,
        questionIndex: this.currentQuestionIndex,
        selectedAnswer: question.options[index],
        correctAnswer: question.options[question.correctAnswer],
        question: question.question
      });

      // Ocultar feedback y topos antes de siguiente pregunta
      this.feedbackText.setVisible(false);
      this.hideMoles();
    });
  }

  private hideMoles() {
    // Animar todos los topos bajando
    const hidePromises = this.moles.map((mole, i) => {
      return new Promise<void>((resolve) => {
        this.tweens.add({
          targets: mole.container,
          y: mole.hiddenY,
          duration: 300,
          ease: 'Back.easeIn',
          delay: i * 50,
          onComplete: () => {
            mole.isActive = false;
            resolve();
          }
        });
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

    // MEJORA: Cambiar color del timer cuando queda poco tiempo
    if (this.timeLeft <= 5) {
      this.timerText.setColor('#ff0000');

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
        const question = this.questions[this.currentQuestionIndex];

        this.showFeedback(false);

        // Emitir resultado (timeout = incorrecto)
        this.time.delayedCall(1200, () => {
          this.gameEvents.emit('question-answered', {
            isCorrect: false,
            questionIndex: this.currentQuestionIndex,
            selectedAnswer: 'Tiempo agotado',
            correctAnswer: question.options[question.correctAnswer],
            question: question.question
          });

          // Ocultar feedback y topos
          this.feedbackText.setVisible(false);
          this.hideMoles();
        });
      }
    }
  }

  private endGame() {
    // Limpiar
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    // Mostrar mensaje de fin
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, '¡Juego Terminado!', {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    // Podrías agregar lógica adicional para reiniciar o volver al menú
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
