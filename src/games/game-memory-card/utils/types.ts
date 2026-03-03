import Phaser from 'phaser';

export interface ICardGameObject {
    gameObject: Phaser.GameObjects.Plane;
    flip: (callbackComplete?: () => void) => void;
    destroy: () => void;
    cardName: string;
}

export interface CreateCardParams {
    scene: Phaser.Scene;
    x: number;
    y: number;
    frontTexture: string;
    cardName: string;
}

export interface IGridConfig {
  x: number;
  y: number;
  paddingX: number;
  paddingY: number;
}

/** Datos de una carta pasados como prop desde fuera del juego */
export interface ICardData {
  name: string; // clave única, ej. 'card-0'
  img: string;  // ruta al asset, ej. 'assets/game-memory-card/cards/clubs_ace.png'
}

/** Carta basada en DOM (botón accesible) */
export interface ICardDOM {
  button: HTMLButtonElement;
  cardName: string;
  isFaceUp: boolean;
  isMatched: boolean;
  flip: (callbackComplete?: () => void) => void;
  destroy: () => void;
}