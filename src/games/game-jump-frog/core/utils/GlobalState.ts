import Phaser from 'phaser';
interface DataGameFrog {
  id: number;
  question: string;
  options: {
    id: string;
    label: string;
    state: 'wrong' | 'success';
  }[];
}
// variables globales
class GlobalState {
  specificMusic: boolean = true;
  generalMusic: boolean = true;
  vidas: number = 0;
  puntos: number = 0;
  reload: boolean = false;
  static instance: GlobalState;

  // codigo viejo
  constructor() {
    if (!GlobalState.instance) {
      GlobalState.instance = this;
    }
    return GlobalState.instance;
  }
  player?: playerType;
  data: DataGameFrog[] = [];
}

export interface playerType extends Phaser.Physics.Arcade.Sprite {
  score?: number;
}
// extends lo que hace es heredar las propiedades de Phaser.Physics.Arcade.Sprite y agregarle una propiedad score
// funcion para setear el modo de juego con la cantidad de jugadores
export const globalState = new GlobalState();
