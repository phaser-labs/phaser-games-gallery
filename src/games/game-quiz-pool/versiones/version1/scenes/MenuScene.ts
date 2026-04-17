import Phaser from 'phaser';

import { Quiz } from '../../../types/AppTypes';

import css from '../QuizPool_version1.module.css';

// import { Main } from '../../MainScene/Main';

export class Menu extends Phaser.Scene {
  private quizList: Quiz[] = [];
  private menuEl!: Phaser.GameObjects.DOMElement;
  init(data: { dataGame: Quiz[] }) {
    console.log('Menu recibió:', data?.dataGame?.length, 'preguntas'); // ← debug
    this.quizList = data?.dataGame ?? [];
  }
  constructor() {
    super('MenuScene');
  }
  create() {
    // Fondo oscuro que cubre todo el canvas
    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x101622);

    // Contenedor DOM centrado
    this.menuEl = this.add.dom(0, 0, 'div', '', '') as Phaser.GameObjects.DOMElement;

    (this.menuEl.node as HTMLElement).innerHTML = this._buildHTML();

    // Botón Start Game
    const startBtn = (this.menuEl.node as HTMLElement).querySelector<HTMLElement>('[data-start]');
    startBtn?.addEventListener('click', () => {
      this.scene.start('MainScene', { dataGame: this.quizList });
    });
  }

  // ─────────────────────────────────────────────────────────────

  private _buildHTML(): string {
    return `
      <div class=${css.backgroundMenu}>

        <!-- Fondo decorativo difuminado -->
        <div class=${css.blur}></div>

        <!-- Bola decorativa derecha -->
        <div class=${css.ball__right}>
          <div class=${css.ball__number}>8</div>
        </div>

        <!-- Bola decorativa izquierda -->
        <div class=${css.ball__left} ></div>

        <!-- Contenido principal -->
        <div class=${css.mainContainer} style="

        ">

          <!-- Badge -->
          <div  class=${css.badge}>
            ⭐ La precisión se une al juego.
          </div>

          <!-- Título -->
          <h1 class=${css.titleMenu}>  Billard Pool </h1>
          <!-- Subtítulo -->
          <p class=${css.subtitleMenu}>
            La forma más divertida de aprender jugando. Experimenta la arquitectura del billar profesional con entrenamiento de trayectoria en tiempo real.
          </p>

          <!-- Botón Start -->
          <button
            data-start
            class=${css.startButton}

          >
            ▶  Iniciar Juego
          </button>

          <!-- Feature grid -->
          <div class=${css.featureGrid}>

            <!-- Card 1 -->
            <div class=${css.card} style="
            ">
              <div class=${css.card__icon}>🎓</div>
              <h2 class=${css.card__title} style="">Apunta, calcula y valida.</h2>
              <p class=${css.card__description}>
              Apunta hacia la bola, calcula el ángulo y la fuerza del tiro,
              al entrar la bola en  la tronera se validara la respuesta.</p>
            </div>

            <!-- Card 2 -->
            <div class=${css.card}>
              <div class=${css.card__icon}>🏆</div>
              <h2 class=${css.card__title}>Cada tiro cuenta</h2>
              <p class=${css.card__description}>
              ¡Cuidado! Si metes la bola en la tronera equivocada,
              perderás puntos. Si aciertas, ganarás 10 puntos.</p>
            </div>

            <!-- Card 3 -->
            <div class=${css.card}>
              <div class=${css.card__icon}>📊</div>
              <h2 class=${css.card__title}>La rapidez también cuenta</h2>
              <p class=${css.card__description}>
                Ten en cuenta el cronómetro:
                mientras menos tiempo uses, mejor será tu resultado final.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
