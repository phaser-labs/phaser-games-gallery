import Phaser from 'phaser';

import { WhackQuestion } from '../../types/types';
import { AudioManager } from '../../utils/AudioManager';
import { Mole } from '../gameObjects/Mole';

// Teclas válidas para activar el modo teclado
const KEYBOARD_NAVIGATION_KEYS = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'w',
  'W',
  'a',
  'A',
  's',
  'S',
  'd',
  'D'
] as const;

type NavigationKey = (typeof KEYBOARD_NAVIGATION_KEYS)[number];

export class Main extends Phaser.Scene {
  private questions: WhackQuestion[] = [];
  private gameEvents!: Phaser.Events.EventEmitter;
  private currentQuestionIndex: number = 0;
  private moles: Mole[] = [];
  private questionTextElement!: HTMLElement;
  private timerTextElement!: HTMLElement;
  private livesTextElement!: HTMLElement;
  private questionBg!: HTMLElement;
  private timeLeft: number = 25; // 25 segundos por pregunta
  private timerEvent?: Phaser.Time.TimerEvent;
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

  private focusedMoleIndex: number = 0; // Índice del topo actual para el teclado
  private isKeyboardModeActive: boolean = false;

  private GuiElement?: Phaser.GameObjects.DOMElement;

  // Botón de pausa
  private pauseButton!: Phaser.GameObjects.DOMElement;
  private pauseButtonElement!: HTMLButtonElement;
  private pauseOverlay!: HTMLElement;
  private isPaused: boolean = false;

  // AudioManager
  private audioManager?: AudioManager;

  // Modal de feedback
  private feedbackModal!: HTMLElement;
  private feedbackTitle!: HTMLElement;
  private feedbackMessage!: HTMLElement;
  private countdownElement!: HTMLElement;
  private countdownNumber!: HTMLElement;

  constructor() {
    super('gameScene');
  }

