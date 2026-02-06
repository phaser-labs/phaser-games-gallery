import { AUTO, Game } from 'phaser';

import { Boot, Game as MainGame, GameOver, Instructions, MainMenu, Preloader } from './scenes';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#028af8',
  dom: {
    createContainer: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [Boot, Preloader, MainMenu, Instructions, MainGame, GameOver]
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
