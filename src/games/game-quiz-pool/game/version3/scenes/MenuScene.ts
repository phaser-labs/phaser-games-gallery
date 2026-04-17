import Phaser from 'phaser';

import type { Quiz } from '../../types/AppTypes';

import css from '../QuizPool_version3.module.css';
export class MenuScene_v3 extends Phaser.Scene {
  private quizList: Quiz[] = [];
  private menuEl!: Phaser.GameObjects.DOMElement;

  constructor() {
    super('MenuScene_v3');
  }

  init(data: { dataGame: Quiz[] }) {
    this.quizList = data?.dataGame ?? [];
  }

  create() {
    // Fondo base
    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x0d1417);

    this.menuEl = this.add.dom(
      0,
      0,
      'div',
      '',
      ''
    ) as Phaser.GameObjects.DOMElement;

    (this.menuEl.node as HTMLElement).innerHTML = this._buildHTML();
    this._setupButtons();
  }

  // ─────────────────────────────────────────────────────────────
  private _setupButtons() {
    const node = this.menuEl.node as HTMLElement;

    // Botón principal — Enter Study Hall
    node.querySelector('[data-start]')?.addEventListener('click', () => {
      this.scene.start('MainScene_v3', { dataGame: this.quizList });
    });

    // Botón secundario — View Curriculum (opcional, puedes conectarlo)
    node.querySelector('[data-curriculum]')?.addEventListener('click', () => {
      console.log('View Curriculum clicked');
    });
  }

  // ─────────────────────────────────────────────────────────────
  private _buildHTML(): string {
    return `
      <div class=${css.backgroundMenu}>


        <div class=${css.containerBackgroundMenu}>
          <img  class=${css.containerBackgroundMenuImage} src="../assets/images/bgMenuV_3.png" alt="Background de una mesa de billar"/>
        </div>

        <!-- Textura sutil de puntos -->
        <div class=${css.points}></div>

        <!-- Gradiente lateral izquierdo -->
        <div class=${css.gradientLeft}></div>

        <!-- ── Contenido principal ───────────────────────────── -->
        <div class=${css.mainContainer}>

          <!-- Label superior -->
          <span class=${css.label}>
            Juega y aprende
          </span>

          <!-- Título principal -->
          <h1 class=${css.title}> BILLAR POOL
            <span  class=${css.titleSpan} style="color: #dde4e7;">DIVERTIDO</span>
            Y EDUCATIVO
          </h1>

          <!-- Descripción -->
          <p class=${css.description}>
            En este juego, cada bola es un reto, cada jugada una oportunidad y cada acierto una victoria doble:
            en la mesa y en tu mente. Calcula ángulos, toma decisiones rápidas y responde correctamente para acumular
            puntos mientras disfrutas de la emoción del billar como nunca antes.
          </p>


            <!-- Botón primario — Enter Study Hall -->
            <button class=${css.buttonStart} data-start >
             <span>JUGAR</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
              >
                <path d="M320-200v-560l440 280-440 280zm80-280zm0 134l210-134-210-134v268z" />
              </svg>
            </button>
       </div>
    `;
  }
}
