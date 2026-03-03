import Phaser from "phaser";

import { themeManager } from "../utils/theme-manager";

export function preloadTiledBackground(scene: Phaser.Scene) {
  const theme = themeManager.getCurrentTheme();

  scene.load.setPath("assets/game-tricky-tower");

  const mapKey = `bgMap-${theme.id}`;

  scene.load.tilemapTiledJSON(mapKey, theme.assets.tilemap.path);

  theme.assets.images.forEach((img) => {
    scene.load.image(img.name, img.path);
  });
}

export function createTiledBackground(scene: Phaser.Scene) {
  const theme = themeManager.getCurrentTheme();
  const mapKey = `bgMap-${theme.id}`;

  const map = scene.make.tilemap({ key: mapKey });

  // 🔥 1️⃣ Agregar TODOS los tilesets que el JSON declara
  const tilesets: Phaser.Tilemaps.Tileset[] = [];

  map.tilesets.forEach((tilesetData) => {
    const tileset = map.addTilesetImage(
      tilesetData.name,   // nombre EXACTO del JSON
      tilesetData.name    // key cargada en preload
    );

    if (tileset) tilesets.push(tileset);
  });

  // 🔥 2️⃣ Crear TODAS las capas automáticamente
  let houseLayer: Phaser.Tilemaps.TilemapLayer | undefined;

  map.layers.forEach((layerData, index) => {
    const layer = map.createLayer(
      layerData.name,
      tilesets,
      0,
      0
    );

    if (!layer) return;

    layer.setDepth(index);

    if (layerData.name === "house") {
      houseLayer = layer;
    }
  });

  if (!houseLayer) {
    throw new Error("No se encontró la capa 'house' en el tilemap.");
  }

  return { map, house: houseLayer };
}