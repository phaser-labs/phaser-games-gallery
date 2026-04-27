import Phaser from 'phaser';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface GameBackground {
  map: Phaser.Tilemaps.Tilemap;
  layers: Record<string, Phaser.Tilemaps.TilemapLayer>;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const BASE_PATH = 'assets/game-verdictale/background';
const MAP_KEY = 'bg-verdictale';

const TILESETS: Record<string, string> = {
  TilesetElement:         'tilesets/TilesetElement.png',
  TilesetFloor:           'tilesets/TilesetFloor.png',
  TilesetFloorDetail:     'tilesets/TilesetFloorDetail.png',
  TilesetHouse:           'tilesets/TilesetHouse.png',
  TilesetInteriorFloor:   'tilesets/TilesetInteriorFloor.png',
  TilesetNature:          'tilesets/TilesetNature.png',
  TilesetVillageAbandoned:'tilesets/TilesetVillageAbandoned.png',
  TilesetWater:           'tilesets/TilesetWater.png',
};

// Capas que bloquean el paso
const COLLISION_LAYERS = [
  'barrera','barrera2',
  'house1', 'house2', 'house3', 'house4',
  'house5', 'house6', 'house7',
  'house-util',
  'features',
  // 🌳 árboles
  'trees-2', 'trees-1', 'trees0', 'trees1',
  'trees2', 'trees3', 'trees4', 'trees5', 'trees6',
];

// Capas caminables
const WALKABLE_LAYERS = ['ground', 'floor', 'puertas'];

// ─────────────────────────────────────────────────────────────────────────────
// PRELOAD
// ─────────────────────────────────────────────────────────────────────────────

export function preloadBackground(scene: Phaser.Scene): void {
  scene.load.setPath(BASE_PATH);
  scene.load.tilemapTiledJSON(MAP_KEY, 'background.json');

  Object.entries(TILESETS).forEach(([name, path]) => {
    scene.load.image(name, path);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────

export function createBackground(scene: Phaser.Scene): GameBackground {
  const map = scene.make.tilemap({ key: MAP_KEY });

  // Agregar tilesets
  const tilesets: Phaser.Tilemaps.Tileset[] = [];

  map.tilesets.forEach(tilesetData => {
    if (!TILESETS[tilesetData.name]) {
      console.warn(`[BG] Tileset no mapeado: "${tilesetData.name}"`);
      return;
    }

    const tileset = map.addTilesetImage(tilesetData.name, tilesetData.name);
    if (tileset) {
      tilesets.push(tileset);
    } else {
      console.error(`[BG] No se pudo agregar: "${tilesetData.name}"`);
    }
  });

  // Crear capas
  const layers: Record<string, Phaser.Tilemaps.TilemapLayer> = {};

  map.layers.forEach((layerData, index) => {
    const layer = map.createLayer(layerData.name, tilesets, 0, 0);
    if (!layer) return;
    layer.setDepth(index);
    layers[layerData.name] = layer;
  });

  return { map, layers };
}

// ─────────────────────────────────────────────────────────────────────────────
// WALKABLE SET
// ─────────────────────────────────────────────────────────────────────────────

export function buildWalkableSet(
  layers: Record<string, Phaser.Tilemaps.TilemapLayer>
): Set<string> {
  const walkable = new Set<string>();
  const key = (x: number, y: number): string => `${x}_${y}`;

  // Agregar tiles caminables
  WALKABLE_LAYERS.forEach(name => {
    const layer = layers[name];
    if (!layer) return;

    layer.forEachTile(tile => {
      if (tile.index > 0) walkable.add(key(tile.x, tile.y));
    });
  });

  // Quitar tiles de colisión
  COLLISION_LAYERS.forEach(name => {
    const layer = layers[name];
    if (!layer) return;

    layer.forEachTile(tile => {
      if (tile.index > 0) walkable.delete(key(tile.x, tile.y));
    });
  });

  console.log(`[BG] Walkable tiles: ${walkable.size}`);
  return walkable;
}

// ─────────────────────────────────────────────────────────────────────────────
// WATER ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

export function animateWater(
  scene: Phaser.Scene,
  layers: Record<string, Phaser.Tilemaps.TilemapLayer>
): void {
  const waterLayer = layers['water'];
  if (!waterLayer) return;

  scene.tweens.add({
    targets: waterLayer,
    alpha: { from: 0.85, to: 1 },
    duration: 1200,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DOOR ZONES — zonas interactivas de puertas
// ─────────────────────────────────────────────────────────────────────────────

export interface DoorZone {
  x: number;
  y: number;
  tileX: number;
  tileY: number;
}

export function getDoorZones(
  layers: Record<string, Phaser.Tilemaps.TilemapLayer>,
  tileSize: number
): DoorZone[] {
  const doors: DoorZone[] = [];
  const layer = layers['puertas'];
  if (!layer) return doors;

  layer.forEachTile(tile => {
    if (tile.index > 0) {
      doors.push({
        x: tile.pixelX + tileSize / 2,
        y: tile.pixelY + tileSize / 2,
        tileX: tile.x,
        tileY: tile.y,
      });
    }
  });

  return doors;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOUSE ENTRANCES
// ─────────────────────────────────────────────────────────────────────────────

export interface HouseEntrance {
  houseKey: string;        // nombre de la capa
  interiorKey: string;     // key del mapa interior
  x: number;               // world x de entrada
  y: number;               // world y de entrada
  width: number;           // ancho de la zona de entrada
  tileSize: number;
}

export const HOUSE_ENTRANCES: HouseEntrance[] = [
  { houseKey: 'house1', interiorKey: 'interior-1', x: 568, y: 408, width: 64, tileSize: 16 },
  { houseKey: 'house2', interiorKey: 'interior-2', x: 552, y: 568, width: 64, tileSize: 16 },
  { houseKey: 'house3', interiorKey: 'interior-3', x: 616, y: 568, width: 64, tileSize: 16 },
  { houseKey: 'house4', interiorKey: 'interior-4', x: 680, y: 568, width: 64, tileSize: 16 },
  { houseKey: 'house5', interiorKey: 'interior-5', x: 744, y: 648, width: 48, tileSize: 16 },
  { houseKey: 'house6', interiorKey: 'interior-6', x: 552, y: 648, width: 48, tileSize: 16 },
  { houseKey: 'house7', interiorKey: 'interior-7', x: 984, y: 408, width: 64, tileSize: 16 },
];