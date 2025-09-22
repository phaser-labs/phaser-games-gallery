import Phaser from 'phaser';

import { animations } from '../utils/AnimationsGsap';
export class InstructionScene extends Phaser.Scene {
  constructor() {
    super('InstructionScene');
  }
  create() {
    this.add.image(500, 300, 'menuBg').setScale(0.2);
    const containerText = this.add.dom(550, 280, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerText.setClassName('tapReveal__containerMenu');
    const htmlContainerText = containerText.node as HTMLElement;
    htmlContainerText.innerHTML = `
    <div class="tapReveal__containerMenuTexthtml">
      <h1 class="tapReveal__Title_stardScene" id="tapReveal"> TAP REVEAL</h1>
      <ol class="instructionsText">
      <li>Objetivo:
        <ol>
          <li>Descubre qué imagen está oculta antes de quedarte sin puntos.</li>
        </ol>
      </li>
      <li>Cómo jugar:
        <ol>
            <li>Analice, piense, que imagen puede estar oculta.</li>
            <li>selecciona tu respuesta.</li>
        </ol>
      </li>
      <li>Ayudas disponibles:
        <ol>
            <li> <strong>Tres ayudas únicas:</strong> puedes usarlas solo una vez cada una durante toda la ronda.</li>
            <li> <strong>Ayuda infinita:</strong>Puedes usarla tantas veces como quieras, pero cada uso resta 5 puntos de tu puntuación actual.</li>
        </ol>
      </li>
      <li>Sistema de puntuación:
        <ol>
          <li>Cada respuesta correcta suma los puntos correspondientes hasta completar 100 puntos.</li>
          <li>Cada respuesta incorrecta<strong>resta 10 puntos.</strong></li>
          <li> <strong>Recuerda: </strong>si usas la ayuda infinita, también pierdes 5 puntos cada vez.</li>
        </ol>
      </li>
      <li>Fin de la ronda:
        <ol>
          <li>La ronda termina cuando adivinas correctamente todas las imágenes.</li>
        </ol>
      </li>
      <li>Consejo:
        <ol>
        <li>Usa tus ayudas estratégicamente para no perder puntos y adivinar las imágenes antes.</li>
        </ol>
      </li>
      </ol>
      <button  class="cityOfWisdom__btns" id="returnButton">Volver</button>
    </div>
    `;
    // Evento para ir a la escena del juego
    const returnButton = document.getElementById('returnButton') as HTMLButtonElement;
    returnButton.addEventListener('click', () => {
      setTimeout(() => {
        this.scene.start('menuScene');
      }, 1000);
    });

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
  }
}
