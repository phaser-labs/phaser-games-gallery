import { GameObjects, Scene } from 'phaser';

import { Audio } from '../components';
import { ThemeType } from '../types/types';
import { announce, announceGuardian } from '../utils/announce';
import { themeManager } from '../utils/theme-manager';

import css from '../styles/game-attack.module.css';

type OverlayStep = 'none' | 'story' | 'howto';

export class MainMenu extends Scene {
  background!: GameObjects.Image;

  // UI refs
  private titleTextObj!: GameObjects.Text;
  private subtitleTextObj!: GameObjects.Text;
  private titlePlateGfx!: GameObjects.Graphics;
  private startBaseGfx!: GameObjects.Graphics;

  private startBtnDom!: Phaser.GameObjects.DOMElement;
  private overlayDom!: Phaser.GameObjects.DOMElement;

  private overlayRoot!: HTMLDivElement;
  private overlayTitle!: HTMLDivElement;
  private overlayBody!: HTMLDivElement;
  private overlayBtn!: HTMLButtonElement;

  private step: OverlayStep = 'none';
  private isTransitioning = false;

  audio!: Audio;

  constructor() {
    super('MainMenu');
  }

  preload() { }

  create() {
    const theme = this.getTheme()
    const { width, height } = this.scale;

    // --- Fondo (usa tu asset) ---
    this.background = this.add.image(0, 0, 'bg').setOrigin(0);
    this.background.displayWidth = width;
    this.background.displayHeight = height;

    // --- Oscurecer un poco para que el UI resalte ---
    this.add.rectangle(0, 0, width, height, 0x000000, 0.35).setOrigin(0);

    // --- UI ---
    this.renderIntroUI(theme);

    // música
    this.audio = new Audio(this, {
      musicKey: 'initial',
      x: width - 30,
      y: 36,
      cssButtonMusic: css['button-music'],
      cssButtonMusicMuted: css['button-music-muted'],
      volume: 0.1,
      storageKey: 'mm_music_muted', // importante: mismo key en todas las escenas
    });


    // --- Overlay (Historia / Instrucciones) ---
    this.createOverlayDom();

    // cleanup
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.startBtnDom?.destroy();
      this.overlayDom?.destroy();
      this.audio?.destroy();

      this.titleTextObj?.destroy();
      this.subtitleTextObj?.destroy();
      this.titlePlateGfx?.destroy();
      this.startBaseGfx?.destroy();
    });
  }

  // ===========================
  // ✅ INTRO UI (bonito)
  // ===========================

  private renderIntroUI(theme = this.getTheme()) {
    const { width, height } = this.scale;

    // 1) Título + placa
    const titleY = height / 2 - 50;

    this.titlePlateGfx = this.add.graphics().setDepth(10);

    const titleText = 'El templo del conocimiento';

    this.titleTextObj = this.add.text(width / 2, titleY, titleText, {
      fontFamily: '"PixelFont", Arial',
      fontSize: '46px',
      color: '#d7e2ff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    this.drawTitlePlate(this.titlePlateGfx, this.titleTextObj, titleY, theme);

    // 2) Base del botón + botón DOM
    const btnX = width / 2;
    const btnY = height * 0.75;

    this.startBaseGfx = this.add.graphics();
    this.drawStartBase(this.startBaseGfx, btnX, btnY, theme);

    this.startBtnDom = this.add.dom(btnX, btnY).createFromHTML(`
      <button id="btn-start"
        class='${css['curtain-next']}'
        aria-label="Iniciar"
        style="
          font-size: 26px;
          padding: 14px 34px;
          border-radius: 14px;
        "
      >Iniciar</button>
    `);

    const startBtn = this.startBtnDom.node as HTMLButtonElement;
    startBtn.style.pointerEvents = 'auto';

    startBtn.addEventListener('click', () => this.openStory());
    startBtn.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this.openStory();
      }
    });

    announce('El templo del conocimiento, un juego de preguntas y respuestas. Presiona "Iniciar" para jugar.');

    // 3) Animaciones suaves
    this.playIntroTweens();
  }

  private drawTitlePlate(g: Phaser.GameObjects.Graphics, title: Phaser.GameObjects.Text, y: number, theme = this.getTheme()) {
    const { width } = this.scale;

    const padX = 30;
    const padY = 18;
    const plateW = title.width + padX * 2;
    const plateH = title.height + padY * 2;

    const x = width / 2 - plateW / 2;
    const top = y - plateH / 2;

    const bg = this.hexToInt(theme.colors.background);   // fondo oscuro
    const primary = this.hexToInt(theme.colors.primary); // borde fuerte
    const secondary = this.hexToInt(theme.colors.secondary);

    g.clear();

    // fondo
    g.fillStyle(bg, 0.55);
    g.fillRoundedRect(x, top, plateW, plateH, 16);

    // borde arcano
    g.lineStyle(4, primary, 0.70);
    g.strokeRoundedRect(x, top, plateW, plateH, 16);

    // borde interior suave
    g.lineStyle(2, secondary, 0.55);
    g.strokeRoundedRect(x + 6, top + 6, plateW - 12, plateH - 12, 12);
  }

  private drawStartBase(g: Phaser.GameObjects.Graphics, cx: number, cy: number, theme = this.getTheme()) {
    g.clear();

    const bg = this.hexToInt(theme.colors.background);
    const secondary = this.hexToInt(theme.colors.secondary);

    // base “card”
    g.fillStyle(bg, 0.35);
    g.fillRoundedRect(cx - 150, cy - 52, 300, 104, 18);

    // borde suave
    g.lineStyle(3, secondary, 0.35);
    g.strokeRoundedRect(cx - 150, cy - 52, 300, 104, 18);
  }

  private playIntroTweens() {
    // SOLO base botón (alpha)
    this.tweens.add({
      targets: this.startBaseGfx,
      alpha: { from: 0.55, to: 0.8 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // ---------------------------
  // Overlay DOM
  // ---------------------------

  private createOverlayDom() {
    const { width, height } = this.scale;

    this.overlayDom = this.add.dom(0, 0).setOrigin(0).setDepth(999999).createFromHTML(`
      <div id="mm-overlay" class="${css['overlay-container']}" style=" width: ${width}px; height: ${height}px;">
        <div class="${css['overlay-main']}">
        
          <!-- personaje / ícono -->
          <div class="${css['overlay-character']}">
            <img
              class="${css['overlay-character-img']}"
              src="assets/game-attack/images/characters/guardian.png"
              alt="Guardiana Arcana"
            />
          </div>

          <!-- contenido -->
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div id="mm-title" style="
              font-size: 1.7rem;
              font-weight: 900;
            "></div>

            <div id="mm-body" style="
              font-size: 1.2rem;
              color: rgba(215,226,255,0.92);
            "></div>

            <div style="display:flex; gap: 10px; margin-top: 6px;">
              <button id="mm-next" class='${css['curtain-next']}' aria-label="Siguiente">Siguiente</button>
              <button id="mm-close" aria-label="Cerrar" class='${css['button-close']}'>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `);

    const root = this.overlayDom.node as HTMLDivElement;
    this.overlayRoot = root.querySelector('#mm-overlay') as HTMLDivElement;
    this.overlayTitle = root.querySelector('#mm-title') as HTMLDivElement;
    this.overlayBody = root.querySelector('#mm-body') as HTMLDivElement;
    this.overlayBtn = root.querySelector('#mm-next') as HTMLButtonElement;

    const closeBtn = root.querySelector('#mm-close') as HTMLButtonElement;

    // bloquear wheel hacia el canvas
    this.overlayRoot.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });

    this.overlayBtn.addEventListener('click', () => this.onOverlayNext());
    this.overlayBtn.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this.onOverlayNext();
      }
    });

    closeBtn.addEventListener('click', () => this.hideOverlay());
    closeBtn.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this.hideOverlay();
      }
    });
  }

  // ---------------------------
  // Flow: Iniciar → Historia → Instrucciones → Game
  // ---------------------------

  private openStory() {
    this.step = 'story';

    const title = 'El templo del conocimiento';
    const body = `
      Soy el guardián del templo.<br/><br/>
      El <b>templo</b> ha sido corrompido y las criaturas custodian sus pruebas.<br/>
      Solo quienes dominan el conocimiento podrán avanzar.<br/><br/>
      <b>Tu sabiduría será tu arma.</b>
    `;

    this.overlayTitle.textContent = title;
    this.overlayBody.innerHTML = body;

    // ✅ announce del guardián
    announceGuardian(title, body);

    this.overlayBtn.textContent = 'Siguiente';
    this.showOverlay();
  }

  private openHowTo() {
    this.step = 'howto';

    const title = 'Cómo jugar';
    const body = `
    • Cada enemigo es una pregunta.<br/>
    • Responde correctamente para derrotarlo.<br/>
    • Cada error te hace perder una vida.<br/>
    • Si pierdes todas tus vidas, deberás reiniciar.<br/><br/>
    Recuerda: <b>El conocimiento es poder.</b>
  `;

    this.overlayTitle.textContent = title;
    this.overlayBody.innerHTML = body;

    announceGuardian(title, body);

    this.overlayBtn.textContent = 'Comenzar';
    this.showOverlay();
  }

  private onOverlayNext() {
    if (this.isTransitioning) return;

    if (this.step === 'story') {
      this.openHowTo();
      return;
    }

    if (this.step === 'howto') {
      // ir al juego
      this.hideOverlay().then(() => {
        this.scene.start('GameMain');
      });
    }
  }

  // ---------------------------
  // Show/Hide helpers
  // ---------------------------

  private showOverlay() {
    this.isTransitioning = true;
    this.overlayDom?.setVisible(true);

    // deshabilita botón iniciar mientras está el overlay
    const startBtn = this.startBtnDom.node as HTMLButtonElement;
    startBtn.disabled = true;
    startBtn.style.opacity = '0.75';

    this.overlayRoot.style.pointerEvents = 'auto';
    void this.overlayRoot.offsetHeight;
    this.overlayRoot.style.transform = 'translateY(0%)';

    window.setTimeout(() => {
      this.overlayBtn.focus();
      this.isTransitioning = false;
    }, 420);
  }

  private hideOverlay() {
    return new Promise<void>((resolve) => {
      this.isTransitioning = true;

      this.overlayRoot.style.transform = 'translateY(-110%)';

      window.setTimeout(() => {
        this.overlayRoot.style.pointerEvents = 'none';
        this.step = 'none';

        this.overlayDom?.setVisible(false);

        const startBtn = this.startBtnDom.node as HTMLButtonElement;
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.focus();

        this.isTransitioning = false;
        resolve();
      }, 420);
    });
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
