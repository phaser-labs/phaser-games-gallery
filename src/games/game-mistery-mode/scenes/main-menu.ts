import { GameObjects, Scene } from 'phaser';

import { gameData } from '@/data/data-game-mistery-mode';

import { EventBus } from '../event-bus';

import styles from '../styles/game-mistery-mode.module.css';

export class MainMenu extends Scene {
  background!: GameObjects.Image;
  title!: GameObjects.Text;
  textScene!: GameObjects.DOMElement;

  constructor() {
    super('MainMenu');
  }

  create() {
    const bgKey = 'background-1';

    this.registry.set('global-background', bgKey);

    this.background = this.add.image(512, 384, bgKey);

    this.createTextScene();

    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates the text scene of the main menu, which contains the title, description, and buttons to start the game.
   * The scene is created by generating HTML elements and adding them to the scene using the Phaser DOM component.
   * The buttons are attached event listeners to change the scene when clicked.
   * @returns {void} Nothing is returned from this function.
   */
  private createTextScene() {
    const { width, height } = this.scale;
    const textSceneContainer = document.createElement('div');
    textSceneContainer.id = 'text-scene-container';

    textSceneContainer.innerHTML = `
    <div class="${styles['main-text-container']}">
      <div class="${styles['main-header']}">
        <div class="${styles['main-eyebrow']}">RESUELVE EL MISTERIO</div>
        <h1 class="${styles['main-title']}">Juego de Pistas</h1>
        <p class="${styles['main-description']}">
          Pon a prueba tus habilidades de detective, descubre pistas, analiza información y resuelve el misterio.
        </p>
      </div>
      
      <ul class="${styles['main-clue-list']}">
        <li class="${styles['main-clue']}">
          <div>
            <div class="${styles['clue-icon']}">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"/>
                <circle cx="12" cy="16" r="1.5"/>
                <path d="M12 6a4 4 0 0 0-4 4h2a2 2 0 0 1 4 0c0 1-1 2-2 3h-1v2h2v-1c2-1 3-2 3-4a4 4 0 0 0-4-4z"/>
              </svg>
            </div>
            <h2>INVESTIGA</h2>
            <p>Revela pistas una a una</p>
          </div>
        </li>
        <li class="${styles['main-clue']}">
          <div>
            <div class="${styles['clue-icon']}">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"/>
                <path d="M16 8h-2v2h2zm-4 4h-2v2h2zm0 4h-2v2h2zm-4-4H6v2h2z"/>
              </svg>
            </div>
            <h2>DEDUCE</h2>
            <p>Analiza la información</p>
          </div>
        </li>
        <li class="${styles['main-clue']}">
          <div>
            <div class="${styles['clue-icon']}">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"/>
                <path d="m9.5 16.5 7-7L15 8l-7 7 1.5 1.5zM8 10h2V8H8z"/>
              </svg>
            </div>
            <h2>DESCUBRE</h2>
            <p>Desvela el concepto</p>
          </div>
        </li>
      </ul>
      
      <div class="${styles['main-footer']}">
        <div class="${styles['main-stats']}">
          <span class="${styles['stat-item']}">
            <span class="${styles['stat-icon']}">📜</span>
            ${gameData.length} casos
          </span>
          <span class="${styles['stat-item']}">
            <span class="${styles['stat-icon']}">🔍</span>
            Por descubrir
          </span>
        </div>
        
        <button id="start-game-btn" class="${styles['main-button']}">
          COMENZAR INVESTIGACIÓN
        </button>
      </div>
    </div>
  `;

    const buttonStartGame = textSceneContainer.querySelector('#start-game-btn') as HTMLButtonElement;
    buttonStartGame.addEventListener('click', () => this.changeScene());

    this.textScene = this.add
      .dom(width / 2, height / 2, textSceneContainer)
      .setOrigin(0.5, 0.5)
      .setDepth(6);
  }

  changeScene() {
    this.scene.start('Game', { reset: true });
  }
}
