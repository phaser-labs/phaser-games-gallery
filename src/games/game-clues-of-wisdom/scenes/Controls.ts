import Phaser from 'phaser';

import MusicManager from '../utils/musicManager';

import '../styles/gamePistas.css';
export class Controls extends Phaser.Scene {
    private controlsElement?: Phaser.GameObjects.DOMElement;
  constructor() {
    super('controlsScene');
  }
  init() {}
  create() {
    this.cameras.main.setBackgroundColor('#000');
    MusicManager.getInstance().play(this, 'music');
        this.controlsElement = this.add.dom(0, 0, 'div').setDepth(10).setOrigin(0, 0);
    const controlsContainer = this.controlsElement.node as HTMLDivElement;
    controlsContainer.classList.add('game-clues-instruction-container');
    controlsContainer.innerHTML = `
     <h2 class="game-clues-instruction__title">Controles</h2> 
     <ul class="game-clues-controls__list">
      <li>Movimiento:
      <ul class="game-clues-controls__sublist">
      <li>Presiona la tecla A para ir a la Izquierda.</li>
      <li>Presiona la tecla D para ir a la Derecha.</li>
      </ul>
      </li>
      <li>Salto: Presiona la tecla W o Barra Espaciadora.</li>
      <li>Agacharse: Presiona la tecla S.</li>
      <li>Escalar Escaleras:
        <ul class="game-clues-controls__sublist">
      <li>Presiona W para subir.</li>
      <li>Presiona S para bajar.</li>
      <li>Presiona A/D o Espacio para despegarte de la escalera.</li>
      </ul>
      </li>
      <li>Abrir Cofres:
      <ul class="game-clues-controls__sublist">
      <li>Acércate a un cofre.</li>
      <li>Presiona la tecla E para abrirlo y revelar una palabra.</li>
      </ul>
      </li>
     </ul>
     <button id="btn-volver-atras" aria-label="Volver atrás" class="game-back-button"></button>
     `;

     // zona para rediriguir al menu principal
   const backButton = document.getElementById('btn-volver-atras');
if (backButton) {
  backButton.addEventListener('click', () => {
    this.sound.play('click', {volume: 0.5}); 
    this.scene.start('menuScene');
  });
}
  }
}
