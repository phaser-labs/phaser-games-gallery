import Phaser from 'phaser';

import { Game } from '../scenes/game';
import { TypeWord } from '../types/types';
import { announce } from '../utils/announce';
import { ASSETS } from '../utils/game-assets';

import css from '../styles/tricky.module.css';

export class PhraseBuilder {
  private scene: Phaser.Scene;
  private dom!: Phaser.GameObjects.DOMElement;
  private frame!: Phaser.GameObjects.Image;

  private words: string[];
  private sentence?: string;
  private selected: string[] = [];

  constructor(scene: Phaser.Scene, data: TypeWord, width: number, x: number, y: number) {
    this.scene = scene;
    this.words = data.words;
    this.sentence = data.sentence;

    this.createFrame(width, x, y);
    this.createDOM(width, x, y);
  }

  // ===============================================
  // FRAME (PHASER IMAGE)
  // ===============================================

  private createFrame(width: number, x: number, y: number) {
    this.frame = this.scene.add
      .image(x, y, ASSETS.container.container_1.key)
      .setOrigin(0, 0)
      .setDisplaySize(width, 140);
  }

  // ===============================================
  // DOM
  // ===============================================

  private createDOM(width: number, x: number, y: number) {
    const buttonsHTML = this.words
      .map(
        (word, i) => `
            <button 
            class="${css['pb-btn']} pb-btn"
            role="button"
            aria-label="Palabra ${word}"
            data-index="${i}"
            >
            ${word}
            </button>
        `
      )
      .join('');

    const slotsHTML = this.words
      .map(
        (_, i) => `
            <div 
            class="${css['pb-slot']} pb-slot"
            role="textbox"
            aria-label="Espacio ${i + 1}"
            aria-live="polite"
            ></div>
        `
      )
      .join('');

    this.dom = this.scene.add
      .dom(x + 8, y + 10) // padding interno del marco
      .setOrigin(0, 0).createFromHTML(`
        <div class="${css['pb-container']} pb-container" role="group" aria-label="Constructor de frases"
          style="width:${width - 22}px; height:108px; overflow-y:auto;">
          <div class="${css['pb-words']} pb-words">
            ${buttonsHTML}
          </div>

          <div class="${css['pb-slots']} pb-slots">
            ${slotsHTML}
          </div>
        </div>
      `);

    this.registerEvents();
  }

  // ===============================================
  // EVENTS
  // ===============================================

  private registerEvents() {
    const container = this.dom.node as HTMLElement;

    const buttons = Array.from(container.querySelectorAll('.pb-btn')) as HTMLButtonElement[];
    const slots = Array.from(container.querySelectorAll('.pb-slot')) as HTMLDivElement[];

    buttons.forEach((button) => {
      const activate = () => {
        const game = this.scene as Game;
        if (!game.canSelectWord()) return;

        const btnIndex = Number(button.dataset.index);
        const word = this.words[btnIndex]; // 🔥 usar data original

        const index = this.selected.length;
        if (index >= slots.length) return;

        slots[index].textContent = word;
        this.selected.push(word);

        button.disabled = true;
        button.style.visibility = 'hidden';

        announce(`Seleccionaste ${word}`);
        announce(`Frase actual: ${this.selected.join(' ')}`);

        let correctWord: string | undefined;

        if (this.sentence?.includes(' ')) {
          // modo frase normal
          correctWord = this.sentence.trim().split(/\s+/)[index];
        } else {
          // modo palabra única (por letras)
          correctWord = this.sentence?.trim()[index];
        }

        const isCorrectPosition = word === correctWord;

        this.scene.events.emit('word-placed', {
          correct: isCorrectPosition,
          word,
          index
        });

        if (this.selected.length === this.words.length) {
          if (this.isComplete()) {
            this.scene.events.emit('phrase-correct');
          } else {
            this.scene.events.emit('phrase-wrong');
          }
        }
      };

      // Click
      button.addEventListener('click', activate);

      // Enter o Space
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  // ===============================================
  // VALIDATION
  // ===============================================

  private isComplete(): boolean {
    if (this.sentence?.includes(' ')) {
      return this.selected.join(' ').trim() === this.sentence.trim();
    } else {
      return this.selected.join('') === this.sentence;
    }
  }

  // ===============================================
  // DESTROY
  // ===============================================

  public destroy() {
    this.dom.destroy();
    this.frame.destroy();
  }

  public getWordCount(): number {
    return this.words.length;
  }

  public getCurrentPhrase(): string {
    return this.selected.join(' ');
  }

  public setEnabled(enabled: boolean) {
    const container = this.dom.node as HTMLElement;

    const buttons = Array.from(container.querySelectorAll('.pb-btn')) as HTMLButtonElement[];

    buttons.forEach((btn) => {
      btn.disabled = !enabled;

      if (!enabled) {
        btn.classList.add(css['pb-btn-disabled']);
        btn.tabIndex = -1; // 🚫 no navegable
      } else {
        btn.classList.remove(css['pb-btn-disabled']);
        btn.tabIndex = 0; // ✅ navegable
      }
    });
  }
}
