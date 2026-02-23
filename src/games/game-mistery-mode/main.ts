import { AUTO, Game } from 'phaser';

import { Boot, FinishGame, Game as MainGame, MainMenu, Preloader } from './scenes';

// import { Game as MainGame } from './scenes/game';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-mistery-mode',
  dom: {
    createContainer: true
  },
  scene: [Boot, Preloader, MainMenu, MainGame, FinishGame]
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
