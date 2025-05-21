import Phaser from 'phaser';

import { globalState } from '../utils/GlobalState';

//pantalla donde termina el juego, puede ser de victoria o derrota
export class EndGame extends Phaser.Scene {
  constructor() {
    super('endGameScene');
  }
  preload() {}
  create() {
    this.add.image(480, 250, 'whater').setScale(1.2);
    this.add.image(400, 100, 'orilla').setScale(0.8);
    const contenedor = this.add.dom(40, -60, 'div', '', '') as Phaser.GameObjects.DOMElement;
    contenedor.setClassName('gameFrog__mi-svg');
    contenedor.setScale(0.8);
    contenedor.setOrigin(0, 0);
    contenedor.setDepth(-1);
    const html = contenedor.node as HTMLElement;
    html.innerHTML = `
        <svg width="928" height="928" viewBox="0 0 928 928" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M464 464L420.5 0H507.5L464 464Z" fill="url(#paint0_diamond)" />
          <path d="M464 464L507.5 928H420.5L464 464Z" fill="url(#paint1_diamond)" />
          <path d="M464 464L928 420.5V507.5L464 464Z" fill="url(#paint2_diamond)" />
          <path d="M464 464L0 507.5V420.5L464 464Z" fill="url(#paint3_diamond)" />
          <path d="M464 464L761.337 105.14L822.86 166.663L464 464Z" fill="url(#paint4_diamond)" />
          <path d="M464 464L166.663 822.86L105.14 761.337L464 464Z" fill="url(#paint5_diamond)" />
          <path d="M464 464L822.86 761.337L761.337 822.86L464 464Z" fill="url(#paint6_diamond)" />
          <path d="M464 464L105.14 166.663L166.663 105.14L464 464Z" fill="url(#paint7_diamond)" />
          <path d="M464 464L598.821 17.8929L679.397 50.7209L464 464Z" fill="url(#paint8_diamond)" />
          <path d="M464 464L329.179 910.107L248.602 877.279L464 464Z" fill="url(#paint9_diamond)" />
          <path d="M464 464L910.107 598.821L877.279 679.397L464 464Z" fill="url(#paint10_diamond)" />
          <path d="M464 464L17.8928 329.179L50.7208 248.602L464 464Z" fill="url(#paint11_diamond)" />
          <path d="M464 464L874.785 243.89L908.541 324.075L464 464Z" fill="url(#paint12_diamond)" />
          <path d="M464 464L53.2149 684.11L19.4589 603.925L464 464Z" fill="url(#paint13_diamond)" />
          <path d="M464 464L684.11 874.785L603.925 908.541L464 464Z" fill="url(#paint14_diamond)" />
          <path d="M464 464L243.89 53.2149L324.075 19.4589L464 464Z" fill="url(#paint15_diamond)" />
          <defs>
              <radialGradient id="paint0_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(464 232) rotate(90) scale(232 43.5)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint1_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(464 696) rotate(90) scale(232 43.5)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint2_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(696 464) rotate(90) scale(43.5 232)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint3_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(232 464) rotate(90) scale(43.5 232)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint4_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(643.43 284.57) rotate(90) scale(179.43)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint5_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(284.57 643.43) rotate(90) scale(179.43)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint6_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(643.43 643.43) rotate(90) scale(179.43)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint7_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(284.57 284.57) rotate(90) scale(179.43)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint8_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(571.699 240.946) rotate(90) scale(223.053 107.699)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint9_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(356.301 687.053) rotate(90) scale(223.053 107.699)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint10_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(687.053 571.699) rotate(90) scale(107.699 223.053)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint11_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(240.946 356.301) rotate(90) scale(107.699 223.053)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint12_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(686.271 353.945) rotate(90) scale(110.055 222.271)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint13_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(241.729 574.055) rotate(90) scale(110.055 222.27)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint14_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(574.055 686.271) rotate(90) scale(222.271 110.055)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
              <radialGradient id="paint15_diamond" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(353.945 241.729) rotate(90) scale(222.27 110.055)">
                  <stop stop-color="white" stop-opacity="0.46" />
                  <stop offset="0.526042" stop-color="white" stop-opacity="0.49" />
                  <stop offset="1" stop-color="white" stop-opacity="0.18" />
              </radialGradient>
          </defs>
      </svg>
    `;

    // this.add.image(400, 430, 'frog').setScale(0.1);
    if (globalState.vidas === globalState.data.length) {
      const ganastes = this.add.dom(400, 60, 'h2', '', '¡Ganaste!') as Phaser.GameObjects.DOMElement;
      ganastes.setClassName('gameFrog__ganaste');
      const felicidades = this.add.dom(400, 120, 'h3', '', '¡felicidades!') as Phaser.GameObjects.DOMElement;
      felicidades.setClassName('gameFrog__felicidades');
    } else {
      const perdiste = this.add.dom(400, 60, 'h2', '', '¡Perdiste!') as Phaser.GameObjects.DOMElement;
      perdiste.setClassName('gameFrog__ganaste');
      const vuelveIntentar = this.add.dom(400, 120, 'h3', '', 'Vuelve a intentarlo') as Phaser.GameObjects.DOMElement;
      vuelveIntentar.setClassName('gameFrog__felicidades');
    }

    this.children.getAll().forEach((child: Phaser.GameObjects.GameObject) => {
      (child as Phaser.GameObjects.Sprite).setAlpha(0.6);
    });
    const imagen = this.add.dom(260, 110, 'div', '', '') as Phaser.GameObjects.DOMElement;
    imagen.setClassName('gameFrog__imagen-dom');
    imagen.setOrigin(0, 0);
    const htmlImagen = imagen.node as HTMLElement;
    if (globalState.vidas === globalState.data.length) {
      htmlImagen.innerHTML = `<img src="assets/game-jump-frog/images/copaTrofeo.png" alt="Una copa de color amarillo" style="width: 300px; height: auto;">`;
    } else {
      htmlImagen.innerHTML = `<img src="assets/game-jump-frog/images/sapoLLorando.png" alt="una rana llorando" style="width: 300px; height: auto;">`;
    }

    const score = this.add.dom(260, 400, 'div', '', '') as Phaser.GameObjects.DOMElement;
    score.setClassName('gameFrog__mi-score');
    score.setOrigin(0, 0);
    const htmlScore = score.node as HTMLElement;
    htmlScore.innerHTML = `
    <div class="gameFrog__mi-score_container">
      <strong>Puntaje:</strong> <strong id="score">0</strong>
    </div>
    <div class="gameFrog__mi-score_container">
      <strong>Vidas: </strong> <strong>${globalState.vidas}</strong>
    </div>`;
    const btnVolver = this.add.dom(330, 480, 'div', '', '') as Phaser.GameObjects.DOMElement;
    btnVolver.setClassName('gameFrog__btnVolver');
    btnVolver.setOrigin(0, 0);
    const htmlBtnVolver = btnVolver.node as HTMLElement;
    htmlBtnVolver.innerHTML = `
    <button id="btnVolver" class="gameFrog__btnVolver">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M280-200v-80h284q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l104 104-56 56-200-200 200-200 56 56-104 104h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H280Z"/></svg>
    <span>Volver</span></button>
   `;
    const btnVolverEl = document.getElementById('btnVolver');
    if (btnVolverEl) {
      btnVolverEl.addEventListener('click', () => {
        this.scene.start('menuScene'); // Cambia a la escena de menú
        this.sound.stopAll(); // Detiene todos los sonidos
        globalState.reload = true; // Cambia el estado de reload a true
      });
    }
    const auidoSuccess = this.sound.add('success', { volume: 0.5 });
    this.tweens.addCounter({
      from: 0,
      to: globalState.puntos, // Valor final, 400 en este caso
      duration: 4000, // Duración de 2 segundos (ajusta según necesites)
      ease: 'Linear',
      onUpdate: (tween) => {
        const currentScore = Math.floor(tween.getValue());
        // Actualiza el texto del highscore en el DOM
        const highscoreEl = document.getElementById('score');
        if (highscoreEl) {
          highscoreEl.innerText = currentScore.toString();
        }
      }
    });
    if (globalState.specificMusic) {
      auidoSuccess.play();
    }
  }

  update() {}
}
