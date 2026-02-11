import { GameObjects } from 'phaser';

import { Audio } from '../components';
import { GameOverData, ThemeType } from '../types/types';
import { announce } from '../utils/announce';
import { createAnimations } from '../utils/game-animations';
import { themeManager } from '../utils/theme-manager';

import css from '../styles/game-attack.module.css';

export class GameOver extends Phaser.Scene {
  private dataRun!: GameOverData;

  private statsDom!: GameObjects.DOMElement;

  private audio!: Audio;

  constructor() {
    super('GameOver');
  }

  preload() { }

  init(data: GameOverData) {
    // ✅ fallback por si entras sin data
    this.dataRun = {
      win: true,
      hpLeft: data?.hpLeft ?? 0,
      maxLives: data?.maxLives ?? 3,
      enemiesDefeated: data?.enemiesDefeated ?? 0,
      questionsAnswered: data?.questionsAnswered ?? 0,
      totalQuestions: data?.totalQuestions ?? 0,
      attempts: data?.attempts ?? 0,
    };
  }

  create() {
    const theme = this.getTheme()

    this.cameras.main.fadeIn(300, 0, 0, 0);

    const { width, height } = this.scale;

    const bg = this.add.image(0, 0, 'bg').setOrigin(0);
    bg.displayWidth = width;
    bg.displayHeight = height;

    this.renderTitle(width, height, theme);

    createAnimations(this);
    this.renderAnimation(width);

    // UI música
    this.audio = new Audio(this, {
      musicKey: 'dungeon',        // ✅ música distinta
      x: width - 30,
      y: 36,
      cssButtonMusic: css['button-music'],
      cssButtonMusicMuted: css['button-music-muted'],
      volume: 0.1,
      storageKey: 'mm_music_muted' // ✅ mismo storageKey para mantener mute entre escenas
    });

    // Panel de stats al lado (NO encima del héroe)
    this.statsDom = this.createStatsPanel(width * 0.25, height * 0.65);

    // limpiar DOM cuando sales
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.statsDom?.destroy();
      this.audio?.destroy();
    });
  }

  renderTitle(width: number, height: number, theme: ThemeType) {
    const centerX = width * 0.48;
    const y = height * 0.2;

    // 1) Elementos (aún no los agregamos al container)
    const title = this.add
      .text(0, 0, '¡GANASTE!', {
        fontFamily: '"PixelFont", Arial',
        fontSize: '46px',
        color: '#d7e2ff',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5); // ahora ancla a la izquierda, más fácil medir

    const trophy = this.add
      .image(0, 0, 'trophy')
      .setScale(0.8)
      .setOrigin(0, 0.5);

    // 2) Separación entre texto y trofeo
    const gap = 16;
    trophy.x = title.width + gap;

    // 3) Container principal
    const content = this.add.container(centerX, y, [title, trophy]);

    // 4) Centramos el container por su ancho total
    // (es más estable que setOrigin en container)
    const totalW = trophy.x + trophy.displayWidth;
    const totalH = Math.max(title.height, trophy.displayHeight);

    // Reposiciona hijos para que el contenido quede centrado en (0,0) del container
    title.x = -totalW / 2;
    trophy.x = title.x + title.width + gap;

    const bg = this.hexToInt(theme.colors.background);   // fondo oscuro
    const primary = this.hexToInt(theme.colors.primary); // borde fuerte
    const secondary = this.hexToInt(theme.colors.secondary);

    // ✅ Placa calculada con el tamaño del contenido (texto + trofeo)
    const padX = 28;
    const padY = 16;

    const plateW = totalW + padX * 2;
    const plateH = totalH + padY * 2;

    const plate = this.add.graphics();
    plate.clear();

    // fondo
    plate.fillStyle(bg, 0.55);
    plate.fillRoundedRect(-plateW / 2, -plateH / 2, plateW, plateH, 16);

    // borde arcano
    plate.lineStyle(4, primary, 0.70);
    plate.strokeRoundedRect(-plateW / 2, -plateH / 2, plateW, plateH, 16);

    // borde interior suave
    plate.lineStyle(2, secondary, 0.55);
    plate.strokeRoundedRect(-plateW / 2 + 6, -plateH / 2 + 6, plateW - 12, plateH - 12, 12);

    // 5) Mete la placa al MISMO container, atrás
    content.addAt(plate, 0);

    // 6) Depth: placa atrás, texto/trofeo adelante
    plate.setDepth(10);
    title.setDepth(20);
    trophy.setDepth(20);
  }

  renderAnimation(width: number) {
    const floorY = this.scale.height - 290;

    const hero = this.add
      .sprite(width * 0.5, floorY, 'hero', 0)
      .setScale(1.5)
      .setOrigin(0.5, 1);

    if (this.anims.exists('hero_jump')) {
      hero.play('hero_jump', true);
    } else {
      console.warn('❌ No existe anim hero_idle en GameOver');
    }
  }

  private createStatsPanel(x: number, y: number) {
    const d = this.dataRun;

    // Puedes mapear valores a 0..10 ticks (ejemplo):
    const livesSteps = d.maxLives ?? 3;
    const livesValue = d.hpLeft ?? 0;

    const attemptsSteps = (d.totalQuestions ?? 1) * (livesSteps - 1);
    const attemptsValue = d.attempts ?? 0;

    // Enemigos: aquí decide el “máximo” (opción A: totalQuestions)
    const enemiesSteps = d.totalQuestions ?? 1;
    const enemiesValue = d.enemiesDefeated ?? 0;


    const dom = this.add.dom(x, y).setOrigin(0, 0).setDepth(9999).createFromHTML(`
      <div class="${css.statsPanel}">
        <div class="${css.statTitle}">Estadísticas</div>

        <div class="${css.statRow}">
          <div class="${css.statLabel} ${css.left}">Vidas</div>
          <div class="${css.statBar}" data-name="hp">
            <div class="${css.ticks}" data-role="ticks"></div>
            <div class="${css.fill}" data-role="fill"></div>
            <div class="${css.thumb}" data-role="thumb"></div>
          </div>
          <div class="${css.statLabel} ${css.right}">${d.hpLeft}/${d.maxLives}</div>
        </div>

        <div class="${css.statRow}">
          <div class="${css.statLabel} ${css.left}">Intentos</div>
          <div class="${css.statBar}" data-name="attempts">
            <div class="${css.ticks}" data-role="ticks"></div>
            <div class="${css.fill}" data-role="fill"></div>
            <div class="${css.thumb}" data-role="thumb"></div>
          </div>
          <div class="${css.statLabel} ${css.right}">${d.attempts}</div>
        </div>

        <div class="${css.statRow}">
          <div class="${css.statLabel} ${css.left}">Enemigos</div>
          <div class="${css.statBar}" data-name="enemies">
            <div class="${css.ticks}" data-role="ticks"></div>
            <div class="${css.fill}" data-role="fill"></div>
            <div class="${css.thumb}" data-role="thumb"></div>
          </div>
          <div class="${css.statLabel} ${css.right}">${d.enemiesDefeated}</div>
        </div>

        <button id="go-mainmenu" class='${css['curtain-next']}'>
          Volver al inicio
        </button>
      </div>
    `);

    const root = dom.node as HTMLDivElement;
    const btn = root.querySelector('#go-mainmenu') as HTMLButtonElement | null;

    const initBar = (bar: HTMLElement, steps: number, current: number) => {
      const safeSteps = Math.max(1, steps);
      const safeCurrent = Math.max(0, Math.min(safeSteps, current));

      const ticks = bar.querySelector('[data-role="ticks"]') as HTMLDivElement;
      ticks.innerHTML = new Array(safeSteps).fill(0).map(() => `<span></span>`).join('');

      const pct = (safeCurrent / safeSteps) * 100;

      const fill = bar.querySelector('[data-role="fill"]') as HTMLDivElement;
      const thumb = bar.querySelector('[data-role="thumb"]') as HTMLDivElement;

      fill.style.width = `${pct}%`;
      thumb.style.left = `calc(${pct}% - 5px)`;
    };

    announce(
      `¡GANASTE! ` +
      `Vidas restantes: ${d.hpLeft} de ${d.maxLives}. ` +
      `Intentos: ${d.attempts}. ` +
      `Enemigos derrotados: ${d.enemiesDefeated}. ` +
      `Presiona "Volver al inicio" para volver al inicio.`
    );


    if (btn) {
      btn.style.pointerEvents = 'auto';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.scene.start('MainMenu');
      });

      btn.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          this.scene.start('MainMenu');
        }
      });
    }

    initBar(root.querySelector('[data-name="hp"]') as HTMLElement, livesSteps, livesValue);
    initBar(root.querySelector('[data-name="attempts"]') as HTMLElement, attemptsSteps, attemptsValue);
    initBar(root.querySelector('[data-name="enemies"]') as HTMLElement, enemiesSteps, enemiesValue);


    return dom;
  }

  // ---------------------------
  // Theme helpers
  // ---------------------------

  private getTheme(): ThemeType {
    return themeManager.getCurrentTheme();
  }

  private hexToInt(hex: string) {
    return parseInt(hex.replace('#', ''), 16);
  }

}