  init() {
    // Obtener datos del registry
    this.questions = this.registry.get('questionsData') || [];
    this.gameEvents = this.registry.get('gameEvents');
    this.currentQuestionIndex = 0;
    this.lives = 3; // Inicializar vidas

    // Limpiar estado anterior
    this.moles = [];
    this.focusedMoleIndex = 0;
    this.isKeyboardModeActive = false;
    this.isAnswering = false;
    this.speedMultiplier = 1.0;
    this.timeLeft = 25;
    this.isPaused = false;

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

    // --- GUI

    this.GuiElement = this.add.dom(0, 0, 'div').setOrigin(0, 0).setDepth(3); // Contenedor para elementos GUI
    const guiContainer = this.GuiElement.node as HTMLDivElement;
    guiContainer.classList.add('game-whack_gui-container');
    guiContainer.innerHTML = `

    <div class="game-whack_gui-title">
      <span class="game-whack_gui-text-top">VIDA</span>
      <div class="game-whack_gui-contain--text">
        <span id="lives-text" class="game-whack_gui--text">003</span>
      </div>
    </div>
    
    <div class="game-whack_question-container">
      <div class="game-whack_question-background">
        <p id="question-text" class="game-whack_question-text"></p>
      </div>
    </div>
    
    <div class="game-whack_gui-title">
    <span class="game-whack_gui-text-top">TIEMPO</span>
    <div class="game-whack_gui-contain--text">
    <span id="timer-text" class="game-whack_gui--text">025</span>
    </div>
    
    </div>

    `;

    // Referencias a elementos del DOM
    this.questionTextElement = guiContainer.querySelector('#question-text') as HTMLElement;
    this.timerTextElement = guiContainer.querySelector('#timer-text') as HTMLElement;
    this.livesTextElement = guiContainer.querySelector('#lives-text') as HTMLElement;

    this.questionBg = guiContainer.querySelector('.game-whack_question-background') as HTMLElement;
    this.questionBg.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });

    // Crear modal de feedback
    const feedbackModalHTML = `
      <div id="feedback-modal" class="game-whack_feedback-modal">
        <div class="game-whack_feedback-content">
          <h2 id="feedback-title" class="game-whack_feedback-title"></h2>
          <p id="feedback-message" class="game-whack_feedback-message"></p>
        </div>
      </div>
      
      <div id="countdown" class="game-whack_countdown">
        <div id="countdown-number" class="game-whack_countdown-number"></div>
      </div>
    `;

    guiContainer.insertAdjacentHTML('beforeend', feedbackModalHTML);

    this.feedbackModal = guiContainer.querySelector('#feedback-modal') as HTMLElement;
    this.feedbackTitle = guiContainer.querySelector('#feedback-title') as HTMLElement;
    this.feedbackMessage = guiContainer.querySelector('#feedback-message') as HTMLElement;
    this.countdownElement = guiContainer.querySelector('#countdown') as HTMLElement;
    this.countdownNumber = guiContainer.querySelector('#countdown-number') as HTMLElement;

    // Crear agujeros y topos usando Containers
    this.createMoles();

    // === BOTÓN DE PAUSA ===
    this.createPauseButton();

    // === AUDIO MANAGER ===
    // Recuperar o crear AudioManager
    this.audioManager = this.registry.get('audioManager') as AudioManager;
    if (this.audioManager) {
      this.audioManager.attachScene(this);
      // Crear el botón visual en esta escena
      this.audioManager.createButtonInScene(this, width - 30, 40, 100);
    }

    // === CONFIGURACIÓN DE TECLADO ===
    this.setupKeyboardNavigation();

    // Cargar primera pregunta
    this.loadQuestion();
  }

  private createPauseButton() {
    const { width } = this.scale;

    // Botón de pausa (esquina superior derecha, un poco más a la izquierda del botón de audio)
    const label = 'Pausar juego';

    this.pauseButton = this.add.dom(width - 32, 120).setDepth(100).createFromHTML(`
      <button
        type="button"
        aria-label="${label}"
        title="${label}"
        class="game-whack_pause-button playing"
      >
      </button>
    `);

    const root = this.pauseButton.node as HTMLElement;
    const btn = root.querySelector('button');
    if (!btn) throw new Error('Pause button not found');

    this.pauseButtonElement = btn as HTMLButtonElement;

    this.pauseButtonElement.addEventListener('click', () => this.togglePause());
    this.pauseButtonElement.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this.togglePause();
      }
    });

    // Efectos hover
    this.pauseButtonElement.addEventListener('mouseenter', () => {
      this.pauseButtonElement.style.transform = 'scale(1.1)';
    });

    this.pauseButtonElement.addEventListener('mouseleave', () => {
      this.pauseButtonElement.style.transform = 'scale(1)';
    });

    // Overlay de pausa HTML (inicialmente invisible)
    const guiContainer = this.GuiElement?.node as HTMLDivElement;
    const pauseOverlayHTML = `
      <div id="pause-overlay" class="game-whack_pause-overlay" style="display: none;">
      <p class="game-whack_pause-instruction">Juego pausado</p>
      <p class="game-whack_pause-instruction">Haz clic para reanudar</p>
      </div>
    `;
    guiContainer.insertAdjacentHTML('beforeend', pauseOverlayHTML);
    this.pauseOverlay = guiContainer.querySelector('#pause-overlay') as HTMLElement;

    // Click en overlay para reanudar
    this.pauseOverlay.addEventListener('click', () => {
      if (this.isPaused) {
        this.togglePause();
      }
    });
  }

  private togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // PAUSAR
       this.audioManager?.play('pause_sound', { volume: 0.01 });
      this.pauseButtonElement.className = 'game-whack_pause-button paused';
      this.pauseButtonElement.setAttribute('aria-label', 'Reanudar juego');
      this.pauseButtonElement.setAttribute('title', 'Reanudar juego');
      this.pauseOverlay.style.display = 'flex';

      // Pausar la escena (detiene tweens, animaciones, timers)
      this.scene.pause();
    } else {
      // REANUDAR
        this.audioManager?.play('pause_sound', { volume: 0.01 });
      this.pauseButtonElement.className = 'game-whack_pause-button playing';
      this.pauseButtonElement.setAttribute('aria-label', 'Pausar juego');
      this.pauseButtonElement.setAttribute('title', 'Pausar juego');
      this.pauseOverlay.style.display = 'none';

      // Reanudar la escena
      this.scene.resume();
    }
  }

  private setupKeyboardNavigation() {
    // Escuchar cualquier tecla de navegación para ACTIVAR el modo teclado
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const isNavigationKey = KEYBOARD_NAVIGATION_KEYS.includes(event.key as NavigationKey);

      if (isNavigationKey && !this.isKeyboardModeActive) {
        this.isKeyboardModeActive = true;
        this.refreshVisualFocus(); // Encender el brillo
      }
    });

    // Configurar los movimientos (flechas y WASD)
    this.input.keyboard?.on('keydown-LEFT', () => this.moveFocus(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveFocus(1));
    this.input.keyboard?.on('keydown-UP', () => this.moveFocus(-4));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveFocus(4));
    this.input.keyboard?.on('keydown-A', () => this.moveFocus(-1));
    this.input.keyboard?.on('keydown-D', () => this.moveFocus(1));
    this.input.keyboard?.on('keydown-W', () => this.moveFocus(-4));
    this.input.keyboard?.on('keydown-S', () => this.moveFocus(4));

    // Acción de golpe (Space y Enter)
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.isKeyboardModeActive && !this.isAnswering) {
        this.moles[this.focusedMoleIndex].triggerWhack();
      }
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.isKeyboardModeActive && !this.isAnswering) {
        this.moles[this.focusedMoleIndex].triggerWhack();
      }
    });

    // Pausa con tecla ESC
    this.input.keyboard?.on('keydown-ESC', () => {
      this.togglePause();
    });

    // DESACTIVAR modo teclado si se usa el mouse
    this.input.on('pointerdown', () => {
      this.disableKeyboardMode();
    });

    // Opcional: Desactivar si el mouse se mueve mucho
    this.input.on('pointermove', () => {
      // Solo lo desactivamos si estaba activo para no saturar procesos
      if (this.isKeyboardModeActive) {
        this.disableKeyboardMode();
      }
    });
  }

  private moveFocus(delta: number) {
    if (this.isAnswering) return;

    // Si el modo teclado no estaba activo, lo activamos pero no movemos el índice la primera vez
    if (!this.isKeyboardModeActive) {
      this.isKeyboardModeActive = true;
      this.refreshVisualFocus();
      return;
    }

    // Cambiar índice
    this.focusedMoleIndex += delta;
    if (this.focusedMoleIndex < 0) this.focusedMoleIndex = 0;
    if (this.focusedMoleIndex >= this.moles.length) this.focusedMoleIndex = this.moles.length - 1;

    this.refreshVisualFocus();
  }

  /**
   * Apaga todos los brillos y marca el modo teclado como inactivo
   */
  private disableKeyboardMode() {
    this.isKeyboardModeActive = false;
    this.moles.forEach((m) => m.setFocus(false));
  }

  /**
   * Refresca qué topo debe brillar, pero solo si el modo teclado está activo
   */
  private refreshVisualFocus() {
    this.moles.forEach((mole, index) => {
      const shouldGlow = this.isKeyboardModeActive && index === this.focusedMoleIndex;
      mole.setFocus(shouldGlow);
    });
  }
  private createMoles() {
    if (this.spawnPoints.length === 0) return;

    const maxMoles = Math.min(this.spawnPoints.length, 10);

    for (let index = 0; index < maxMoles; index++) {
      const spawnPoint = this.spawnPoints[index];

      // Coordenadas escaladas
      const posX = (spawnPoint.x || 0) * this.MAP_SCALE;
      const posY = (spawnPoint.y || 0) * this.MAP_SCALE;

      // Crear instancia de Mole
      const mole = new Mole(this, {
        x: posX,
        y: posY,
        scale: 1.5,
        holeDepth: 3,
        containerDepth: 2
      });

      // Configurar callback de click
      mole.setOnClickCallback((clickedMole) => this.onMoleClicked(clickedMole));

      this.moles.push(mole);
    }
    // Inicializar el foco visual en el primer topo después de crearlos
    this.time.delayedCall(100, () => {
      if (this.moles[0]) this.moles[0].setFocus(true);
    });
  }

  private loadQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      // No hay más preguntas, terminar juego
      this.endGame();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];

    // Actualizar texto de pregunta
    this.questionTextElement.textContent = question.question;

    this.moles.forEach((m, i) => m.setFocus(i === this.focusedMoleIndex));
    this.refreshVisualFocus();

    // Reiniciar estados
    this.timeLeft = 25;
    this.speedMultiplier = 1.0; // Reiniciar velocidad
    this.timerTextElement.textContent = this.formatTime(this.timeLeft);
    this.timerTextElement.style.color = '#fff000';
    this.timerTextElement.style.textShadow = '2px 2px 0 #885a00, 4px 4px 0 #441f00';
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
    this.time.delayedCall(200, () => {
      this.showMoles(question);
      // Iniciar comportamiento dinámico de moles
      this.startDynamicMoleBehavior();
    });
  }

  private showMoles(question: WhackQuestion) {
    const numOptions = Math.min(question.options.length, this.moles.length);

    // Resetear todos los moles
    this.moles.forEach((mole) => {
      mole.reset();
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
      mole.setAnswer(question.options[optionIndex], optionIndex === question.correctAnswer, optionIndex);
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

    mole.popUp(() => {
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

    mole.popDown(() => {
      // Programar siguiente aparición
      this.scheduleMolePop(moleIndex);
    });
  }

  private stopAllMoleTimers() {
    this.moles.forEach((mole) => {
      mole.clearPopTimer();
    });
  }

  private onMoleClicked(mole: Mole) {
    if (this.isAnswering) return;
    if (!mole.isActive || !mole.isVisible) return;

    // Determinar si es distractor o respuesta
    const isDistractor = !mole.hasAnswer;

    // LÓGICA ESPECÍFICA SEGÚN TIPO DE MOLE
    if (isDistractor) {
      // DISTRACTOR: Solo penalización de tiempo, no detener el juego
      this.timeLeft = Math.max(this.timeLeft - 2, 0);
      this.timerTextElement.textContent = this.formatTime(this.timeLeft);
      this.updateTimerColor();

      // Detener el timer del mole antes de golpearlo
      mole.clearPopTimer();

      // Animar el golpe y programar siguiente aparición después
      mole.hit(() => {
        // Después de la animación de golpe, programar siguiente aparición
        const moleIndex = this.moles.indexOf(mole);
        if (moleIndex !== -1) {
          this.scheduleMolePop(moleIndex);
        }
      });

      return; // No bloquear el juego
    }

    // ===== RESPUESTA (correcta o incorrecta) =====
    // Animar el golpe
    mole.hit();

    // Pausar el juego
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

    // Lógica diferente según si es correcta o incorrecta
    if (isCorrect) {
      // Reproducir sonido de correcto
      this.audioManager?.play('success_sound', { volume: 0.03 });
      // RESPUESTA CORRECTA: Avanzar a siguiente pregunta
      this.time.delayedCall(2000, () => {
        // Ocultar modal de feedback
        this.hideFeedback();

        this.gameEvents.emit('question-answered', {
          isCorrect: true,
          questionIndex: this.currentQuestionIndex,
          selectedAnswer: mole.getAnswerText(),
          correctAnswer: question.options[question.correctAnswer],
          question: question.question
        });

        // Ocultar topos antes de siguiente pregunta
        this.hideMoles();
      });
    } else {
      // Reproducir sonido de incorrecto
      this.audioManager?.play('wrong_sound', { volume: 0.03 });

      // RESPUESTA INCORRECTA: Restar vida y continuar
      this.lives--;
      this.updateLivesDisplay();

      this.time.delayedCall(2000, () => {
        // Ocultar modal de feedback
        this.hideFeedback();

        this.gameEvents.emit('question-answered', {
          isCorrect: false,
          questionIndex: this.currentQuestionIndex,
          selectedAnswer: mole.getAnswerText(),
          correctAnswer: question.options[question.correctAnswer],
          question: question.question
        });

        // Verificar si se acabaron las vidas
        if (this.lives <= 0) {
          this.gameOver();
        } else {
          // Conteo regresivo antes de retomar el juego
          this.time.delayedCall(300, () => {
            this.showCountdown(() => {
              // Continuar en la misma pregunta
              this.resumeCurrentQuestion();
            });
          });
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
        // Si el mole está siendo golpeado, esperar a que termine su animación
        if (mole.isBeingHit) {
          // El mole ya se está escondiendo con la animación de hit, solo marcar como inactivo
          mole.isActive = false;
          resolve();
        } else if (mole.isVisible) {
          // Solo animar los que están visibles y no están siendo golpeados
          this.time.delayedCall(i * 30, () => {
            mole.popDown(() => {
              mole.isActive = false;
              resolve();
            });
          });
        } else {
          mole.isActive = false;
          mole.forceDown();
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
    // Configurar el contenido del modal
    this.feedbackTitle.textContent = isCorrect ? '¡BIEN!' : '¡MAL!';
    this.feedbackTitle.className = isCorrect
      ? 'game-whack_feedback-title correct'
      : 'game-whack_feedback-title incorrect';

    this.feedbackMessage.textContent = isCorrect ? '¡Respuesta correcta!' : '¡Respuesta incorrecta!';

    // Mostrar el modal con animación
    this.feedbackModal.classList.add('show');

    // Reproducir sonido (si existe)
    if (isCorrect && this.sound.get('correct')) {
      this.sound.play('correct', { volume: 0.5 });
    } else if (!isCorrect && this.sound.get('wrong')) {
      this.sound.play('wrong', { volume: 0.5 });
    }
  }

  private hideFeedback() {
    // Remover la clase 'show' y agregar 'hide' para la animación de salida
    this.feedbackModal.classList.remove('show');
    this.feedbackModal.classList.add('hide');

    // Después de que termine la animación, remover la clase 'hide'
    setTimeout(() => {
      this.feedbackModal.classList.remove('hide');
    }, 600); // 600ms coincide con la duración de la animación swingUp
  }

  private showCountdown(callback: () => void) {
    let count = 3;

    const showNumber = () => {
      if (count > 0) {
        this.countdownNumber.textContent = count.toString();
        this.countdownElement.classList.add('show');

        // Reproducir sonido de tick (si existe)
        if (this.sound.get('tick')) {
          this.sound.play('tick', { volume: 0.3 });
        }

        // Remover clase después de la animación
        this.time.delayedCall(900, () => {
          this.countdownElement.classList.remove('show');
        });

        count--;
        this.time.delayedCall(1000, showNumber);
      } else {
        // Terminó el conteo, ejecutar callback
        this.time.delayedCall(200, callback);
      }
    };

    showNumber();
  }

  private updateTimer() {
    this.timeLeft--;
    // Asegurar que no sea negativo
    this.timeLeft = Math.max(0, this.timeLeft);
    this.timerTextElement.textContent = this.formatTime(this.timeLeft);

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

    // Actualizar color del timer
    this.updateTimerColor();

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
        this.time.delayedCall(2000, () => {
          // Ocultar modal de feedback
          this.hideFeedback();

          this.gameEvents.emit('question-answered', {
            isCorrect: false,
            questionIndex: this.currentQuestionIndex,
            selectedAnswer: 'Tiempo agotado',
            correctAnswer: question.options[question.correctAnswer],
            question: question.question
          });

          // Verificar si se acabaron las vidas
          if (this.lives <= 0) {
            this.gameOver();
          } else {
            // Conteo regresivo antes de retomar el juego
            this.time.delayedCall(300, () => {
              this.showCountdown(() => {
                // Continuar en la misma pregunta
                this.resumeCurrentQuestion();
              });
            });
          }
        });
      }
    }
  }

  private updateLivesDisplay() {
    this.livesTextElement.textContent = this.formatLives(this.lives);

    // Animación de parpadeo al perder vida usando CSS
    this.livesTextElement.style.animation = 'none';
    setTimeout(() => {
      this.livesTextElement.style.animation = 'blink 0.1s 3';
    }, 10);
  }

  private formatLives(lives: number): string {
    return lives.toString().padStart(3, '0');
  }

  private formatTime(time: number): string {
    return time.toString().padStart(3, '0');
  }

  private updateTimerColor() {
    if (this.timeLeft <= 5) {
      this.timerTextElement.style.color = '#ff0000';
      this.timerTextElement.style.textShadow = '2px 2px 0 #660000, 4px 4px 0 #330000';
    } else if (this.timeLeft <= 10) {
      this.timerTextElement.style.color = '#ffa500';
      this.timerTextElement.style.textShadow = '2px 2px 0 #885a00, 4px 4px 0 #441f00';
    } else {
      this.timerTextElement.style.color = '#fff000';
      this.timerTextElement.style.textShadow = '2px 2px 0 #885a00, 4px 4px 0 #441f00';
    }
  }

  private resumeCurrentQuestion() {
    // Primero bajar todos los topos visibles
    const hidePromises = this.moles.map((mole) => {
      return new Promise<void>((resolve) => {
        if (mole.isVisible) {
          mole.popDown(() => {
            resolve();
          });
        } else {
          mole.forceDown();
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
        this.timerTextElement.textContent = this.formatTime(this.timeLeft);
      }

      // Actualizar color del timer
      this.updateTimerColor();

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

      // Solo refrescar el foco visual si el modo teclado está activo
      if (this.isKeyboardModeActive) {
        this.refreshVisualFocus();
      }

      // Reasignar opciones a diferentes topos aleatoriamente
      const question = this.questions[this.currentQuestionIndex];
      this.showMoles(question);

      // Reiniciar comportamiento dinámico de moles después de un delay
      this.time.delayedCall(200, () => {
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
      mole.forceDown();
    });

    // Emitir evento de fin de juego
    this.gameEvents.emit('game-over', {
      reason: 'no-lives',
      questionsAnswered: this.currentQuestionIndex
    });

    // Ir a la escena de fin con parámetro de derrota
    this.time.delayedCall(1000, () => {
      this.sound.stopAll();
      this.scene.start('endGameScene', { won: false });
    });
  }

  private endGame() {
    // Limpiar timers
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }
    this.stopAllMoleTimers();

    // Emitir evento de victoria
    this.gameEvents.emit('game-completed', {
      questionsAnswered: this.currentQuestionIndex
    });

    // Ir a la escena de fin con parámetro de victoria
    this.time.delayedCall(1000, () => {
      this.sound.stopAll();
      this.scene.start('endGameScene', { won: true });
    });
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
