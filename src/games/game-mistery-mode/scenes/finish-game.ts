import { Scene } from 'phaser';

import { EventBus } from '../event-bus';

import styles from '../styles/finish-game.module.css';

export class FinishGame extends Scene {
  totalPoints: number = 0;
  pointsPerCase: number[] = [];
  totalCases: number = 0;
  private container!: Phaser.GameObjects.DOMElement; // Guardar referencia

  constructor() {
    super('FinishGame');
  }

  init(data: { totalPoints: number; pointsPerCase: number[]; totalCases: number }) {
    this.totalPoints = data.totalPoints;
    this.pointsPerCase = data.pointsPerCase;
    this.totalCases = data.totalCases;
  }

  create() {
    const bgKey = this.registry.get('global-background') || 'background-1';

    this.add.image(512, 384, bgKey);
    this.showPointsSummary();
    EventBus.emit('current-scene-ready', this);
  }

  private showPointsSummary() {
    const { width, height } = this.scale;

    const container = document.createElement('div');
    container.className = styles['points-summary'];

    let casesHtml = '';
    this.pointsPerCase.forEach((points, index) => {
      casesHtml += `
        <div class="${styles['case-point']}">
          <span class="${styles['case-number']}">Caso ${index + 1}</span>
          <span class="${styles['case-points']}">${points} pts</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="${styles['summary-header']}">
        <h2>📋 INFORME FINAL</h2>
        <p>Puntuación total</p>
        <div class="${styles['total-points']}">${this.totalPoints}</div>
      </div>
      <div class="${styles['cases-list']}">
        ${casesHtml}
      </div>
      <button class="${styles['restart-button']}" id="restart-btn">Jugar de nuevo</button>
    `;

    const button = container.querySelector('#restart-btn') as HTMLButtonElement;
    button.addEventListener('click', () => this.restartGame());

    this.container = this.add.dom(width / 2, height / 2, container).setOrigin(0.5, 0.5);
  }

  private restartGame() {
    if (this.container) {
      this.container.destroy();
    }

    this.children.removeAll();

    this.totalPoints = 0;
    this.pointsPerCase = [];
    this.totalCases = 0;

    this.scene.start('MainMenu');
  }

  changeScene() {
    this.restartGame();
  }
}
