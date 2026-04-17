import Phaser from 'phaser';

import type { Quiz } from '../../types/AppTypes';

import css from '../QuizPool_version2.module.css';

// ─────────────────────────────────────────────────────────────
//  MenuScene_v2 — pantalla de inicio versión 2
//  Diseño tipo "Pro Edition" con stats, imagen hero y cards
// ─────────────────────────────────────────────────────────────
export class MenuScene_v2 extends Phaser.Scene {
  private quizList: Quiz[] = [];
  private menuEl!: Phaser.GameObjects.DOMElement;

  constructor() {
    super('MenuScene_v2');
  }

  init(data: { dataGame: Quiz[] }) {
    this.quizList = data?.dataGame ?? [];
  }

  create() {
    // Fondo oscuro

    this.menuEl = this.add.dom(0, 0, 'div', '', '') as Phaser.GameObjects.DOMElement;

    (this.menuEl.node as HTMLElement).innerHTML = this._buildHTML();
    this._setupButtons();
  }

  // ─────────────────────────────────────────────────────────────
  private _setupButtons() {
    const node = this.menuEl.node as HTMLElement;

    node.querySelector('[data-start]')?.addEventListener('click', () => {
      this.scene.start('MainScene_v2', { dataGame: this.quizList });
    });
  }

  private _calcMaxScore(): number {
    return this.quizList.length * 10;
  }
  private _calcTimeLimit(): number {
    return this.quizList.length * 2;
  }

  // // ─────────────────────────────────────────────────────────────
  private _buildHTML(): string {
    return `
      <div class=${css.container_v2}>

        <!-- Grid principal de 12 columnas simulado con flex -->
        <div class=${css.coreGrid}>
          <!-- ── Columna izquierda: Stats ──────────────────── -->
          <div class=${css.columnLeft}>

            <!-- Total Games -->
            <div class=${css.card}>
              <p class=${css.card__title}>
                POSIBLES PUNTOS
              </p>
              <p class=${css.card__description}>
                ${this._calcMaxScore()}
              </p>
            </div>

            <!-- Win Rate -->
            <div class=${css.card}>
              <p class=${css.card__title}>
                TIEMPO LÍMITE
              </p>
              <p class=${css.card__description}>
               ${this._calcTimeLimit()} min
              </p>
            </div>

            <!-- Current Rank -->
            <div class=${css.card}>
              <p class=${css.card__title} >
                NUMERO DE PREGUNTAS
              </p>
              <div class=${css.card__descriptionSvg}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#FFF"
                >
                  <path d="M320-240l160-122 160 122-60-198 160-114H544l-64-208-64 208H220l160 114-60 198zM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93zm0-320z" />
                </svg>
                <p class=${css.card__description}>
                  ${this.quizList.length}
                </p>
              </div>
            </div>

          </div>

          <!-- ── Columna central: Título + Hero ───────────── -->
          <div class=${css.columnCenter}>
            <!-- Título -->
              <h1 class=${css.titleMenu_V2}>
                POOL MASTER
              </h1>
          <div>
            <!-- Imagen hero -->
            <Img class=${css.heroImage} src="assets/images/imageMenu_v2.png" alt="Hero Pool"/>
              <!-- Gradiente inferior -->
              <div class=${css.gradient}></div>

              <!-- Botón Play Now -->
              <div class=${css.playNow}>
                <button
                  class=${css.btnPlayNow}
                  data-start
                >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="40px"
                  viewBox="0 -960 960 960"
                  width="40px"
                  fill="#FFF"
                >
                  <path d="M320-200v-560l440 280-440 280zm80-280zm0 134l210-134-210-134v268z" />
                </svg>
                <span>JUEGA AHORA</span>
                </button>
              </div>
            </div>
          </div>



          <!-- ── Columna derecha: Feature Cards ───────────── -->
          <div class=${css.columnRight} >

            <!-- Training Mode -->
            <div class=${css.card}>
              <div class=${css.card__icon} >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#FFF"
                >
                  <path d="M536-84l-56-56 142-142-340-340-142 142-56-56 56-58-56-56 84-84-56-58 56-56 58 56 84-84 56 56 58-56 56 56-142 142 340 340 142-142 56 56-56 58 56 56-84 84 56 58-56 56-58-56-84 84-56-56-58 56z" />
                </svg>
              </div>
              <div  class=${css.card__content}>
                <h3 class=${css.card__subtitle}>
                  Divierte y aprende
                </h3>
                <p class=${css.card__description}>
                  Resuelve preguntas de cultura general mientras te diviertes.
                </p>
              </div>
            </div>

            <!-- Ranked Matches -->
            <div class=${css.card}>
              <div class=${css.card__icon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#FFF"
                >
                  <path d="M280-120v-80h160v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80v-80h400v80h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h160v80H280zm0-408v-152h-80v40q0 38 22 68.5t58 43.5zm285 93q35-35 35-85v-240H360v240q0 50 35 85t85 35q50 0 85-35zm115-93q36-13 58-43.5t22-68.5v-4₀h-8₀v1₅₂zm-₂₀₀-₅₂z" />
                </svg>
              </div>
              <div class=${css.card__content}>
                <h3 class=${css.card__subtitle}>
                  Gana puntos, en el mejor tiempo
                </h3>
                <p class=${css.card__description}>
                  Responde rápido y acumula puntos para ser el mejor.
                </p>
              </div>
            </div>
            <!-- Daily Challenges -->
            <div class=${css.card}>
              <!-- Pulso animado -->
              <div class=${css.pulse}></div>

              <div class=${css.card__icon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#FFF"
                >
                  <path d="M280-80l160-300-320-40 480-460h80L520-580l320 40L360-80h-80zm222-247l161-154-269-34 63-117-160 154 268 33-63 118zm-22-153z" />
                </svg>
              </div>
              <div class=${css.card__content}>
                <h3 class=${css.card__subtitle}>
                  siente la emoción
                </h3>
                <p class=${css.card__description}>
                  Visualiza el ángulo, siente la velocidad, domina el juego.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }
}
