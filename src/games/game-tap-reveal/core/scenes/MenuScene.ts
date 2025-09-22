import Phaser from 'phaser';

import { animations } from '../utils/AnimationsGsap';
import { globalState } from '../utils/GlobalState';

// import { Main } from './MainScene';

export class Menu extends Phaser.Scene {
  constructor() {
    super('menuScene');
  }

  create() {
    this.add.image(500, 300, 'menuBg').setScale(0.2);

    // if (mainScene.backgroundMusic?.isPlaying) {
    //   mainScene.backgroundMusic.pause();
    // }
    // Define los SVGs
    const svgOn = `<svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="black"><path d="M640-440v-80h160v80H640Zm48 280-128-96 48-64 128 96-48 64Zm-80-480-48-64 128-96 48 64-128 96ZM120-360v-240h160l200-200v640L280-360H120Zm280-246-86 86H200v80h114l86 86v-252ZM300-480Z"/></svg>`;
    const svgOff = `<svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="black"><path d="M813-56 681-188q-28 20-60.5 34.5T553-131v-62q23-7 44.5-15.5T638-231L473-397v237L273-360H113v-240h156L49-820l43-43 764 763-43 44Zm-36-232-43-43q20-34 29.5-71.92Q773-440.85 773-481q0-103.32-60-184.66T553-769v-62q124 28 202 125.5T833-481q0 51-14 100t-42 93ZM643-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T643-422ZM473-592 369-696l104-104v208Zm-60 286v-150l-84-84H173v120h126l114 114Zm-42-192Z"/></svg>`;

    let audioGeneralActivo = localStorage.getItem('audioGeneralActivo') === 'true';
    globalState.generalMusic = audioGeneralActivo;

    // Selecciona el botón

    const containerText = this.add.dom(550, 280, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerText.setClassName('tapReveal__containerMenuButtons');
    const htmlContainerText = containerText.node as HTMLElement;
    htmlContainerText.innerHTML = `
    <h1 class="tapReveal__Title_stardScene" id="tapReveal"> TAP REVEAL</h1>
    <button  class="cityOfWisdom__btns" id="instrutions">Instrucciones</button>
    <button  class="cityOfWisdom__btns" id="startButton">Iniciar</button>
    <button class="cityOfWisdom__btns" id="btnAudioGeneral" aria-label="audio">
      ${audioGeneralActivo ? svgOn : svgOff}
    </button>
    `;

    const h1 = document.getElementById('tapReveal');
    if (!h1) return;
    const text = h1.textContent;
    h1.textContent = ''; // limpiar el h1
    if (!text) return;
    text.split('').forEach((letter) => {
      const span = document.createElement('span');
      span.textContent = letter;
      h1.appendChild(span);
    });
    const letters = h1.querySelectorAll('span');
    animations.showTitleAnimation(letters);
    const cityOfWisdom__btns = document.querySelectorAll('.cityOfWisdom__btns');
    cityOfWisdom__btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        btn.appendChild(ripple);
        ripple.style.left = ' 150px';
        ripple.style.top = ' 50px';

        animations.animationsButtonsMenu(btn as HTMLElement, ripple);
      });
    });

    // Evento para ir a la escena del juego
    const startButton = document.getElementById('startButton') as HTMLButtonElement;
    startButton.addEventListener('click', () => {
      setTimeout(() => {
        this.scene.start('MainScene');
      }, 1000);
    });

    const instrutions = document.getElementById('instrutions') as HTMLButtonElement;
    instrutions.addEventListener('click', () => {
      setTimeout(() => {
        this.scene.start('InstructionScene');
      }, 1000);
    });
    // Evento para alternar estado y cambiar SVG
    // let audioGeneralActivo: bolean = false;
    const btnAudioGeneral = document.getElementById('btnAudioGeneral');
    if (!btnAudioGeneral) return;
    btnAudioGeneral.addEventListener('click', () => {
      audioGeneralActivo = !audioGeneralActivo;
      localStorage.setItem('audioGeneralActivo', audioGeneralActivo.toString());
      globalState.generalMusic = audioGeneralActivo;
      btnAudioGeneral.innerHTML = audioGeneralActivo ? svgOn : svgOff;
    });
  }
}
