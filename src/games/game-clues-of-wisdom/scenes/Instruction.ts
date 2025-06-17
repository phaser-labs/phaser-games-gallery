import Phaser from 'phaser';

import '../styles/gamePistas.css';

export class InstructionScene extends Phaser.Scene {
  private instructionElement?: Phaser.GameObjects.DOMElement;
  constructor() {
    super('instructionScene');
  }
  init() {}
  create() {
    this.instructionElement = this.add.dom(0, 0, 'div').setDepth(10).setOrigin(0, 0);
    const instructionContainer = this.instructionElement.node as HTMLDivElement;
    instructionContainer.classList.add('game-clues-instruction-container');
    instructionContainer.innerHTML = `
     <h2 class="game-clues-instruction__title">Instrucciones</h2> 
     <ul class="game-clues-instruction__list">
      <li>Explora el mapa en busca de cofres.</li>
      <li>Cada cofre que abras revelará una palabra. Algunas de estas palabras son las que necesitas para completar la frase.</li>
      <li>La frase a completar se mostrará en la parte superior de la pantalla. A medida que encuentres las palabras correctas en los cofres, se irán rellenando los espacios en blanco.</li>
      <li>¡Cuidado con los Enemigos! Hay de varios tipos, y para derrotarlos solo tendras que saltarles encima.</li>
      <li>Ten cuidado con las Espinas, que te harán perder todas tus vidas.</li>
      <li>Cada zanahoria que encuentres te restaurará una vida.</li>
      <li>Para ganar, encuentra todas las palabras objetivo para completar la frase y revelar el mensaje final.</li>
      </ul>
      
      <button id="btn-iniciar-juego" aria-label="Iniciar juego" class="game-start-button">Iniciar Juego</button>
<button id="btn-volver-atras" aria-label="Volver atrás" class="game-back-button"></button>
     `;

const backButton = document.getElementById('btn-volver-atras');
if (backButton) {
  backButton.addEventListener('click', () => {
    this.sound.play('click', {volume: 0.5}); 
    this.scene.start('menuScene');
  });
}

const startButton = document.getElementById('btn-iniciar-juego');
if (startButton) {
  startButton.addEventListener('click', () => {
    this.sound.play('click', {volume: 0.5}); 
    this.scene.start('Play');
  });
}



  }
}
