import { Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { announceGuardian } from '../utils/announce';

import css from '../styles/space-typer.module.css';

type OverlayStep = 'none' | 'howto1' | 'howto';

export class MainMenu extends Scene {
  // asteroides del fondo
  private asteroids!: Phaser.GameObjects.Group;

  // UI refs
  private startBtnDom!: Phaser.GameObjects.DOMElement;
  private overlayDom!: Phaser.GameObjects.DOMElement;

  private overlayRoot!: HTMLDivElement;
  private overlayTitle!: HTMLDivElement;
  private overlayBody!: HTMLDivElement;
  private overlayBtn!: HTMLButtonElement;

  private step: OverlayStep = 'none';
  private isTransitioning = false;

  constructor() {
    super('MainMenu');
  }

  create() {
    // detener cualquier otro audio activo
    this.sound.stopAll();
    this.sound.play('Ambience-menu', { loop: true, volume: 0.5 });

    const { width, height } = this.scale;

    const asteroides = ['asteroid1', 'asteroid2', 'asteroid3', 'asteroid4'];

    // Distribuir asteroides al azar para usarlos como capa de parallax
    this.asteroids = this.add.group();
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(2, width);
      const y = Phaser.Math.Between(1, height);
      const scale = Phaser.Math.FloatBetween(2.55, 0.5);
      
      const ast = this.add.image(x, y, Phaser.Math.RND.pick(asteroides))
        .setScale(scale)
        .setAlpha(0.9)
        .setDepth(-1);
      ast.preFX?.addGlow(0xffffff, 1, 0);
      this.asteroids.add(ast);
    }


    // --- UI Intro ---
    this.renderIntroUI();
    // música
    /*     this.audio = new Audio(this, {
      musicKey: 'initial',
      x: width - 30,
      y: 36,
      cssButtonMusic: css['button-music'],
      cssButtonMusicMuted: css['button-music-muted'],
      volume: 0.1,
      storageKey: 'mm_music_muted', // importante: mismo key en todas las escenas
    }); */

    // --- Overlay (Historia / Instrucciones) ---
    this.createOverlayDom();

    EventBus.on('toggle-mute', this.handleToggleMute, this);

    // cleanup
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off('toggle-mute', this.handleToggleMute, this);
      this.startBtnDom?.destroy();
      this.overlayDom?.destroy();
    });
  }

  private handleToggleMute = (): void => {
    this.sound.mute = !this.sound.mute;
  };

  private renderIntroUI() {
    const { width, height } = this.scale;

    // Título / Base del botón
    const btnX = width / 2;
    const btnY = height / 2;

    // Usaremos la clase cyberBtn que ya creamos en CSS para mantener la estética
    this.startBtnDom = this.add.dom(btnX, btnY).createFromHTML(`
      <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
        <button id="btn-start" aria-label="Iniciar Misión" class="${css.cyberBtn}" style="font-size: 1.8rem; height: 72px; padding: 0 3rem; color: var(--accent); white-space: nowrap;">
          <span class="${css.btnBackdrop}" style="opacity: 0.2;"><span class="${css.btnCorner}" style="width: 15px; height: 15px;"></span></span>
          
          <span style="font-weight: 600; text-shadow: 0 0 10px rgba(125, 249, 255, 0.4);">INICIAR MISIÓN</span>
        </button>
      </div>
    `);

    const startBtn = this.startBtnDom.node.querySelector('#btn-start') as HTMLButtonElement;
    
    // Para asegurar que reciba clics de Phaser en el overlay top
    (this.startBtnDom.node as HTMLDivElement).style.pointerEvents = 'none';
    startBtn.style.pointerEvents = 'auto';

    startBtn.addEventListener('click', () => {
      this.sound.play('menu-click', { volume: 0.5 });
      this.openStory();
    });
    startBtn.addEventListener('mouseenter', () => {
      this.sound.play('menu-hover', { volume: 0.2 });
    });
    startBtn.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this.sound.play('menu-click', { volume: 0.5 });
        this.openStory();
      }
    });

    // 3) Animaciones suaves
    this.playIntroTweens();
  }

  private playIntroTweens() {
    // Escalar la escala del contenedor para un efecto de latido leve
    this.tweens.add({
      targets: this.startBtnDom,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // ---------------------------
  // Overlay DOM
  // ---------------------------

  private createOverlayDom() {
    const { width, height } = this.scale;

    this.overlayDom = this.add.dom(0, 0).setOrigin(0).setDepth(999999).createFromHTML(`
      <div id="mm-overlay" class="${css.modalOverlay}" style="width: ${width}px; height: ${height}px; transform: translateY(-110%); transition: transform 0.4s ease;">
        <div class="${css.modal}">
          <section class="${css.modalBody}">
            <div class="${css.bodyBackdrop}">
              <div class="${css.backdrop}">
                <div class="${css.version}">v001.e1349837856</div>
                <div class="${css.corner}"></div>
              </div>
            </div>
            
            <div class="${css.bodyContent}">
              <h2><span id="mm-title">SPACE TYPER</span></h2>
              <div class="${css.bodyText}" id="mm-body">
              Instrucciones para el juego Space Typer: Escribe las palabras que aparecen sobre las naves invasoras para destruirlas antes de que lleguen a la Tierra. Cada nave tiene una palabra única, así que mantente atento y escribe rápido. Si una nave logra hacer contacto, perderás integridad de escudo (vidas). ¡Defiende el cuadrante y salva la Tierra!
              </div>

              <!-- Este div duplicado es necesario para el efecto de Glitch del texto -->
              <div class="${css.modalGlitch}" aria-hidden="true">
                <h2><span id="mm-title-glitch">SPACE TYPER</span></h2>
                <div class="${css.bodyText}" id="mm-body-glitch">
                  Instrucciones para el juego Space Typer: Escribe las palabras que aparecen sobre las naves invasoras para destruirlas antes de que lleguen a la Tierra. Cada nave tiene una palabra única, así que mantente atento y escribe rápido. Si una nave logra hacer contacto, perderás integridad de escudo (vidas). ¡Defiende el cuadrante y salva la Tierra!
                </div>
              </div>
            </div>
          </section>

          <div class="${css.modalActions}">
            <button id="mm-close" aria-label="Cancel" class="${css.cyberBtn}">
              <span class="${css.btnBackdrop}"><span class="${css.btnCorner}"> </span></span>
              <kbd>esc</kbd>
              <span>Regresar</span>
            </button>
            
            <button id="mm-next" autoFocus aria-label="Proceed" class="${css.cyberBtn}">
              <span class="${css.btnBackdrop}"><span class="${css.btnCorner}"></span></span>
              <kbd>➡︎</kbd>
              <span id="mm-next-text">Siguiente</span>
            </button>
          </div>
        </div>
      </div>
    `);

    const root = this.overlayDom.node as HTMLDivElement;
    
    // Si Phaser retorna el div 'mm-overlay' directamente como nodo es porque no necesitaba encapsularlo
    this.overlayRoot = (root.id === 'mm-overlay') ? root : root.querySelector('#mm-overlay') as HTMLDivElement;
    
    this.overlayTitle = root.querySelector('#mm-title') as HTMLDivElement;
    this.overlayBody = root.querySelector('#mm-body') as HTMLDivElement;
    this.overlayBtn = root.querySelector('#mm-next') as HTMLButtonElement;

    const closeBtn = root.querySelector('#mm-close') as HTMLButtonElement;

    // bloquear wheel hacia el canvas
    this.overlayRoot?.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });

    this.overlayBtn?.addEventListener('mouseenter', () => this.sound.play('menu-hover', { volume: 0.3 }));
    this.overlayBtn?.addEventListener('click', () => {
      this.sound.play('menu-click', { volume: 0.5 });
      this.onOverlayNext();
    });
    this.overlayBtn?.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this.sound.play('menu-click', { volume: 0.5 });
        this.onOverlayNext();
      }
    });

    closeBtn?.addEventListener('mouseenter', () => this.sound.play('menu-hover', { volume: 0.3 }));
    closeBtn?.addEventListener('click', () => {
      this.sound.play('menu-click', { volume: 0.5 });
      this.hideOverlay();
    });
    closeBtn?.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
        e.preventDefault();
        this.sound.play('menu-click', { volume: 0.5 });
        this.hideOverlay();
      }
    });
  }

  // ---------------------------
  // Flow: Iniciar → Historia → Instrucciones → Game
  // ---------------------------

  private setModalContent(title: string, body: string, btnText: string) {
    this.overlayTitle.innerHTML = title;
    this.overlayBody.innerHTML = body;
    
    // Update glitch clones
    const root = this.overlayDom.node as HTMLDivElement;
    const titleGlitch = root.querySelector('#mm-title-glitch') as HTMLDivElement;
    const bodyGlitch = root.querySelector('#mm-body-glitch') as HTMLDivElement;
    const nextText = root.querySelector('#mm-next-text') as HTMLSpanElement;

    titleGlitch.innerHTML = title;
    bodyGlitch.innerHTML = body;
    nextText.textContent = btnText;
  }

  private openStory() {
    this.step = 'howto1';

    const title = 'Space Typer';
    const body = `
      <p>
        El radar ha detectado una anomalía.
        Naves hostiles se aproximan con intenciones destructivas.
      </p>
      <p><b>Tu misión:</b> defender el cuadrante tipeando su código de amenaza.</p>
    `;

    this.setModalContent(title, body, 'Siguiente');

    // ✅ announce del guardián
    announceGuardian(title, body);

    this.showOverlay();
  }

  private openHowTo() {
    this.step = 'howto';

    const title = 'Instrucciones';
    const body = `
    <p>• Observa cuidadosamente las palabras sobre cada nave invasora.</p>
    <p>• Las naves con la letra coincidente serán fijadas y destruidas al escribirlas.</p>
    <p>• Si logran hacer contacto, perderás integridad de escudo (vidas).</p>
  `;

    this.setModalContent(title, body, 'Comenzar');

    announceGuardian(title, body);

  }

  private onOverlayNext() {
    if (this.isTransitioning) return;

    if (this.step === 'howto1') {
      this.openHowTo();
      return;
    }

    if (this.step === 'howto') {
      // ir al juego
      this.hideOverlay().then(() => {
        this.scene.start('MainScene');
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
    const startBtn = this.startBtnDom.node.querySelector('#btn-start') as HTMLButtonElement;
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.style.opacity = '0.75';
    }

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

        const startBtn = this.startBtnDom.node.querySelector('#btn-start') as HTMLButtonElement;
        if (startBtn) {
          startBtn.disabled = false;
          startBtn.style.opacity = '1';
          startBtn.focus();
        }

        this.isTransitioning = false;
        resolve();
      }, 420);
    });
  }

  update(_time: number, delta: number) {
    if (this.asteroids) {
      this.asteroids.getChildren().forEach((child) => {
        const ast = child as Phaser.GameObjects.Image;
        
        // Movimiento muy lento hacia abajo (capa lejana de parallax vertical)
        ast.y -= 0.012 * delta; 
        
        // Rotación sutil durante la caída
        ast.rotation += 0.0003 * delta; 
        
        // Si sale totalmente de la pantalla por arriba, devolverla abajo
        if (ast.y < -50) {
          ast.y = this.scale.height + 50;
          ast.x = Phaser.Math.Between(0, this.scale.width);
        }
      });
    }
  }
}
