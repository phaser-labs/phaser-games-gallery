// ─────────────────────────────────────────────────────────────
//  UI — constructores de HTML para los elementos DOM de Phaser
//  Cada función recibe la escena y monta el contenedor en el canvas.
//  pointer-events: none en el wrapper, auto en los elementos interactivos.
// ─────────────────────────────────────────────────────────────
// eslint-disable-next-line simple-import-sort/imports
import gsap from 'gsap';
import Phaser from 'phaser';

import css from './QuizPool_version2.module.css';
import { Quiz } from '../types/AppTypes';
import { POCKETS } from './Constants';


// Letras de las 6 opciones (A–F), en el mismo orden que las opciones del quiz
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

// ─────────────────────────────────────────────────────────────
//  HEADER — pregunta actual + contador + puntos + tiempo
// ─────────────────────────────────────────────────────────────

/** Crea el header con la primera pregunta. */
export function createHeaderUI(
  scene: Phaser.Scene,
  quiz: Quiz,
  index: number,
  total: number
): Phaser.GameObjects.DOMElement {
  console.log(quiz);
  const el = scene.add.dom(0, 0, 'div', '', '') as Phaser.GameObjects.DOMElement;
  el.setClassName(css.quizPool__containerMenu);
  (el.node as HTMLElement).style.pointerEvents = 'none';
  (el.node as HTMLElement).innerHTML = buildHeaderHTML(quiz, index, total);
  return el;
}
//  Alterna visualmente el botón de mute entre activo y silenciado.
//  Retorna el nuevo estado (true = silenciado).

export function toggleMuteButton(headerEl: Phaser.GameObjects.DOMElement): void {
  const node = headerEl.node as HTMLElement;
  const muteOn = node.querySelector<HTMLElement>('[data-mute-on]');
  const muteOff = node.querySelector<HTMLElement>('[data-mute-off]');
  if (!muteOn || !muteOff) return;

  const isMuted = muteOn.style.display === 'none';
  muteOn.style.display = isMuted ? 'block' : 'none';
  muteOff.style.display = isMuted ? 'none' : 'block';
}
/** Actualiza solo la pregunta y el contador sin recrear el elemento. */
export function updateHeaderQuestion(
  el: Phaser.GameObjects.DOMElement,
  quiz: Quiz,
  index: number,
  total: number
): void {
  const node = el.node as HTMLElement;
  const counter = node.querySelector<HTMLElement>('[data-counter]');
  const question = node.querySelector<HTMLElement>('[data-question]');
  if (counter) counter.innerHTML = `<strong>${index + 1}</strong> / <strong>${total}</strong>`;
  if (question) question.textContent = quiz.pregunta;
}

function buildHeaderHTML(quiz: Quiz, index: number, total: number): string {
  return `
    <aside class=${css.aside}>
      <!-- ── Stats Grid ─────────────────────────────── -->
      <div class=${css.firstSection}>
        <!-- Score -->
        <div class=${css.score}>
            <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" class=${css.iconOne}>
              <path d="M280-120v-80h160v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80v-80h400v80h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h160v80H280zm0-408v-152h-80v40q0 38 22 68.5t58 43.5zm285 93q35-35 35-85v-240H360v240q0 50 35 85t85 35q50 0 85-35zm115-93q36-13 58-43.5t22-68.5v-40h-80v152zm-200-52z"/>
            </svg>
            <p class=${css.points}
             data-score>0
            </p>
            <span class=${css.pointsText}>
              Puntos
            </span>
        </div>



        <!-- Level -->
        <div class=${css.level}>

          <p data-counter style="font-size:1.4rem; font-weight:700; color:white; margin:0; line-height:1.2;" >
            <strong>${index + 1}</strong> / <strong>${total}</strong>
          </p>
           <span class=${css.Textlevel}>Preguntas</span>
        </div>

        <div class="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" class=${css.iconTwo}>
            <path d="M360-840v-80h240v80H360zm80 440h80v-240h-80v240zm-99.5 291.5Q275-137 226-186t-77.5-114.5Q120-366 120-440t28.5-139.5Q177-645 226-694t114.5-77.5Q406-800 480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80q-74 0-139.5-28.5zM678-242q82-82 82-198t-82-198q-82-82-198-82t-198 82q-82 82-82 198t82 198q82 82 198 82t198-82zM480-440z"/>
          </svg>
          <div class="flex flex-col leading-none">
            <span class=${css.TextTime}>Tiempo</span>
            <span class="text-base font-bold font-mono text-slate-900 dark:text-white" data-timer>0</span>
          </div>
        </div>
        <!-- Pregunta -->
        <div class=${css.containerQuestion}>
          <p class=${css.question}>
            Pregunta:
          </p>
          <p  class=${css.questionText} data-question>
            ${quiz.pregunta}
          </p>
        </div>
      </div>
      <div class=${css.options}>
        ${buildOptionsHTML(quiz)}
      </div>
        <!-- Botón de mute (solo visual, la funcionalidad se maneja aparte) -->
      <div class=${css.secondSection}>

        <div class=${css.cotainerMuteButton}>
          <button data-mute style="pointer-events:auto" class="flex items-center justify-center size-15 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
            <span data-mute-on>
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFF">
                <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131zM120-360v-240h160l200-200v640L280-360H120zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320zM400-606l-86 86H200v80h114l86 86v-252zM300-480z"/>
              </svg>
            </span>
            <!-- SVG silenciado — oculto por defecto -->
            <span data-mute-off style="display:none">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFF">
                <path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Z"/>
              </svg>
            </span>
          </button>
          <span class=${css.muteText}>Silenciar</span>
        </div>
        <button data-exit class=${css.exit} style="pointer-events:auto" class="flex items-center justify-between bg-blue-700 h-10 px-4
          rounded-lg bg-primary hover:bg-primary/90 text-white gap-3 font-bold transition-colors shadow-lg
          shadow-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFF">
            <path d="M360-200L80-480l280-280 56 56-183 184h647v80H233l184 184-57 56z"/>
          </svg>
          <p class=${css.exitText}>Salir</p>
        </button>
      </div>
    </aside>
    `;
}

