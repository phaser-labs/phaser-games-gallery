import { Scene } from 'phaser';

import { Audio, Card } from '../components';
import { globalState } from '../global-state';
import { GameResult, Option } from '../types/types';
import { announce, announceGuardian } from '../utils/announce';
import { createAnimations } from '../utils/game-animations';
import { createCombat, PlantType } from '../utils/game-combat';
import { DIMENSIONS } from '../utils/ui-styles';

import css from '../styles/game-attack.module.css';


export class GameMain extends Scene {
  private combat!: ReturnType<typeof import('../utils/game-combat').createCombat>;

  private enemiesDefeated = 0;
  private attempts = 0;

  cards: Card[] = [];
  domButtons: Phaser.GameObjects.DOMElement[] = [];

  qIndex = 0;

  private audio!: Audio;

  // UI pregunta
  questionDom!: Phaser.GameObjects.DOMElement;
  questionBoxGfx!: Phaser.GameObjects.Graphics;

  // UI respuesta
  hero!: Phaser.GameObjects.Sprite;
  plant!: Phaser.GameObjects.Sprite;

  // UI vida
  heroHpBar!: Phaser.GameObjects.Graphics;
  plantHpBar!: Phaser.GameObjects.Graphics;

  maxHP = 0;
  hp = 0;
  plantMaxHP = 0;
  plantHP = 0;

  isResolving = false; // bloquea clicks mientras pelea

  plantType: PlantType = 1;
  heroDied = false;

  // Telón accesible (DOM)
  private curtainDom!: Phaser.GameObjects.DOMElement;
  private curtainDomEl!: HTMLDivElement;
  private curtainMsgEl!: HTMLDivElement;

  private overlayMode: 'next' | 'hurt' | 'restart' | 'finish' = 'next';
  private overlayBtnEl!: HTMLButtonElement;
  private isTransitioning = false;

  // ARIA live region (DOM oculto)
  private a11yLiveDom!: Phaser.GameObjects.DOMElement;
  private a11yLiveEl!: HTMLDivElement;

  // Estos son los que se animan
  heroDisplayPct = 1;
  plantDisplayPct = 1;
  heroFillTween?: Phaser.Tweens.Tween;
  plantFillTween?: Phaser.Tweens.Tween;

  constructor() {
    super('GameMain');
  }

  preload() {
    this.load.setPath('assets/game-attack');

    // Magic books
    this.load.image('poison1', `images/poisons/Icon1.png`);
    this.load.image('poison2', `images/poisons/Icon2.png`);
    this.load.image('poison3', `images/poisons/Icon3.png`);
    this.load.image('poison4', `images/poisons/Icon4.png`);
    this.load.image('poison5', `images/poisons/Icon5.png`);

  }

