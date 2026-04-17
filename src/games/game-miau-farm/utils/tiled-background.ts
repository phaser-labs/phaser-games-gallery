// utils/tiled-background.ts
import Phaser from "phaser";

import { FarmBackground, TiledCacheEntry, TiledLayer } from "../types/types";

const TILESET_MAP: Record<string, string> = {
  "Grass": "background/tilesets/Grass.png",
  "Hills": "background/tilesets/Hills.png",
  "Water": "background/tilesets/Water.png",
  "Wooden_House_Walls_Tilset": "background/tilesets/Wooden_House_Walls_Tilset.png",
  "Wooden House": "background/tilesets/Wooden House.png",
  "Basic Furniture": "background/objects/Basic Furniture.png",
  "Basic Grass Biom things 1": "background/objects/Basic Grass Biom things 1.png",
  "Wood Bridge": "background/objects/Wood Bridge.png",
  "Tilled Dirt": "background/tilesets/Tilled Dirt.png",
  "Paths": "background/objects/Paths.png",
  "Fences": "background/tilesets/Fences.png",
};

const FARM_PLOT_LAYER = "farmPlot";
const MAP_KEY = "bgMap-farm";

function findTiledLayer(layers: TiledLayer[], name: string): TiledLayer | null {
  for (const layer of layers) {
    if (layer.type === "tilelayer" && layer.name === name) return layer;
    if (layer.type === "group" && layer.layers) {
      const found = findTiledLayer(layer.layers, name);
      if (found) return found;
    }
  }
  return null;
}

function findAllTiledLayers(layers: TiledLayer[], name: string): TiledLayer[] {
  const result: TiledLayer[] = [];
  for (const layer of layers) {
    if (layer.type === "tilelayer" && layer.name === name) result.push(layer);
    if (layer.type === "group" && layer.layers) {
      result.push(...findAllTiledLayers(layer.layers, name));
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRELOAD
// ─────────────────────────────────────────────────────────────────────────────
export function preloadFarmBackground(scene: Phaser.Scene): void {
  scene.load.setPath("assets/game-kitty-farmer");
  scene.load.tilemapTiledJSON(MAP_KEY, "background/background.json");

  Object.entries(TILESET_MAP).forEach(([name, path]) => {
    scene.load.image(name, path);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────
export function createFarmBackground(scene: Phaser.Scene): FarmBackground {
  const map = scene.make.tilemap({ key: MAP_KEY });

  const tilesets: Phaser.Tilemaps.Tileset[] = [];

  map.tilesets.forEach((tilesetData) => {
    if (!TILESET_MAP[tilesetData.name]) {
      console.warn(`[FarmBG] Tileset no mapeado: "${tilesetData.name}"`);
      return;
    }
    const tileset = map.addTilesetImage(tilesetData.name, tilesetData.name);
    if (tileset) {
      tilesets.push(tileset);
    } else {
      console.error(`[FarmBG] No se pudo agregar: "${tilesetData.name}"`);
    }
  });

  const layers: Record<string, Phaser.Tilemaps.TilemapLayer> = {};

  map.layers.forEach((layerData, index) => {
    const layer = map.createLayer(layerData.name, tilesets, 0, 0);
    if (!layer) return;
    layer.setDepth(index);
    layers[layerData.name] = layer;
  });

  const farmPlot = layers[FARM_PLOT_LAYER];
  if (!farmPlot) {
    throw new Error(`[FarmBG] Capa "${FARM_PLOT_LAYER}" no encontrada.`);
  }

  return { map, layers, farmPlot };
}

// ─────────────────────────────────────────────────────────────────────────────
// WALKABLE SET — todos los tiles donde se puede caminar
// ─────────────────────────────────────────────────────────────────────────────
export function buildWalkableSet(scene: Phaser.Scene): Set<string> {
  const cached = scene.cache.tilemap.get(MAP_KEY) as TiledCacheEntry;
  const { layers, width } = cached.data;

  const walkable = new Set<string>();
  const key = (i: number): string => `${i % width}_${Math.floor(i / width)}`;

  const addLayer = (layer: TiledLayer): void => {
    layer.data?.forEach((gid, i) => {
      if (gid > 0) walkable.add(key(i));
    });
  };

  // Exterior walkable
  for (const name of ['grass', 'paths', 'hills', 'farmPlot']) {
    const layer = findTiledLayer(layers, name);
    if (layer) addLayer(layer);
  }
  for (const layer of findAllTiledLayers(layers, 'bridge')) {
    addLayer(layer);
  }

  // Interior de la casa — floor y carpet son pisables
  for (const name of ['floor', 'carpet']) {
    const layer = findTiledLayer(layers, name);
    if (layer) addLayer(layer);
  }

  const collisionLayer = findTiledLayer(layers, 'collision');
  collisionLayer?.data?.forEach((gid, i) => {
    if (gid > 0) walkable.delete(key(i));
  });

  console.log(`[FarmBG] Walkable tiles: ${walkable.size}`);
  return walkable;
}

// ─────────────────────────────────────────────────────────────────────────────
// BRIDGE SET — solo los tiles de bridge que no estén bloqueados por collision
// Usado para limitar el movimiento de los NPCs exclusivamente al bridge
// ─────────────────────────────────────────────────────────────────────────────
export function buildBridgeSet(scene: Phaser.Scene): Set<string> {
  const cached = scene.cache.tilemap.get(MAP_KEY) as TiledCacheEntry;
  const { layers, width } = cached.data;

  const bridge = new Set<string>();
  const key = (i: number): string => `${i % width}_${Math.floor(i / width)}`;

  for (const layer of findAllTiledLayers(layers, 'bridge')) {
    layer.data?.forEach((gid, i) => {
      if (gid > 0) bridge.add(key(i));
    });
  }

  // Respetar collision — quitar los que estén bloqueados
  const collisionLayer = findTiledLayer(layers, 'collision');
  collisionLayer?.data?.forEach((gid, i) => {
    if (gid > 0) bridge.delete(key(i));
  });

  console.log(`[FarmBG] Bridge tiles: ${bridge.size}`);
  return bridge;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPTH
// ─────────────────────────────────────────────────────────────────────────────
export function setAboveLayers(
  layers: Record<string, Phaser.Tilemaps.TilemapLayer>,
  playerDepth: number,
  aboveLayerNames: string[]
): void {
  aboveLayerNames.forEach(name => {
    if (layers[name]) layers[name].setDepth(playerDepth + 1);
  });
}