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