import Phaser from 'phaser';

import { announce } from './announce';
import { ASSETS } from './game-assets';

import css from '../styles/kitty-farm.module.css';

const SEED_FRAMES = [0, 6] as const;
const ZOOM = 3;

interface SeedCount {
  corn: number;
  tomato: number;
}

export class SidePanelUI {
  private scene: Phaser.Scene;

  private dom!: Phaser.GameObjects.DOMElement;
  private panelEl!: HTMLDivElement;
  private tabEl!: HTMLButtonElement;

  // PLANTAS
  private cornCountEl!: HTMLSpanElement;
  private tomatoCountEl!: HTMLSpanElement;
  private cornCanvasEl!: HTMLCanvasElement;
  private tomatoCanvasEl!: HTMLCanvasElement;

  // COSECHA
  private cornHarvestCanvas!: HTMLCanvasElement;
  private tomatoHarvestCanvas!: HTMLCanvasElement;
  private cornHarvestCountEl!: HTMLSpanElement;
  private tomatoHarvestCountEl!: HTMLSpanElement;

  private selectedSeed: 'corn' | 'tomato' | null = null;

  private isOpen = false;
  private seeds: SeedCount = { corn: 0, tomato: 0 };
  private crops: SeedCount = { corn: 0, tomato: 0 };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init() {
    const W = this.scene.scale.gameSize.width;
    const H = this.scene.scale.gameSize.height;

    this.dom = this.scene.add.dom(W / 2, H / 2)
      .setOrigin(0.5, 0.5)
      .setDepth(19)
      .setScrollFactor(0)
      .setScale(1 / ZOOM)
      .createFromHTML(`
        <div class="${css['sp-root']}" style="width:${W}px;height:${H}px;">
          <div class="${css['sp-bottom']}">

            <button id="seed-tab" class="${css['sp-tab']}">
              <span class="${css['sp-key-badge']}">E</span>
              ⸙ Semillas
            </button>

            <div id="seed-panel" class="${css['sp-panel']}">
              <div class="${css['sp-inner']}">

                <span class="${css['sp-title']}">🌾 Inventario</span>

                <div class="${css['sp-divider']}"></div>

                <div class="${css['sp-item']} ${css.plant}">
                  <div class="${css['sp-slot']}">
                    <span class="${css['sp-key-badge']}">1</span>
                    <canvas id="corn-canvas" width="16" height="16" class="${css['sp-canvas']}"></canvas>
                  </div>
                  <span id="corn-count" class="${css['sp-count']}">x0</span>
                </div>

                <div class="${css['sp-divider']}"></div>

                <div class="${css['sp-item']}  ${css.plant}">
                  <div class="${css['sp-slot']}">
                    <span class="${css['sp-key-badge']}">2</span>
                    <canvas id="tomato-canvas" width="16" height="16" class="${css['sp-canvas']}"></canvas>
                  </div>
                  <span id="tomato-count" class="${css['sp-count']}">x0</span>
                </div>

                <div class="${css['sp-divider']}"></div>

                <span class="${css['sp-title']}">🍎 Cosecha</span>

                <div class="${css['sp-divider']}"></div>

                <div class="${css['sp-item']}">
                  <div class="${css['sp-slot']}">
                    <canvas id="corn-harvest" width="16" height="16" class="${css['sp-canvas']}"></canvas>
                  </div>
                  <span id="corn-harvest-count" class="${css['sp-count']}">x0</span>
                </div>

                <div class="${css['sp-divider']}"></div>

                <div class="${css['sp-item']}">
                  <div class="${css['sp-slot']}">
                    <canvas id="tomato-harvest" width="16" height="16" class="${css['sp-canvas']}"></canvas>
                  </div>
                  <span id="tomato-harvest-count" class="${css['sp-count']}">x0</span>
                </div>

                <div class="${css['sp-divider']}"></div>

                <div class="${css['sp-audio']}">
                  <button id="music-btn" class="${css['audio-btn']}">♫</button>
                  <button id="sfx-btn" class="${css['audio-btn']}">♪</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      `);

    const root = this.dom.node as HTMLDivElement;

    this.panelEl = root.querySelector('#seed-panel')!;
    this.tabEl = root.querySelector('#seed-tab')!;

    this.cornCountEl = root.querySelector('#corn-count')!;
    this.tomatoCountEl = root.querySelector('#tomato-count')!;
    this.cornCanvasEl = root.querySelector('#corn-canvas')!;
    this.tomatoCanvasEl = root.querySelector('#tomato-canvas')!;

    this.cornHarvestCanvas = root.querySelector('#corn-harvest')!;
    this.tomatoHarvestCanvas = root.querySelector('#tomato-harvest')!;
    this.cornHarvestCountEl = root.querySelector('#corn-harvest-count')!;
    this.tomatoHarvestCountEl = root.querySelector('#tomato-harvest-count')!;

    const audioManager = this.scene.registry.get("audioManager");
    this.setupAudioButtons(root);

    this.cornCanvasEl.addEventListener('click', () => {
      this.selectedSeed = 'corn';
      if (audioManager) audioManager.playSFX(ASSETS.click_sound.key, 0.3);
      announce('Semilla de maíz seleccionada');
      this.updateSelectionUI();
    });

    this.tomatoCanvasEl.addEventListener('click', () => {
      this.selectedSeed = 'tomato';
      if (audioManager) audioManager.playSFX(ASSETS.click_sound.key, 0.3);
      announce('Semilla de tomate seleccionada');
      this.updateSelectionUI();
    });

    this.tabEl.addEventListener('click', () => {
      if (audioManager) audioManager.playSFX(ASSETS.click_sound.key, 0.3);
      this.toggle();
    });

    this.tabEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (audioManager) audioManager.playSFX(ASSETS.click_sound.key, 0.3);
        e.preventDefault();
        this.toggle();
      }
    });

    this.drawSeedIcon(this.cornCanvasEl, 0);
    this.drawSeedIcon(this.tomatoCanvasEl, 6);

    this.drawSeedIcon(this.cornHarvestCanvas, 5);   // 🌽 cosechado
    this.drawSeedIcon(this.tomatoHarvestCanvas, 11); // 🍅 cosechado
  }

  private drawSeedIcon(canvas: HTMLCanvasElement, frame: number) {
    const texture = this.scene.textures.get('plants');
    if (!texture || texture.key === '__MISSING') return;

    const img = texture.getSourceImage() as HTMLImageElement;
    if (!img || !img.naturalWidth) return;

    // Ocultar el slot si no hay imagen válida
    const slot = canvas.parentElement;
    if (slot) slot.style.display = 'flex';

    const ctx = canvas.getContext('2d')!;
    const col = frame % 6;
    const row = Math.floor(frame / 6);
    ctx.drawImage(img, col * 16, row * 16, 16, 16, 0, 0, 16, 16);
  }

  private updateSelectionUI() {
    this.cornCanvasEl.classList.toggle(`${css.selected}`, this.selectedSeed === 'corn');
    this.tomatoCanvasEl.classList.toggle(`${css.selected}`, this.selectedSeed === 'tomato');
  }

  toggle() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.panelEl.classList.add(css['sp-panel--open']);
      this.tabEl.querySelector('span:last-child')!.textContent = 'E';

      this.tabEl.focus(); // 🔥 importante
      announce('Panel de semillas abierto');
    } else {
      this.panelEl.classList.remove(css['sp-panel--open']);
      this.tabEl.querySelector('span:last-child')!.textContent = 'E';

      this.clearSelection();

      this.tabEl.focus(); // 🔥 mantiene control teclado
      announce('Panel de semillas cerrado');
    }
  }

  open() {
    if (!this.isOpen) this.toggle();
  }

  addSeed(): string {
    const frame = SEED_FRAMES[Math.floor(Math.random() * SEED_FRAMES.length)];
    const isCorn = frame === 0;
    const label = isCorn ? 'Maíz' : 'Tomate';

    if (isCorn) {
      this.seeds.corn++;
      this.cornCountEl.textContent = `x${this.seeds.corn}`;
      this.bounceEl(this.cornCountEl);
      announce(`Semilla de maíz añadida. Total ${this.seeds.corn}`);
      this.scene.events.emit('seed-added', '🌽 +1 semilla de maíz');
    } else {
      this.seeds.tomato++;
      this.tomatoCountEl.textContent = `x${this.seeds.tomato}`;
      this.bounceEl(this.tomatoCountEl);
      announce(`Semilla de tomate añadida. Total ${this.seeds.tomato}`);
      this.scene.events.emit('seed-added', '🍅 +1 semilla de tomate');
    }

    return label;
  }

  addCrop(type: 'corn' | 'tomato') {
    if (type === 'corn') {
      this.crops.corn++;
      this.cornHarvestCountEl.textContent = `x${this.crops.corn}`;
      announce(`Maíz cosechado. Total ${this.crops.corn}`);
    } else {
      this.crops.tomato++;
      this.tomatoHarvestCountEl.textContent = `x${this.crops.tomato}`;
      announce(`Tomate cosechado. Total ${this.crops.tomato}`);
    }
  }

  consumeSeed(type: 'corn' | 'tomato'): boolean {
    if (this.seeds[type] <= 0) return false;

    this.seeds[type]--;

    if (type === 'corn') {
      this.cornCountEl.textContent = `x${this.seeds.corn}`;
    } else {
      this.tomatoCountEl.textContent = `x${this.seeds.tomato}`;
    }

    return true;
  }

  clearSelection() {
    this.selectedSeed = null;
    this.updateSelectionUI();
  }


  // ================================
  // AUDIO CONTROL
  // ===============================
  disableAudioFocus(): void {
    const root = this.dom.node as HTMLDivElement;
    const musicBtn = root.querySelector('#music-btn') as HTMLButtonElement;
    const sfxBtn = root.querySelector('#sfx-btn') as HTMLButtonElement;
    if (musicBtn) musicBtn.tabIndex = -1;
    if (sfxBtn) sfxBtn.tabIndex = -1;
  }

  enableAudioFocus(): void {
    const root = this.dom.node as HTMLDivElement;
    const musicBtn = root.querySelector('#music-btn') as HTMLButtonElement;
    const sfxBtn = root.querySelector('#sfx-btn') as HTMLButtonElement;
    if (musicBtn) musicBtn.tabIndex = 0;
    if (sfxBtn) sfxBtn.tabIndex = 0;
  }

  // ================================
  // FOCUS CONTROL
  // ===============================
  disable(): void {
    this.tabEl.tabIndex = -1;
    this.tabEl.style.pointerEvents = 'none';
    this.cornCanvasEl.style.pointerEvents = 'none';
    this.tomatoCanvasEl.style.pointerEvents = 'none';
  }

  enable(): void {
    this.tabEl.tabIndex = 0;
    this.tabEl.style.pointerEvents = 'auto';
    this.cornCanvasEl.style.pointerEvents = 'auto';
    this.tomatoCanvasEl.style.pointerEvents = 'auto';
    this.enableAudioFocus();
  }

  // ================================
  // UI
  // ===============================
  selectSeed(type: 'corn' | 'tomato') {
    this.selectedSeed = type;
    this.updateSelectionUI();
  }

  selectNextSeed() {
    if (this.selectedSeed === 'corn') {
      this.selectedSeed = 'tomato';
    } else {
      this.selectedSeed = 'corn';
    }

    this.updateSelectionUI();
  }

  isPanelOpen(): boolean {
    return this.isOpen;
  }

  close() {
    this.isOpen = false;
    this.panelEl.classList.remove(css['sp-panel--open']);
    this.clearSelection();
  }

  // ================================
  // DATA
  // ===============================

  getSeedCount(type: 'corn' | 'tomato'): number {
    return this.seeds[type];
  }

  getSelectedSeed() {
    return this.selectedSeed;
  }

  private bounceEl(el: HTMLElement) {
    el.classList.remove(css['sp-bounce']);
    // forzar reflow para reiniciar la animación
    void el.offsetWidth;
    el.classList.add(css['sp-bounce']);
  }

  private setupAudioButtons(root: HTMLDivElement) {
    const musicBtn = root.querySelector('#music-btn') as HTMLButtonElement;
    const sfxBtn = root.querySelector('#sfx-btn') as HTMLButtonElement;

    // 🔥 habilitar foco por teclado
    musicBtn.tabIndex = 0;
    sfxBtn.tabIndex = 0;

    const audioManager = this.scene.registry.get('audioManager');

    const updateStyles = () => {

      // 🎵 MUSIC
      if (audioManager.musicEnabled) {
        musicBtn.style.textDecoration = "none";
        musicBtn.style.opacity = "1";
      } else {
        musicBtn.style.opacity = "0.6";
        musicBtn.style.textDecoration = "line-through";
      }

      // 🔊 SFX
      if (audioManager.sfxEnabled) {
        sfxBtn.style.textDecoration = "none";
        sfxBtn.style.opacity = "1";
      } else {
        sfxBtn.style.opacity = "0.6";
        sfxBtn.style.textDecoration = "line-through";
      }
    };

    updateStyles();
    const toggleMusic = () => {
      audioManager.toggleMusic();
      updateStyles();
      announce(audioManager.musicEnabled ? 'Música activada.' : 'Música desactivada.');
    };

    const toggleSFX = () => {
      audioManager.toggleSFX();
      updateStyles();
      announce(audioManager.sfxEnabled ? 'Efectos sonoros activados.' : 'Efectos sonoros desactivados.');
    };

    musicBtn.onclick = () => { toggleMusic(); musicBtn.blur(); };
    sfxBtn.onclick = () => { toggleSFX(); sfxBtn.blur(); };

    musicBtn.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        toggleMusic();
      }
    });

    sfxBtn.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        toggleSFX();
      }
    });
  }
}