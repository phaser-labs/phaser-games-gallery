import Phaser from 'phaser';

import type { Quiz } from '@/types/AppTypes';

import css from '../QuizPool_version2.module.css';
export class EndGame_v2 extends Phaser.Scene {
  private score = 0;
  private elapsedSecs = 0;
  private quizList: Quiz[] = [];
  private endEl!: Phaser.GameObjects.DOMElement;

  constructor() {
    super('EndGame_v2');
  }
  // Phaser llama esto automáticamente con los datos del scene.start
  init(data: { score: number; total: number; elapsedSecs: number; dataGame: Quiz[] }) {
    this.score = data?.score ?? 0;
    this.elapsedSecs = data?.elapsedSecs ?? 0;
    this.quizList = data?.dataGame ?? [];
  }

  create() {
    // Fondo
    // this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x101622);

    this.endEl = this.add.dom(0, 0, 'div', '', '') as Phaser.GameObjects.DOMElement;

    (this.endEl.node as HTMLElement).innerHTML = this._buildHTML();

    this._setupButtons();
    this._colorFromScore(this.score);
  }
  private _formatTime(secs: number): string {
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  // ─────────────────────────────────────────────────────────────
  private _setupButtons() {
    const node = this.endEl.node as HTMLElement;

    // Reintentar — vuelve a MainScene con el mismo quiz
    node.querySelector('[data-retry]')?.addEventListener('click', () => {
      this.scene.start('MenuScene_v2', { dataGame: this.quizList });
    });
  }
  private _calcMaxScore(): number {
    return this.quizList.length * 10;
  }

  private _colorFromScore(score: number): string {
    const htmlScore = document.querySelector('.js-score') as HTMLElement;
    if (score >= 50) {
      htmlScore.style.color = '#2b6cee'; // Azul para puntuaciones altas
    } else {
      htmlScore.style.color = '#c53030'; // Rojo para puntuaciones bajas
    }
    return htmlScore.style.color;
  }
  // ─────────────────────────────────────────────────────────────
  private _buildHTML(): string {
    const time = this._formatTime(this.elapsedSecs);
    return `
      <div class="flex flex-col items-center justify-center px-6 py-16"
           style="width:${this.scale.width}px; min-height:${this.scale.height}px;">

        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class=" ${css.headerEndScene}  font-black tracking-tight text-white mb-4">
            ¡Felicidades!
          </h1>
          <p class="text-slate-200 font-medium tracking-widest uppercase text-sm">
            Sesión de Pool finalizada
          </p>
        </div>

        <!-- Cards -->
        <div class="grid grid-cols-2 gap-6 w-full max-w-lg mb-16">

          <!-- Score Card -->
          <div class="${css.quizPool__endScore} rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <span class="text-slate-100 font-semibold uppercase tracking-widest text-xs mb-2">
              Puntuación Final
            </span>
            <span class=" ${css.score} text-5xl font-bold tracking-tight" style="color:#2b6cee;">
              ${this.score.toLocaleString()} / ${this._calcMaxScore()}
            </span>
            <div class="js-score ${css.quizPool__score} mt-4 flex items-center gap-1 font-bold text-sm" >
              <span>↑</span>
              <span>${this.score > 50 ? 'BUEN PUNTAJE' : 'SIGUE INTENTANDO'}</span>
            </div>
          </div>

          <!-- Time Card -->
          <div class="${css.quizPool__endTime} rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden" >
            <span class="text-slate-100 font-semibold uppercase tracking-widest text-xs mb-2">
              Tiempo Total
            </span>
            <span class="${css.time} text-5xl font-bold tracking-tight text-white">
              ${time}
            </span>
            <div class="mt-4 flex items-center gap-1 text-slate-100 font-bold text-sm">
              <span>⏱</span>
              <span>VELOCIDAD</span>
            </div>
          </div>

        </div>

        <!-- Divider -->
        <div class=" ${css.divider} w-full max-w-lg h-px mb-16">
        </div>

        <!-- Acciones -->
        <div class="w-full max-w-sm flex flex-col items-center gap-6">

          <!-- Reintentar -->
          <button
            data-retry
            class="${css.buttonRetry} w-full py-5 text-white font-extrabold text-lg tracking-tight rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95"
          >
              <span>REINTENTAR</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#FFF"
                {...props}
              >
                <path d="M339.5-108.5q-65.5-28.5-114-77t-77-114Q120-365 120-440h80q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-6l62 62-56 58-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-440q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80q-75 0-140.5-28.5z" />
              </svg>
          </button>
        </div>
      </div>
    `;
  }
}
