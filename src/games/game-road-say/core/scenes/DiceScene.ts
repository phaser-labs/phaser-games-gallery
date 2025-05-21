import Phaser from 'phaser';

import { globalState } from '../utils/GlobalState';

export class DiceScene extends Phaser.Scene {
  instructionsElement!: Phaser.GameObjects.DOMElement;

  constructor() {
    super('DiceScene');
  }
  preload() {}
  create() {
    const containerDice = this.add.dom(1000, 550, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerDice.setClassName('gameRoadDice__containerDice');
    const htmlcontainerDice = containerDice.node as HTMLElement;

    htmlcontainerDice.innerHTML = `

        <button id="dice" class="single-rb animation" aria-label="dado de seis caras precione para lanzar">
            <div class="front-side">
                <svg id="one">
                    <rect/>
                    <circle/>
                </svg>
            </div>
            <div class="back-side">
                <svg id="six">
                    <rect/>
                    <circle class="one"/>
                    <circle class="two"/>
                    <circle class="tree"/>
                    <circle class="four"/>
                    <circle class="five"/>
                    <circle class="six"/>
                </svg>
            </div>
            <div class="left-side">
                <svg id="two">
                    <rect/>
                    <circle class="one"/>
                    <circle class="two"/>
                </svg>
            </div>
            <div class="right-side">
                <svg id="five">
                    <rect/>
                    <circle class="one"/>
                    <circle class="two"/>
                    <circle class="tree"/>
                    <circle class="four"/>
                    <circle class="five"/>
                </svg>
            </div>
            <div class="top-side">
                <svg id="four">
                    <rect/>
                    <circle class="one"/>
                    <circle class="two"/>
                    <circle class="tree"/>
                    <circle class="four"/>
                </svg>
            </div>
            <div class="bottom-side">
                <svg id="tree">
                    <rect/>
                    <circle class="one"/>
                    <circle class="two"/>
                    <circle class="tree"/>
                </svg>
            </div>
        </button>
        <div id="resultDice"></div>
    `;
    const dice = document.getElementById('dice');
    const dado = this.sound.add('dado', { volume: 1 });

    dice!.onclick = function () {
      if (globalState.specificMusic) {
        dado.play();
      }

      dice?.classList.add('running');

      const diceRandom = Math.floor(Math.random() * 6) + 1;
      // const resultDice = document.getElementById('resultDice');
      // if (resultDice) {
      //   resultDice.innerHTML = `<p aria-live="polite">Resultado: ${diceRandom}</p>`;
      // }
      console.log('diceRandom', diceRandom);
      globalState.diceValue = diceRandom;
      window.setTimeout(function () {
        dice!.classList.remove('running');
        dice!.classList.remove('animation');

        switch (diceRandom) {
          case 1:
            dice!.style.transform = 'rotateX(1deg) rotateY(1deg) rotateZ(-22deg)';
            break;
          case 2:
            dice!.style.transform = 'rotateX(8deg) rotateY(443deg) rotateZ(-22deg)';
            break;
          case 3:
            dice!.style.transform = 'rotateX(453deg) rotateY(0deg) rotateZ(-15deg)';
            break;
          case 4:
            dice!.style.transform = 'rotateX(-463deg) rotateY(3deg) rotateZ(9deg)';
            break;
          case 5:
            dice!.style.transform = 'rotateX(-17deg) rotateY(-461deg) rotateZ(-26deg)';
            break;
          case 6:
            dice!.style.transform = 'rotateX(-16deg) rotateY(190deg) rotateZ(332deg)';
            break;
        }
      }, 700);

      dice?.classList.add('animation');
    };
  }
  update() {}
}