  init() {
    // ✅ reset completo de run state
    this.qIndex = 0;

    this.maxHP = 0;
    this.hp = 0;

    this.plantType = 1;
    this.heroDied = false;

    this.isResolving = false;
    this.isTransitioning = false;
    this.overlayMode = 'next';

    this.heroDisplayPct = 1;
    this.plantDisplayPct = 1;

    this.enemiesDefeated = 0;
    this.attempts = 0;

    // si quedaron tweens vivos
    this.heroFillTween?.stop();
    this.plantFillTween?.stop();
    this.heroFillTween = undefined;
    this.plantFillTween = undefined;
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.image(0, 0, 'bg').setOrigin(0);
    bg.displayWidth = width;
    bg.displayHeight = height;

    // 1) UI pregunta
    this.createQuestionPanel();

    // 2) Audios

    this.audio = new Audio(this, {
      musicKey: 'initial',
      x: width - 30,
      y: 36,
      cssButtonMusic: css['button-music'],
      cssButtonMusicMuted: css['button-music-muted'],
      volume: 0.1,
      storageKey: 'mm_music_muted', // importante: mismo key en todas las escenas
    });


    // 3) A11Y: live region + telón overlay accesible
    this.createA11yLiveRegion();
    this.createCurtainOverlayDom();

    // 4) Animaciones + personajes (pelea)
    createAnimations(this);
    this.createFighters();

    this.plantType = 1;
    this.setPlantType(1);

    // 5) Vida depende de cantidad de preguntas
    this.maxHP = 3;
    this.hp = this.maxHP;

    // La barra del héroe inicia llena (porcentaje)
    this.heroDisplayPct = 1; // = 1

    //  Planta (1 golpe)
    this.plantMaxHP = 1;
    this.plantHP = this.plantMaxHP;
    this.plantDisplayPct = 1;

    this.createHealthBars();   // ✅ crea graphics
    this.updateHealthBars();   // ✅ dibuja con hp/maxHP

    this.combat = createCombat({
      scene: this,
      hero: this.hero,
      plant: this.plant,

      getPlantType: () => this.plantType as PlantType,
      setPlantType: (t) => this.setPlantType(t),

      getHeroHP: () => ({ hp: this.hp, maxHP: this.maxHP }),
      setHeroHP: (hp) => { this.hp = hp; },

      getPlantHP: () => ({ hp: this.plantHP, maxHP: this.plantMaxHP }),
      setPlantHP: (hp) => { this.plantHP = hp; },

      // ✅ FALTABA ESTO
      setHeroDisplayPct: (pct) => { this.heroDisplayPct = pct; },
      getHeroDisplayPct: () => this.heroDisplayPct,

      setPlantDisplayPct: (pct) => { this.plantDisplayPct = pct; },
      getPlantDisplayPct: () => this.plantDisplayPct,

      updateHealthBars: () => this.updateHealthBars(),
      setAnswersEnabled: (enabled) => this.setAnswersEnabled(enabled),
      onEnemyDefeated: () => { this.enemiesDefeated += 1; },

      fillPlantBar: () => this.fillPlantBar(),
      onHeroDeath: () => this.onHeroDead()
    });

    // 6) Cargar primera pregunta
    if (!globalState.questions.length) {
      console.error('GameMain: No hay preguntas en globalState');
      return;
    }
    this.loadQuestion(0);


    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.audio?.destroy();
    });
  }

  update() {
    this.updateHealthBars();
  }

  // ---------------------------
  // Funciones aux
  // ---------------------------

  private getRandom(limit: number) {
    return Math.floor(Math.random() * limit) + 1;
  }

  // ---------------------------
  // Pregunta con scroll (DOM)
  // ---------------------------

  createQuestionPanel() {
    const { width, height } = DIMENSIONS.questionBox;
    const x = this.scale.width / 2 - width / 2;
    const y = 30;

    this.questionDom = this.add
      .dom(x, y)
      .setOrigin(0, 0)
      .setDepth(999)
      .createFromHTML(`
      <div class="${css['question-scroll']}"></div>
    `);

    const el = this.questionDom.node as HTMLDivElement;
    el.style.pointerEvents = 'auto';
    el.style.width = `${width}px`;
    el.style.maxHeight = `${height}px`;

    el.className = css['question-scroll'];

    el.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
  }

  loadQuestion(index: number) {
    this.clearCards();

    const q = globalState.questions[index];
    if (!q) return; // guard rail

    const questionText = this.escapeHtml(`${q.id}. ${q.text}`);

    const el = this.questionDom.node as HTMLDivElement;
    el.innerHTML = questionText;         // ✅ actualiza, no crea otro DOM
    el.scrollTop = 0;                    // ✅ vuelve arriba para cada pregunta

    this.renderAnswerCards(q.options);

    announce(`Pregunta ${index + 1} de ${globalState.questions.length}. ${q.text}`);
  }

  // ---------------------------
  // Respuestas (cards + botones DOM)
  // ---------------------------

  renderAnswerCards(options: Option[]) {
    const cardY = this.scale.height - 110;
    const spacing = 160;
    const startX = this.scale.width / 2 - spacing * 1.5;

    options.forEach((opt, i) => {
      const card = new Card(
        this,
        startX + i * spacing,
        cardY,
        {
          id: opt.id,
          text: opt.text,
          correct: opt.correct,
          iconKey: `poison${this.getRandom(5)}`
        }
      );

      this.cards.push(card);

      // Botón HTML accesible
      const r = card.getButtonRectLocal();
      const tl = card.localToWorld(r.x, r.y);

      const cx = tl.x + r.width / 2;
      const cy = tl.y + r.height / 2;

      const label = this.escapeHtml(`${opt.id}. ${opt.text}`);

      const dom = this.add.dom(cx, cy).setOrigin(0.5, 0.5).createFromHTML(`
        <button class="${css['card-a11y-btn']}" aria-label="${label}" state="${opt.correct}">
          <div class="${css['card-text-scroll']}" aria-hidden="true">
            ${this.escapeHtml(opt.text)}
          </div>
        </button>
      `);

      const el = dom.node as HTMLButtonElement;
      el.style.pointerEvents = 'auto';

      el.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
          e.preventDefault();
          el.click();
        }
      });

      el.addEventListener('click', async () => {
        if (this.isResolving || this.isTransitioning) return;
        this.isResolving = true;
        this.attempts += 1;

        this.heroDied = false;

        card.setSelected(opt.correct);
        this.sound.play('card', { volume: 0.2 });

        this.onResult(opt);
        await this.combat.resolveAnswer(opt.correct);

        // 1) si murió, SIEMPRE manda overlay reintentar (y NO game over)
        if (this.heroDied) {
          this.isResolving = false;
          return;
        }

        // 2) si fue incorrecta (pero no murió), overlay hurt y NO avanza
        if (!opt.correct) {
          await this.showHurtOverlay();
          this.isResolving = false;
          return;
        }

        // 3) si fue correcta y es la última -> GameOver (ganaste)
        const total = globalState.questions.length;
        const isLast = this.qIndex >= total - 1;

        if (isLast) {
          this.goToGameOver(true);
          this.isResolving = false;
          return;
        }

        // 4) si fue correcta y no es la última -> avanzar normal
        await this.refillHeroBarIfNeeded();
        await this.endAnswerWithCurtain();

        this.isResolving = false;

      });

      this.domButtons.push(dom);
    });
  }

  clearCards() {
    this.cards.forEach(c => c.destroy());
    this.cards = [];
    this.domButtons.forEach(b => b.destroy());
    this.domButtons = [];
  }

  // ---------------------------
  // Fighters
  // ---------------------------

  createFighters() {
    const floorY = this.scale.height - 290;

    // Hero (izquierda)
    this.hero = this.add
      .sprite(this.scale.width * 0.3, floorY, 'hero', 0)
      .setScale(1.5)
      .setOrigin(0.5, 1);

    // Plant (derecha)
    this.plant = this.add
      .sprite(this.scale.width * 0.65, floorY + 20, 'plant1_idle', 0)
      .setScale(1.2)
      .setOrigin(0.5, 1);

    this.hero.play('hero_idle');
    this.plant.play('plant1_idle');
  }

  // ---------------------------
  // Health bars
  // ---------------------------

  createHealthBars() {
    // Graphics para barras
    this.heroHpBar = this.add.graphics().setDepth(1000);
    this.plantHpBar = this.add.graphics().setDepth(1000);

    // Dibuja una vez al inicio
    this.updateHealthBars();
  }

  updateHealthBars() {
    if (!this.hero || !this.plant || !this.heroHpBar || !this.plantHpBar) return;

    // --- Config ---
    const barW = 60;
    const barH = 8;
    const padY = 8;      // separación sobre la cabeza
    const radius = 6;
    const border = 2;

    // % de vida
    const heroPct = Phaser.Math.Clamp(this.heroDisplayPct, 0, 1);

    const plantPct = Phaser.Math.Clamp(this.plantDisplayPct, 0, 1);

    // Posición (origin 0.5,1 => y = pies)
    const heroTopY = this.hero.y - this.hero.displayHeight;
    const plantTopY = this.plant.y - this.plant.displayHeight;

    const heroX = this.hero.x - barW / 2;
    const heroY = heroTopY - padY;

    const plantX = this.plant.x - barW / 2;
    const plantY = plantTopY - padY;

    // Dibuja
    this.drawHpBar(this.heroHpBar, heroX, heroY, barW, barH, heroPct, radius, border);
    this.drawHpBar(this.plantHpBar, plantX, plantY, barW, barH, plantPct, radius, border);
  }

  private drawHpBar(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    pct: number,
    radius = 6,
    border = 2
  ) {
    const p = Phaser.Math.Clamp(pct, 0, 1);

    g.clear();

    // Fondo + borde
    g.fillStyle(0x000000, 0.55).fillRoundedRect(x, y, w, h, radius);
    g.lineStyle(border, 0xffffff, 0.6).strokeRoundedRect(x, y, w, h, radius);

    // Barra interna
    const innerW = Math.max(0, (w - border * 2) * p);
    const innerX = x + border;
    const innerY = y + border;
    const innerH = h - border * 2;

    // Color por % (verde/amarillo/rojo)
    const color = p > 0.5 ? 0x2ecc71 : p > 0.25 ? 0xf1c40f : 0xe74c3c;

    g.fillStyle(color, 0.95).fillRoundedRect(innerX, innerY, innerW, innerH, Math.max(0, radius - 2));
  }

  // ---------------------------
  // Telón 
  // ---------------------------

  private createCurtainOverlayDom() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.curtainDom = this.add.dom(0, 0).setOrigin(0, 0).setDepth(999999).createFromHTML(`
    <div id="curtain-overlay" class="${css['curtain-container']}" style="width: ${w}px; height: ${h}px;">
        <div id="curtain-msg" class='${css['curtain-msg']}'></div>

        <button id="curtain-next" class='${css['curtain-next']}'>
        </button>
      </div>
    `);


    const root = this.curtainDom.node as HTMLDivElement;

    const overlay = root.querySelector('#curtain-overlay') as HTMLDivElement;
    const msg = root.querySelector('#curtain-msg') as HTMLDivElement;
    const btn = root.querySelector('#curtain-next') as HTMLButtonElement;

    if (!overlay || !msg || !btn) throw new Error('No se pudo construir el curtain overlay');

    this.curtainDomEl = overlay;
    this.curtainMsgEl = msg;
    this.overlayBtnEl = btn;

    // Bloquea scroll/clicks “hacia el juego”
    overlay.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });

    btn.addEventListener('click', () => this.onOverlayPressed());
    btn.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.onOverlayPressed();
      }
    });
  }

  private async showOverlay(opts: {
    mode: 'next' | 'restart' | 'hurt';
    title: string;
    subtitle: string;
    buttonText: string;
  }) {
    this.overlayMode = opts.mode;

    // bloquear inputs del juego
    this.setAnswersEnabled(false);
    this.input.enabled = false;

    // oculta pregunta y cards para que quede limpio
    (this.questionDom.node as HTMLDivElement).style.display = 'none';

    this.curtainMsgEl.innerHTML = `
      <h1>${opts.title}</h1> <br/>
      <p>${opts.subtitle}</p>
    `;

    this.overlayBtnEl.textContent = opts.buttonText;

    const bodyHtm=`${opts.subtitle} Acción: ${opts.buttonText}`

    announceGuardian(opts.title, bodyHtm);

    await this.curtainDownDom(380);

    this.overlayBtnEl.disabled = false;
    this.overlayBtnEl.style.pointerEvents = 'auto';
    this.overlayBtnEl.focus();
  }

  private async hideOverlayAndResume() {
    // vuelve a mostrar UI
    (this.questionDom.node as HTMLDivElement).style.display = 'block';

    await this.curtainUpDom(380);

    this.input.enabled = true;
    this.setAnswersEnabled(true);

    const first = this.domButtons[0]?.node as HTMLButtonElement | undefined;
    first?.focus();
  }

  private async onOverlayPressed() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    try {
      if (this.overlayMode === 'next') {
        // ✅ SOLO en respuesta correcta
        this.qIndex += 1;

        // ✅ si ya terminó todo => GANASTE => GameOver con stats + detener Game
        const total = globalState.questions.length;
        if (this.qIndex >= total) {
          this.goToGameOver(true);
          return;
        }

        // ✅ siguiente pregunta
        this.loadQuestion(this.qIndex);
        await this.hideOverlayAndResume();
        return;
      }

      if (this.overlayMode === 'hurt') {
        // ✅ NO incrementa qIndex, repite MISMA pregunta
        this.loadQuestion(this.qIndex);
        await this.hideOverlayAndResume();
        return;
      }

      if (this.overlayMode === 'restart' || this.overlayMode === 'finish') {
        // ✅ limpia overlay para que no quede pegado
        this.curtainDomEl.style.pointerEvents = 'none';
        this.curtainDomEl.style.transform = 'translateY(-110%)';
        (this.questionDom.node as HTMLDivElement).style.display = 'block';

        // ✅ reinicio total del ciclo
        this.scene.restart();
        return;
      }
    } finally {
      this.isTransitioning = false;
    }
  }

  private async endAnswerWithCurtain() {
    const total = globalState.questions.length;
    // si ya vas a pasar a la siguiente
    await this.showOverlay({
      mode: 'next',
      title: '¡Nivel superado!',
      subtitle: `Siguiente desafío listo (${this.qIndex + 1} / ${total})`,
      buttonText: 'Siguiente'
    });
  }

  // ---------------------------
  // Telon helper methods
  // ---------------------------

  private curtainDownDom(duration = 380) {
    return new Promise<void>((resolve) => {
      // bloquear todo lo de abajo
      this.curtainDomEl.style.pointerEvents = 'auto';

      // fuerza reflow para que la transición siempre se dispare
      void this.curtainDomEl.offsetHeight;

      this.curtainDomEl.style.transform = 'translateY(0%)';

      const done = () => {
        this.curtainDomEl.removeEventListener('transitionend', done);
        resolve();
      };

      // fallback por si transitionend no dispara
      const t = window.setTimeout(() => {
        this.curtainDomEl.removeEventListener('transitionend', done);
        resolve();
      }, duration + 60);

      this.curtainDomEl.addEventListener('transitionend', () => {
        window.clearTimeout(t);
        done();
      }, { once: true });
    });
  }

  private curtainUpDom(duration = 380) {
    return new Promise<void>((resolve) => {
      this.curtainDomEl.style.transform = 'translateY(-110%)';

      const done = () => {
        this.curtainDomEl.removeEventListener('transitionend', done);
        // al estar arriba, no debe interceptar clics
        this.curtainDomEl.style.pointerEvents = 'none';
        resolve();
      };

      const t = window.setTimeout(() => {
        this.curtainDomEl.removeEventListener('transitionend', done);
        this.curtainDomEl.style.pointerEvents = 'none';
        resolve();
      }, duration + 60);

      this.curtainDomEl.addEventListener('transitionend', () => {
        window.clearTimeout(t);
        done();
      }, { once: true });
    });
  }

  // ---------------------------
  // Accesibilidad: aria-live
  // ---------------------------

  private createA11yLiveRegion() {
    // Div escondido (screen readers lo leen)
    this.a11yLiveDom = this.add.dom(0, 0).createFromHTML(`
      <div
        aria-live="polite"
        aria-atomic="true"
        style="
          position:absolute;
          left:-9999px;
          top:0;
          width:1px;
          height:1px;
          overflow:hidden;
        ">
      </div>
    `);

    this.a11yLiveEl = this.a11yLiveDom.node as HTMLDivElement;

    this.a11yLiveEl.focus();
  }

  // ---------------------------
  // Enable/disable answers
  // ---------------------------

  private setAnswersEnabled(enabled: boolean) {
    this.domButtons.forEach((dom) => {
      const el = dom.node as HTMLButtonElement;
      el.disabled = !enabled;
      el.style.pointerEvents = enabled ? 'auto' : 'none';
      el.style.opacity = enabled ? '1' : '0.6';
    });
  }

  // ---------------------------
  // Plant fill bar helper methods
  // ---------------------------
  private fillPlantBar(): Promise<void> {
    this.plantFillTween?.stop();

    return new Promise((resolve) => {
      this.plantFillTween = this.tweens.add({
        targets: this,
        plantDisplayPct: 1,
        duration: 300,
        ease: 'Sine.easeOut',
        onUpdate: () => this.updateHealthBars(),
        onComplete: () => resolve()
      });
    });
  }

  private setPlantType(type: PlantType) {
    this.plantType = type;

    const floorY = this.scale.height - 290;

    // 1..3 => plants
    if (type <= 3) {
      const plantY = floorY + 20; // tu valor actual
      this.plant.setPosition(this.scale.width * 0.65, plantY);

      const idleTexture = `plant${type}_idle`;
      const idleAnim = `plant${type}_idle`;

      this.plant.setTexture(idleTexture, 0);
      this.plant.play(idleAnim, true);
    }
    // 4..6 => slimes (slime1..3)
    else {
      const slimeY = floorY + 30; // 🔥 ajusta este offset
      this.plant.setPosition(this.scale.width * 0.65, slimeY);

      const slimeN = (type - 3) as 1 | 2 | 3;
      const idleTexture = `slime${slimeN}_idle`;
      const idleAnim = `slime${slimeN}_idle`;

      this.plant.setTexture(idleTexture, 0);
      this.plant.play(idleAnim, true);
    }

    // reset HP
    this.plantMaxHP = 1;
    this.plantHP = 1;
    this.plantDisplayPct = 1;

    this.plant.setOrigin(0.5, 1);
    this.updateHealthBars();
  }

  private refillHeroBarIfNeeded(): Promise<void> {
    // si ya está llena, no hacemos nada
    if (this.hp >= this.maxHP) return Promise.resolve();

    // curación automática: vuelve a full
    this.hp = this.maxHP;

    // anima la barra al 100%
    this.heroFillTween?.stop();

    return new Promise((resolve) => {
      this.heroFillTween = this.tweens.add({
        targets: this,
        heroDisplayPct: 1,
        duration: 320,
        ease: 'Sine.easeOut',
        onUpdate: () => this.updateHealthBars(),
        onComplete: () => resolve()
      });
    });
  }

  // ---------------------------
  // Utils
  // ---------------------------

  private escapeHtml(str: string) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private async onHeroDead() {
    this.heroDied = true;
    const total = globalState.questions.length;

    await this.showOverlay({
      mode: 'restart',
      title: 'Game Over',
      subtitle: `Llegaste hasta la pregunta ${this.qIndex + 1} de ${total}.<br/><br/>
                 Pero no te rindas… <br/><br/> 
                 La próxima sale mejor!`,
      buttonText: 'Reintentar'
    });
  }

  private async showHurtOverlay() {
    const life = this.hp > 1 ? 'Te quedan <b>' + this.hp + '</b> vidas' : ' Te queda <b>' + this.hp + '</b> vida';
    await this.showOverlay({
      mode: 'hurt',
      title: '¡Auch!',
      subtitle: `${life}.<br/><br/>
              Inténtalo de nuevo en la siguiente.<br/><br/>
              Mantén la calma: puedes recuperarte.`,
      buttonText: 'Siguiente'
    });
  }

  private getEnemiesDefeated() {
    return this.enemiesDefeated;
  }

  private goToGameOver(win: boolean) {
    // mata DOM del gameplay (si no, quedan flotando en el documento)
    this.clearCards();
    this.questionDom?.destroy();

    if (this.curtainDomEl) {
      this.curtainDomEl.style.pointerEvents = 'none';
      this.curtainDomEl.style.transform = 'translateY(-110%)';
    }
    this.curtainDom?.destroy();

    // para la escena actual sí o sí
    this.scene.stop('Game');
    const total = globalState.questions.length;

    // inicia GameOver con stats
    this.scene.start('GameOver', {
      win,
      hpLeft: this.hp,
      maxLives: this.maxHP,
      enemiesDefeated: this.getEnemiesDefeated(),
      questionsAnswered: win ? total : this.qIndex + 1,
      totalQuestions: total,
      attempts: this.attempts,
    });
  }

  // ---------------------------
  // Events
  // ---------------------------

  private emitResult(payload: GameResult) {
    const cb = this.game.registry.get('onResultCallback') as ((r: GameResult) => void) | undefined;
    cb?.(payload);
  }

  private onResult(opt: Option) {
    const questions = globalState.questions;
    const question = questions[this.qIndex];

    const correctOpt = question?.options.find(o => o.correct);
    const correctAnswer = correctOpt?.id ?? '';

    announce(
      `Seleccionaste la opción ${opt.id}: ${opt.text}. ` +
      (opt.correct ? 'Correcto.' : `Incorrecto.`) +
      ` Pregunta ${this.qIndex + 1} de ${questions.length}.`
    );

    const result: GameResult = {
      isCorrect: opt.correct,
      questionIndex: this.qIndex,
      selectedAnswer: opt.id,           // ✅ la que escogió
      correctAnswer,                   // ✅ id de la correcta
      question                         // ✅ question completa
    };

    this.emitResult(result);
  }


}
