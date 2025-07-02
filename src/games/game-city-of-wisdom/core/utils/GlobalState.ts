import Phaser from 'phaser';

// variables globales
class GlobalState {
  generalMusic: boolean = false;

  static instance: GlobalState;

  // codigo viejo
  constructor() {
    if (!GlobalState.instance) {
      GlobalState.instance = this;
    }
    return GlobalState.instance;
  }
  diceValue = 0;
}

export interface playerType extends Phaser.Physics.Arcade.Sprite {
  score?: number;
}
// extends lo que hace es heredar las propiedades de Phaser.Physics.Arcade.Sprite y agregarle una propiedad score
// funcion para setear el modo de juego con la cantidad de jugadores
export const globalState = new GlobalState();
