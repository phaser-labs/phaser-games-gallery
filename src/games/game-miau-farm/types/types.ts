import { SidePanelUI } from "../utils";
import { AudioManager } from "../utils/audio-manager";

export interface Advice {
  id: string;
  audio?: Audio;
  title: string;
  description: string;
  img?: Image;
}

export interface Image {
  src: string;
  alt: string;
  title?: string;
  width?: number;
}

export interface Audio {
  audioContent?: string;
  audioAlly?: string;
}

export interface GameResult {
  advice: {
    id: string;
    title: string;
    description: string;
  };
}

export type EndGameStats = {
  chestsOpened: number;
  totalChests: number;
  harvested: {
    corn: number;
    tomato: number;
  };
};
 


// ─────────────────────────────────────────────────────────────────────────────
// Tipos para el JSON de Tiled
// ─────────────────────────────────────────────────────────────────────────────


// Una parcela leída del Object Layer "zones" de Tiled
export interface FarmBackground {
  map: Phaser.Tilemaps.Tilemap;
  layers: Record<string, Phaser.Tilemaps.TilemapLayer>;
  farmPlot: Phaser.Tilemaps.TilemapLayer;
}

export interface TiledProperty {
  name: string;
  type: string;
  value: boolean | number | string;
}

export interface TiledTile {
  id: number;
  properties?: TiledProperty[];
}

export interface TiledTileset {
  name: string;
  firstgid: number;
  tiles?: TiledTile[];
}

export interface TiledLayer {
  name: string;
  type: "tilelayer" | "group" | "objectgroup" | "imagelayer";
  data?: number[];
  layers?: TiledLayer[];
}

export interface TiledCacheEntry {
  data: {
    layers: TiledLayer[];
    tilesets: TiledTileset[];
    width: number;
  };
}

export interface FarmContext {
  scene: Phaser.Scene;
  player: Phaser.Physics.Arcade.Sprite;
  sidePanel: SidePanelUI;
  audioManager: AudioManager;
  zoom: number;
  tileSize: number;
  onHarvest: (type: 'corn' | 'tomato') => void; // para harvested
  setActing: (v: boolean) => void;
}