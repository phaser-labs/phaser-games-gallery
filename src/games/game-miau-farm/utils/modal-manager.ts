import { Root } from 'react-dom/client';
import Phaser from 'phaser';

import { Advice } from '../types/types';

import { announceMessage } from './announce';
import { renderAudio } from './render-audio';
import { renderImage } from './render-image';

export class ModalManager {
  private scene: Phaser.Scene;
  private currentAdvice: Advice | null = null;

  private overlayEl!: HTMLDivElement;
  private bodyEl!: HTMLDivElement;
  private titleEl!: HTMLDivElement;
  private btnEl!: HTMLButtonElement;
  private cardEl!: HTMLDivElement;
  private imgEl!: HTMLImageElement;
  private audioContainer!: HTMLDivElement;

  // Image
  private imgTitleEl!: HTMLElement;
  private imgAltEl!: HTMLElement;

  // Audio
  private audioRoot?: Root;

  constructor(
    scene: Phaser.Scene,
    root: HTMLDivElement
  ) {
    this.scene = scene;

    this.overlayEl = root.querySelector('#modal-overlay')!;
    this.bodyEl = root.querySelector('#modal-advice')!;
    this.titleEl = root.querySelector('#modal-title')!;
    this.btnEl = root.querySelector('#modal-btn')!;
    this.imgEl = root.querySelector('#modal-img')!;
    this.audioContainer = root.querySelector('#modal-audio')!;
    this.cardEl = root.querySelector('#modal-body')!;

    this.imgTitleEl = root.querySelector('#modal-img-title')!;
    this.imgAltEl = root.querySelector('#modal-alt')!;
  }

  // =========================
  // INIT EVENTS
  // =========================
  init(onClose: (advice: Advice) => void) {
    this.overlayEl.style.display = 'none';

    // 🔘 botón cerrar
    this.btnEl.addEventListener('click', () => {
      this.hide(onClose);
    });

    this.btnEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.hide(onClose);
      }
    });

    // 🔥 SCROLL CON TECLADO (AQUÍ VA)
    this.cardEl.addEventListener('keydown', (e: KeyboardEvent) => {
      const scrollAmount = 40;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.cardEl.scrollTop += scrollAmount;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.cardEl.scrollTop -= scrollAmount;
      }

      if (e.key === ' ') {
        e.preventDefault();
        this.cardEl.scrollTop += scrollAmount * 2;
      }
    });
  }

  // =========================
  // SHOW
  // =========================
  show(advice: Advice) {
    this.currentAdvice = advice;

    this.scene.input.enabled = false;
    this.scene.input.keyboard!.enabled = false;

    this.overlayEl.style.display = 'flex';

    this.titleEl.innerHTML = `<h1>${advice.title}</h1>`;
    this.bodyEl.innerHTML = advice.description;

    renderImage(this.imgEl, advice, this.imgTitleEl, this.imgAltEl);

    this.audioRoot = renderAudio(
      this.audioContainer,
      this.audioRoot,
      advice
    );

    announceMessage(advice.title, advice.description);

    this.btnEl.focus();

  }

  // =========================
  // HIDE
  // =========================
  private hide(onClose: (advice: Advice) => void) {
    this.overlayEl.style.display = 'none';

    if (this.audioRoot) {
      this.audioRoot.unmount();
      this.audioRoot = undefined;
    }

    this.scene.input.enabled = true;
    this.scene.input.keyboard!.enabled = true;

    if (!this.currentAdvice) return; // 🛑 seguridad

    onClose(this.currentAdvice); // 🔥 AQUÍ ESTÁ LA CLAVE

    this.currentAdvice = null; // limpiar
  }
}