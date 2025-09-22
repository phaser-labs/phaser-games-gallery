// variables globales
import { GlobalOptions, Questions } from '../../../../types/AppTypes';

class GlobalState {
  private _globalOptions: GlobalOptions[] = [];
  private _questions: Questions[] = [];
  private _choose: number = 0;
  private _generalMusic: boolean = false;
  private _score: number = 0;
  static instance: GlobalState;

  constructor() {
    if (!GlobalState.instance) {
      GlobalState.instance = this;
    }

    return GlobalState.instance;
  }
  get globalOptions(): GlobalOptions[] {
    return this._globalOptions;
  }

  set globalOptions(value: GlobalOptions[]) {
    this._globalOptions = value;
  }

  get questions(): Questions[] {
    return this._questions;
  }

  set questions(value: Questions[]) {
    this._questions = value;
  }
  get choose(): number {
    return this._choose;
  }
  set choose(value: number) {
    this._choose = value;
    document.dispatchEvent(new CustomEvent('chooseChanged', { detail: value }));
  }

  get generalMusic(): boolean {
    return this._generalMusic;
  }
  set generalMusic(value: boolean) {
    this._generalMusic = value;
  }
  get score(): number {
    return this._score;
  }
  set score(value: number) {
    this._score = value;
  }
}

// extends lo que hace es heredar las propiedades de Phaser.Physics.Arcade.Sprite y agregarle una propiedad score
// funcion para setear el modo de juego con la cantidad de jugadores
export const globalState = new GlobalState();
