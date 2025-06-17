import Phaser from 'phaser';

import { globalState } from '../utils/globalState';
import MusicManager from '../utils/musicManager';

import '../styles/gamePistas.css';

export type VolumeState = 'full' | 'half' | 'muted';
interface VolumeSetting {
    level: number; 
    isMuted: boolean;
    iconClass: string;
    ariaLabel: string;
}

export const VOLUME_SETTINGS: Record<VolumeState, VolumeSetting> = {
    full: { level: 0.1, isMuted: false, iconClass: 'volume-icon-full', ariaLabel: 'Volumen al máximo' },
    half: { level: 0.05, isMuted: false, iconClass: 'volume-icon-half', ariaLabel: 'Volumen a la mitad' },
    muted: { level: 0, isMuted: true, iconClass: 'volume-icon-muted', ariaLabel: 'Sonido desactivado (mudo)' },
};
export const VOLUME_REGISTRY_KEY = 'gameSoundVolumeState';

export class Settings extends Phaser.Scene {
  private settingdElement!: Phaser.GameObjects.DOMElement; 
  private currentVolumeState!: VolumeState;
  private volumeButtonElement!: HTMLButtonElement;
  constructor() {
    super('settingsScene');
  }
  
  init() {
    const savedState = this.registry.get(VOLUME_REGISTRY_KEY) as VolumeState | undefined;
    this.currentVolumeState = savedState || 'full';
  }

  create() {
    this.cameras.main.setBackgroundColor('#000');

    MusicManager.getInstance().play(this, 'music');

    this.settingdElement = this.add.dom(0, 0, 'div').setDepth(10).setOrigin(0, 0);
    const controlsContainer = this.settingdElement.node as HTMLDivElement;
    controlsContainer.classList.add('game-clues-instruction-container');

    // --- Crear HTML para el control de volumen
    const volumeControlHTML = `
      <div class="volume-control-section">
        <p class="game-clues__text" id="volume-label">Sonido General</p>
        <button id="volume-toggle-button" class="volume-button-settings" aria-labelledby="volume-label">
          <span id="volume-icon-span" class="volume-icon"></span>
        </button>
      </div>
    `;

    controlsContainer.innerHTML = `
     <h2 class="game-clues-instruction__title2">Configuraciones</h2>
     ${volumeControlHTML}
     <div class="key-config-section">
            <p class="game-clues__text" id="key-label">Tecla para abrir cofres:</p>
            <input id="key-input" type="text" maxlength="1" value="${globalState.openChestKey}" />
        </div>
     <button id="btn-volver-atras" aria-label="Volver atrás" class="game-back-button"></button>
    `;

    this.volumeButtonElement = controlsContainer.querySelector('#volume-toggle-button') as HTMLButtonElement;
    if (this.volumeButtonElement) {
        this.updateVolumeButtonVisuals();
        this.volumeButtonElement.addEventListener('click', this.toggleVolume);
  
        this.volumeButtonElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.toggleVolume();
            }
        });
    } else {
        console.error("Elemento #volume-toggle-button no encontrado en el DOM de la escena.");
    }

     const keyInput = controlsContainer.querySelector('#key-input') as HTMLInputElement;
    keyInput.addEventListener('input', () => {
        const newKey = keyInput.value.toUpperCase();
        if (newKey.length === 1) {
            globalState.openChestKey = newKey;
            console.log(`Tecla para abrir cofres configurada: ${globalState.openChestKey}`);
        }
    });

    const backButtonElement = controlsContainer.querySelector('#btn-volver-atras');
    if (backButtonElement) {
      backButtonElement.addEventListener('click', () => {
        this.sound.play('click', {volume: 0.5}); 
        this.scene.start('menuScene');
      });
    }
  }

  private toggleVolume = () => {
    switch (this.currentVolumeState) {
      case 'full':
        this.currentVolumeState = 'half';
        break;
      case 'half':
        this.currentVolumeState = 'muted';
        break;
      case 'muted':
        this.currentVolumeState = 'full';
        break;
      default:
        this.currentVolumeState = 'full';
    }
    this.applyCurrentVolumeSetting();
    this.updateVolumeButtonVisuals();
    this.registry.set(VOLUME_REGISTRY_KEY, this.currentVolumeState);
  }

private applyCurrentVolumeSetting(): void {
    const setting = VOLUME_SETTINGS[this.currentVolumeState];
    this.sound.mute = setting.isMuted;
    this.sound.volume = setting.level;

    MusicManager.getInstance().setVolume(setting.level);
    if (setting.isMuted) {
        MusicManager.getInstance().setVolume(0);
    }
}
  private updateVolumeButtonVisuals(): void {
    if (!this.volumeButtonElement) return;

    const setting = VOLUME_SETTINGS[this.currentVolumeState];
    const iconSpan = this.volumeButtonElement.querySelector('#volume-icon-span') as HTMLSpanElement;

    if (iconSpan) {
        iconSpan.classList.remove('volume-icon-full', 'volume-icon-half', 'volume-icon-muted');
        iconSpan.classList.add(setting.iconClass);
    }
    this.volumeButtonElement.setAttribute('aria-label', setting.ariaLabel);
  }

  shutdown(): void {
    if (this.volumeButtonElement) {
      this.volumeButtonElement.removeEventListener('click', this.toggleVolume);
    }
  }
}