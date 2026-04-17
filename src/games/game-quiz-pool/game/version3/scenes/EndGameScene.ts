import Phaser from 'phaser';

import type { Quiz } from '@/types/AppTypes';

import css from '../QuizPool_version3.module.css';
export class EndGame_v3 extends Phaser.Scene {
  private score = 0;
  private total = 0;
  private elapsedSecs = 0;
  private quizList: Quiz[] = [];
  private endEl!: Phaser.GameObjects.DOMElement;

  constructor() {
    super('EndGame_v3');
  }
  // Phaser llama esto automáticamente con los datos del scene.start
  init(data: { score: number; total: number; elapsedSecs: number; dataGame: Quiz[] }) {
    this.score = data?.score ?? 0;
    this.total = data?.total ?? 0;
    this.elapsedSecs = data?.elapsedSecs ?? 0;
    this.quizList = data?.dataGame ?? [];
  }

  create() {
    // Fondo
    // this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x101622);

    this.endEl = this.add.dom(0, 0, 'div', '', '') as Phaser.GameObjects.DOMElement;

    (this.endEl.node as HTMLElement).innerHTML = this._buildHTML();

    this._setupButtons();
  }
  private _formatTime(secs: number): string {
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  // ─────────────────────────────────────────────────────────────
  private _setupButtons() {
    const node = this.endEl.node as HTMLElement;

    node.querySelector('[data-retry]')?.addEventListener('click', () => {
      this.scene.start('MenuScene_v3', { dataGame: this.quizList });
    });
  }

  private _calcMaxScore(): number {
    return this.total * 10;
  }

  private _calcAccuracy(): number {
    const max = this._calcMaxScore();
    if (max === 0) return 0;
    return Math.round((this.score / max) * 100);
  }

  // ─────────────────────────────────────────────────────────────
  private _buildHTML(): string {
    const time = this._formatTime(this.elapsedSecs);
    const maxScore = this._calcMaxScore();
    const accuracy = this._calcAccuracy();
    const isPersonalBest = accuracy >= 80;

    return `
    <div class="${css.endGameContainer}">
      <div class="absolute inset-0 z-0">
        <img
          alt="Blurred study room environment"
          class="w-full h-full object-cover opacity-30 scale-105"
          src="assets/images/bgEndSceneV3.png"
        />
        <div class="absolute inset-0  from-background via-transparent to-background/50"></div>
      </div>

      <div class="relative z-10 w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-stretch">

        <!-- Left Column -->
        <div class="flex-1 flex flex-col justify-center space-y-6">
          <div>
            <span class="${css.labelSession}">Sesión Completada</span>
            <h1 class="${css.endGameTitle}">El Ascenso<br/>del Campeón</h1>
          </div>
          <p class="${css.endGameDescription}">
            Excelente desempeño. Tu precisión demuestra un dominio creciente de la mesa de billar.
          </p>
          <div class="flex flex-wrap gap-4 pt-4">
            <button
              data-retry
              style="pointer-events:auto"
              class="${css.endGameButtonPrimary}">
              Intentar de nuevo
            </button>
          </div>
        </div>

        <!-- Right Column: Scoreboard -->
        <div class="flex-1">
          <div class="${css.scoreBoard}">
            <div class="space-y-6">

              <!-- Puntaje -->
              <div class="${css.scoreBoardCell}">
                <label class="${css.scoreBoardLabel}">Puntaje Final</label>
                <div class="flex items-baseline gap-2">
                  <span class="${css.scoreBoardValue}">${this.score}</span>
                  <span class="${css.scoreBoardMax}">/ ${maxScore}</span>
                </div>
              </div>

              <!-- Tiempo y Precisión -->
              <div class="grid grid-cols-2 gap-4">
                <div class="${css.scoreBoardStatCell}">
                  <label class="${css.scoreBoardStatLabel}">Tiempo</label>
                  <span class="${css.scoreBoardStatValue}">${time}</span>
                </div>
                <div class="${css.scoreBoardStatCell}">
                  <label class="${css.scoreBoardStatLabel}">Precisión</label>
                  <span class="${css.scoreBoardStatValue}">${accuracy}%</span>
                </div>
              </div>

              ${
                isPersonalBest
                  ? `
              <div class="${css.achievementChip}">
                <span>⭐</span>
                <span class="${css.achievementText}">Nuevo mejor puntaje</span>
              </div>`
                  : ''
              }

            </div>

            <div class="${css.scoreBoardFooter}">
              <p class="${css.scoreBoardQuote}">
                "La práctica es la parte más difícil del aprendizaje, y el entrenamiento es la esencia de la transformación."
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
    `;
  }
}
