import Phaser from 'phaser';

import { animations } from '../utils/AnimationsGsap';
import { globalState } from '../utils/GlobalState';
export class EndGame extends Phaser.Scene {
  constructor() {
    super('endGameScene');
  }
  create() {
    this.add.image(550, 280, 'endGameImage').setScale(2);
    const containerText = this.add.dom(550, 280, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerText.setClassName('tapReveal__containerMenu');
    const htmlContainerText = containerText.node as HTMLElement;
    htmlContainerText.innerHTML = `
    <div class="tapReveal__containerMenuTexthtml">
    ${
      globalState.score <= 50
        ? `
        <div class="tapReveal__lost">
          <section class="tapReveal__container">
            <h2 aria-label = "perdiste">
            <span class="title">¡Perdiste!</span>
            <span class="title"> vuelve </span>
            <span class="title"> a </span>
            <span class="title"> intentarlo</span>
            </h2>
            <p class="tapReveal__textScore" tabindex="0" aria-label = "score" aria-live="polite">${globalState.score} puntos</p>
          </section>
        </div>
        `
        : `
          <div class="tapReveal__trophyAndScore">
            <img src="assets/images/trofeo.png" alt="imagen de un trofeo dorado" class="tapReveal__trophyImage"/>
            <img src="assets/images/poste.png" alt="poste del lado izquierdo" class="tapReveal__lamppostLeft"/>
            <img src="assets/images/poste.png" alt="poste el lado derecho" class="tapReveal__lamppostRight"/>
            <img src="assets/images/winner.png" alt="imagen de una pancarta con el puntaje del juego" class="scoreImage"/>
            <p class="tapReveal__textScore" tabindex="0" aria-label = "score" aria-live="polite">${globalState.score} puntos</p>
          </div>
          `
    }
      <button  class="cityOfWisdom__btns" id="restartButton">Reiniciar</button>
    </div>
    `;
    // Evento para ir a la escena del juego
    const restartButton = document.getElementById('restartButton') as HTMLButtonElement;
    restartButton.addEventListener('click', () => {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      restartButton.appendChild(ripple);
      const rect = restartButton.getBoundingClientRect();
      ripple.style.left = ' 150px';
      ripple.style.top = ' 50px';

      console.log(rect);

      animations.animationsButtonsMenu(restartButton as HTMLElement, ripple);
      setTimeout(() => {
        this.scene.start('menuScene');
      }, 1000);
    });
    this.lettering('.title');
    // this.animation();
  }
  lettering = (selector: string) => {
    console.log(selector);
    const title = document.querySelectorAll(selector);
    console.log(title);
    title.forEach((el) => {
      const text = el.textContent;
      el.textContent = '';
      if (!text) return;
      text.split('').forEach((letter) => {
        const span = document.createElement('span');
        span.textContent = letter;
        el.appendChild(span);
      });
    });
    animations.animationLostGame();
  };
}