// ─────────────────────────────────────────────────────────────
//  OPCIONES — grid A–F con el texto de cada opción
// ─────────────────────────────────────────────────────────────



/** Actualiza las opciones del aside buscando el contenedor dentro del headerEl. */
export function updateOptionsContent(headerEl: Phaser.GameObjects.DOMElement, quiz: Quiz): void {
  const node = headerEl.node as HTMLElement;
  const optionsContainer = node.querySelector(`.${css.options}`);
  if (optionsContainer) optionsContainer.innerHTML = buildOptionsHTML(quiz);
}

function buildOptionsHTML(quiz: Quiz): string {
  return `
      ${quiz.opciones
        .map(
          (opcion, i) => `
        <div class=${css.option} data-option-id="${opcion.id}">
          <p class=${css.indexQuestion}>
            ${OPTION_LETTERS[i]}
          </p>
          <p>
            ${opcion.texto}
          </p>
        </div>` )
        .join('')}
   `;
}

// ─────────────────────────────────────────────────────────────
//  ETIQUETAS DE TRONERA
// ─────────────────────────────────────────────────────────────

/** Etiqueta de letra junto a cada tronera. */
export function createPocketLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  letter: string
): Phaser.GameObjects.DOMElement {
  const el = scene.add.dom(x, y, 'div', '', '') as Phaser.GameObjects.DOMElement;
  (el.node as HTMLElement).style.pointerEvents = 'none';
  el.setClassName(css.quizPool__elementOptions);
  el.node.innerHTML = `
  <div class="${css.quizPool__containerOptionIndex}">
    <div class="size-8 rounded-full flex items-center justify-center font-bold ${css.index}">
      <p>${letter}</p>
    </div>
  </div>
  `;
  return el;
}

/** Crea las 6 etiquetas de tronera usando las posiciones y letras definidas en POCKETS. */
export function createAllPocketLabels(scene: Phaser.Scene, totalOpciones: number): Phaser.GameObjects.DOMElement[] {
  return POCKETS.map((p) => {
    const label = createPocketLabel(scene, p.labelX ?? p.x, p.labelY ?? p.y, p.letter);
    label.setVisible(p.index < totalOpciones);
    return label;
  });
}

/** Actualiza visibilidad de las etiquetas cuando cambia la pregunta. */
export function updatePocketLabels(labels: Phaser.GameObjects.DOMElement[], totalOpciones: number): void {
  labels.forEach((label, i) => {
    label.setVisible(POCKETS[i].index < totalOpciones);
  });
}
// ui.ts

// ─────────────────────────────────────────────────────────────
//  FEEDBACK — mensaje correcto / incorrecto con GSAP
// ─────────────────────────────────────────────────────────────

/**
 * Muestra un mensaje de feedback centrado en pantalla.
 * Se anima con GSAP y desaparece solo después de 1.8s.
 */
