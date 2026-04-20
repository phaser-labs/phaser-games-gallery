// ─────────────────────────────────────────────────────────────
//  UI — constructores de HTML para los elementos DOM de Phaser
//  Cada función recibe la escena y monta el contenedor en el canvas.
//  pointer-events: none en el wrapper, auto en los elementos interactivos.
// ─────────────────────────────────────────────────────────────
import gsap from 'gsap';
import Phaser from 'phaser';

import { Quiz } from '../../types/AppTypes';

import '../../tailwind.css';
import css from '../../QuizPool.module.css';

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
  const el = scene.add.dom(650, 0, 'div', '', '') as Phaser.GameObjects.DOMElement;
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
  
  if (counter) counter.innerHTML = `Pregunta  <strong>${index + 1}</strong> de <strong>${total}</strong>`;
  if (question) question.textContent = quiz.pregunta;
}

function buildHeaderHTML(quiz: Quiz, index: number, total: number): string {
  return `
    <header class="${css.header} flex items-center justify-between px-6 py-4 mx-auto">
      <div class="flex items-center gap-3">
        <div class="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" class=${css.iconOne}>
            <path d="M189-160q-60 0-102.5-43T42-307q0-9 1-18t3-18l84-336q14-54 57-87.5t98-33.5h390q55 0 98 33.5t57 87.5l84 336q2 9 3.5 18.5T919-306q0 61-43.5 103.5T771-160q-42 0-78-22t-54-60l-28-58q-5-10-15-15t-21-5H385q-11 0-21 5t-15 15l-28 58q-18 38-54 60t-78 22zm3-80q19 0 34.5-10t23.5-27l28-57q15-31 44-48.5t63-17.5h190q34 0 63 18t45 48l28 57q8 17 23.5 27t34.5 10q28 0 48-18.5t21-46.5q0 1-2-19l-84-335q-7-27-28-44t-49-17H285q-28 0-49.5 17T208-659l-84 335q-2 6-2 18 0 28 20.5 47t49.5 19zm376.5-291.5Q580-543 580-560t-11.5-28.5Q557-600 540-600t-28.5 11.5Q500-577 500-560t11.5 28.5Q523-520 540-520t28.5-11.5zm80-80Q660-623 660-640t-11.5-28.5Q637-680 620-680t-28.5 11.5Q580-657 580-640t11.5 28.5Q603-600 620-600t28.5-11.5zm0 160Q660-463 660-480t-11.5-28.5Q637-520 620-520t-28.5 11.5Q580-497 580-480t11.5 28.5Q603-440 620-440t28.5-11.5zm80-80Q740-543 740-560t-11.5-28.5Q717-600 700-600t-28.5 11.5Q660-577 660-560t11.5 28.5Q683-520 700-520t28.5-11.5zm-367 63Q370-477 370-490v-40h40q13 0 21.5-8.5T440-560q0-13-8.5-21.5T410-590h-40v-40q0-13-8.5-21.5T340-660q-13 0-21.5 8.5T310-630v40h-40q-13 0-21.5 8.5T240-560q0 13 8.5 21.5T270-530h40v40q0 13 8.5 21.5T340-460q13 0 21.5-8.5zM480-480z"/>
          </svg>
        </div>
        <h1 class="${css.textLogo} font-bold tracking-tight  text-white">Question Pool</h1>
      </div>
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3  bg-slate-800 px-4 py-2 rounded-lg border  border-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" class=${css.iconOne}>
            <path d="M280-120v-80h160v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80v-80h400v80h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h160v80H280zm0-408v-152h-80v40q0 38 22 68.5t58 43.5zm285 93q35-35 35-85v-240H360v240q0 50 35 85t85 35q50 0 85-35zm115-93q36-13 58-43.5t22-68.5v-40h-80v152zm-200-52z"/>
          </svg>
          <div style={{fontSize: '1rem'}}  class="flex flex-col leading-none">
            <span class=" uppercase font-bold  text-slate-400 tracking-wider">Puntos</span>
            <p class="${css.textScore} text-base font-bold  text-white" data-score>0</p>
          </div>
        </div>
        <div class="flex items-center gap-3  bg-slate-800 px-4 py-2 rounded-lg border  border-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" class=${css.iconTwo}>
            <path d="M360-840v-80h240v80H360zm80 440h80v-240h-80v240zm-99.5 291.5Q275-137 226-186t-77.5-114.5Q120-366 120-440t28.5-139.5Q177-645 226-694t114.5-77.5Q406-800 480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80q-74 0-139.5-28.5zM678-242q82-82 82-198t-82-198q-82-82-198-82t-198 82q-82 82-82 198t82 198q82 82 198 82t198-82zM480-440z"/>
          </svg>
          <div style={{fontSize: '1rem'}} class="flex flex-col leading-none">
            <span  class="uppercase font-bold  text-slate-400 tracking-wider">Tiempo</span>
            <span class="font-bold font-mono  text-white" data-timer>0</span>
          </div>
        </div>
        <div class="h-8 w-px bg-slate-200  mx-2"></div>
        <div class="flex items-center justify-between gap-3">

        <button data-mute style="pointer-events:auto" class="flex items-center justify-center size-15 rounded-lg  hover:bg-slate-200 bg-slate-800  transition-colors  text-slate-300">
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
          <button data-exit class=${css.exit} style="pointer-events:auto" class="flex items-center justify-between h-10 px-4 rounded-lg gap-3 font-bold transition-colors shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFF">
              <path d="M360-200L80-480l280-280 56 56-183 184h647v80H233l184 184-57 56z"/>
            </svg>
            <p class="text-2xl">Salir</p>
          </button>
        </div>
      </div>
    </header>
    <div class="flex flex-col items-center justify-center ${css.containerQuestion}">
      <div class="mb-4 px-3 py-1 rounded-lg tracking-widest uppercase ${css.indexQuestion}">
        <p data-counter>Pregunta <strong>${index + 1}</strong> de <strong>${total}</strong></p>
      </div>
      <h2 class="${css.question} font-bold  text-white leading-tight drop-shadow-sm mb-2"
          data-question>
        ${quiz.pregunta}
      </h2>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  OPCIONES — grid A–F con el texto de cada opción
// ─────────────────────────────────────────────────────────────

/** Crea el grid de opciones con los textos del quiz actual. */
export function createOptionsUI(scene: Phaser.Scene, quiz: Quiz): Phaser.GameObjects.DOMElement {
  const el = scene.add.dom(650, 800, 'div', '', '') as Phaser.GameObjects.DOMElement;
  el.setClassName(css.quizPool__containerOptions);
  (el.node as HTMLElement).style.pointerEvents = 'none';
  (el.node as HTMLElement).innerHTML = buildOptionsHTML(quiz);
  return el;
}

/** Actualiza los textos de las opciones sin recrear el elemento. */
export function updateOptionsContent(el: Phaser.GameObjects.DOMElement, quiz: Quiz): void {
  // Reconstruir todo el HTML en vez de solo actualizar textos
  // Esto maneja correctamente cuando cambia el número de opciones
  (el.node as HTMLElement).innerHTML = buildOptionsHTML(quiz);
}

function buildOptionsHTML(quiz: Quiz): string {
  return `
    <div class="mt-8 grid grid-cols-3 gap-4 w-full max-w-3xl ${css.containerQuestion}">
      ${quiz.opciones
        .map(
          (opcion, i) => `
        <div style="pointer-events:auto"
             data-option-id="${opcion.id}"
             class="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-slate-800 cursor-pointer hover:border-primary/60 transition-colors">
          <div class="size-8 rounded-full flex items-center justify-center font-bold ${css.indexQuestion}">
            ${OPTION_LETTERS[i]}
          </div>
          <span style={{fontSize: '1.2rem'}} class="font-medium  text-white flex-1" data-option>
            ${opcion.texto}
          </span>
        </div>`
        )
        .join('')}
    </div>`;
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

/** Crea las 6 etiquetas de tronera (A–F) de una vez. */
export function createAllPocketLabels(scene: Phaser.Scene, totalOpciones: number): Phaser.GameObjects.DOMElement[] {
  const allLabels = [
    { x: 155, y: 198, letter: 'A' },
    { x: 635, y: 198, letter: 'B' },
    { x: 1110, y: 198, letter: 'C' },
    { x: 155, y: 790, letter: 'D' },
    { x: 635, y: 790, letter: 'E' },
    { x: 1110, y: 790, letter: 'F' }
  ];

  return allLabels.map(({ x, y, letter }, i) => {
    const label = createPocketLabel(scene, x, y, letter);
    label.setVisible(i < totalOpciones);
    return label;
  });
}

export function updatePocketLabels(labels: Phaser.GameObjects.DOMElement[], totalOpciones: number): void {
  console.log('Se ejecuto la funcion updatePocketLabels');
  labels.forEach((label, i) => {
    label.setVisible(i < totalOpciones);
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
    height: '100%'
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
  optionsEl: Phaser.GameObjects.DOMElement,
  onMidpoint: () => void // callback donde se actualiza el contenido
): void {
  const header = headerEl.node as HTMLElement;
  const options = optionsEl.node as HTMLElement;

  const questionEl = header.querySelector<HTMLElement>('[data-question]');
  const counterEl = header.querySelector<HTMLElement>('[data-counter]');
  const optionEls = Array.from(options.querySelectorAll<HTMLElement>('[data-option-id]'));

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
