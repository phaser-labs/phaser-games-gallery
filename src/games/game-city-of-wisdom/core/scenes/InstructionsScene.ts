import { globalState } from '../utils/GlobalState';

import { Main } from './MainScene';

export class InstructionsScene extends Phaser.Scene {
  constructor() {
    super('InstructionsScene');
  }
  preload() {}
  create() {
    const mainScene = this.scene.get('MainScene') as Main;
    if (mainScene.backgroundMusic?.isPlaying) {
      mainScene.backgroundMusic.pause();
    }
    this.add.image(520, 320, 'logo').setScale(0.8);
    const containerText = this.add.dom(550, 280, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerText.setClassName('cityOfWisdom__containerTexthtml');
    const htmlContainerText = containerText.node as HTMLElement;
    htmlContainerText.innerHTML = `
    <h1 class="cityOfWisdom__title"> CITY OF WISDOM </h1>
    <ul class="cityOfWisdom__text">
      <li>Usa las flechas para caminar por la ciudad.</li>
      <li>acercate a las puertas de cada edificio si desea conocer  los elementos que los compone.</li>
      <li>Confirma si deseas conocer los elementos </li>
      <li>Preciona  los botones de siguiente y atras para conocer los elementos que tiene cada edificio</li>
    </ul>
    <button  class="cityOfWisdom__btnIniciar" id="startButton">Iniciar</button>
    `;
    const startButton = document.getElementById('startButton') as HTMLButtonElement;
    startButton.addEventListener('click', () => {
      this.scene.start('MainScene');
    });

    let audioGeneralActivo = localStorage.getItem('audioGeneralActivo') === 'true';
    globalState.generalMusic = audioGeneralActivo;

    // Define los SVGs
    const svgOn = `<svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="black"><path d="M640-440v-80h160v80H640Zm48 280-128-96 48-64 128 96-48 64Zm-80-480-48-64 128-96 48 64-128 96ZM120-360v-240h160l200-200v640L280-360H120Zm280-246-86 86H200v80h114l86 86v-252ZM300-480Z"/></svg>`;
    const svgOff = `<svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="black"><path d="M813-56 681-188q-28 20-60.5 34.5T553-131v-62q23-7 44.5-15.5T638-231L473-397v237L273-360H113v-240h156L49-820l43-43 764 763-43 44Zm-36-232-43-43q20-34 29.5-71.92Q773-440.85 773-481q0-103.32-60-184.66T553-769v-62q124 28 202 125.5T833-481q0 51-14 100t-42 93ZM643-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T643-422ZM473-592 369-696l104-104v208Zm-60 286v-150l-84-84H173v120h126l114 114Zm-42-192Z"/></svg>`;

    // Crea el botón
    const containerButton = this.add.dom(1080, 610, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerButton.setClassName('cityOfWisdom__containerButton');

    const htmlContainerButton = containerButton.node as HTMLElement;
    htmlContainerButton.innerHTML = `
  <button class="cityOfWisdom__ButionVolumen" id="btnAudioGeneral" aria-label="audio">
    ${audioGeneralActivo ? svgOn : svgOff}
  </button>
`;

    // Selecciona el botón
    const btnAudioGeneral = document.getElementById('btnAudioGeneral') as HTMLButtonElement;

    // Evento para alternar estado y cambiar SVG
    btnAudioGeneral.addEventListener('click', () => {
      audioGeneralActivo = !audioGeneralActivo;
      localStorage.setItem('audioGeneralActivo', audioGeneralActivo.toString());
      globalState.generalMusic = audioGeneralActivo;

      btnAudioGeneral.innerHTML = audioGeneralActivo ? svgOn : svgOff;
    });
  }
  update() {}
}