export function showFeedback(correcto: boolean): void {
  // Evitar duplicados

  const existing = document.getElementById('quiz-feedback');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'quiz-feedback';
  el.innerHTML = correcto
    ? `<div class="${css.containerFeedBack} flex flex-col items-center gap-2">
         <span class="text-6xl">🎱</span>
         <p class="font-black tracking-tight text-green-400 drop-shadow-lg">¡Correcto!</p>
         <p class="font-medium text-white/80">Sigue así, vas muy bien</p>
       </div>`
    : `<div class="${css.containerFeedBack} flex flex-col items-center gap-2">
         <span class="text-6xl">😬</span>
         <p class="font-black tracking-tight text-red-400 drop-shadow-lg">¡Incorrecto!</p>
         <p class="font-medium text-white/80">Inténtalo de nuevo</p>
       </div>`;

  // Estilos base — centrado sobre el canvas
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
    pointerEvents: 'none',
    with: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
  });

  document.body.appendChild(el);

  // Animación GSAP — entrada desde abajo + fade, luego sale hacia arriba
  const inner = el.firstElementChild as HTMLElement;
  gsap.fromTo(
    inner,
    { opacity: 0, y: 40, scale: 0.8 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(1.7)',
      onComplete: () => {
        // Esperar 1.4s y salir
        gsap.to(inner, {
          opacity: 0,
          y: -30,
          scale: 0.9,
          duration: 0.35,
          delay: 1.4,
          ease: 'power2.in',
          onComplete: () => el.remove()
        });
      }
    }
  );
}

/**
 * Anima la salida de la pregunta actual y la entrada de la nueva.
 * Llámala ANTES de actualizar el contenido del DOM.
 */
export function animateQuestionChange(
  headerEl: Phaser.GameObjects.DOMElement,
  optionsEl: Phaser.GameObjects.DOMElement | undefined,
  onMidpoint: () => void // callback donde se actualiza el contenido
): void {
  const header = headerEl.node as HTMLElement;

  const questionEl = header.querySelector<HTMLElement>('[data-question]');
  const counterEl = header.querySelector<HTMLElement>('[data-counter]');
  const optionEls = optionsEl
    ? Array.from((optionsEl.node as HTMLElement).querySelectorAll<HTMLElement>('[data-option-id]'))
    : [];

  const tl = gsap.timeline();

  // ── SALIDA ────────────────────────────────────────────────
  // Pregunta sale hacia arriba
  tl.to(questionEl, {
    opacity: 0,
    y: -20,
    duration: 0.25,
    ease: 'power2.in'
  })
    // Contador hace un pequeño flash
    .to(
      counterEl,
      {
        opacity: 0,
        duration: 0.15,
        ease: 'power1.in'
      },
      '<'
    )
    // Opciones salen en cascada hacia abajo (stagger)
    .to(
      optionEls,
      {
        opacity: 0,
        y: 20,
        scale: 0.95,
        duration: 0.2,
        stagger: 0.04,
        ease: 'power2.in'
      },
      '<0.05'
    )

    // ── MIDPOINT — aquí se actualiza el contenido del DOM ────
    .call(() => onMidpoint())

    // ── ENTRADA ───────────────────────────────────────────────
    // Flash de color en el fondo del header para llamar la atención
    .fromTo(
      header,
      {
        backgroundColor: 'rgba(99, 102, 241, 0.15)'
      },
      {
        backgroundColor: 'rgba(99, 102, 241, 0)',
        duration: 0.6,
        ease: 'power2.out'
      }
    )
    // Contador entra con bounce
    .fromTo(
      counterEl,
      {
        opacity: 0,
        scale: 0.7
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: 'back.out(2)'
      },
      '<'
    )
    // Pregunta entra desde abajo con bounce
    .fromTo(
      questionEl,
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'back.out(1.4)'
      },
      '<0.1'
    )
    // Opciones entran en cascada con pop
    .fromTo(
      optionEls,
      {
        opacity: 0,
        y: 25,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.07,
        ease: 'back.out(1.6)'
      },
      '<0.1'
    );
}
/** Actualiza el puntaje en el header sin recrear el DOM. */
export function updateScore(el: Phaser.GameObjects.DOMElement, score: number): void {
  const node = el.node as HTMLElement;
  const scoreEl = node.querySelector<HTMLElement>('[data-score]');
  if (scoreEl) scoreEl.textContent = String(score);
  gsap.fromTo(
    scoreEl,
    { scale: 1 },
    {
      scale: 3,
      duration: 0.15,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      transformOrigin: 'center center' // ← escala desde el centro
    }
  );
}

/** Actualiza el timer en formato mm:ss en el header. */
export function updateTimer(el: Phaser.GameObjects.DOMElement, secs: number): void {
  const node = el.node as HTMLElement;
  const timerEl = node.querySelector<HTMLElement>('[data-timer]');
  if (!timerEl) return;

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  timerEl.textContent = `${mm}:${ss}`;
}
