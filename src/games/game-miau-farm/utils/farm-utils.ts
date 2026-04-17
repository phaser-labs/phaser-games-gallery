import Phaser from 'phaser';

import { announce } from './announce';
import { AudioManager } from './audio-manager';
import { ASSETS } from './game-assets';
import { getAdjacentPosition, movePlayerTo, playWaterAnimation } from './player-utils';
import { showFloatingMessageUI } from './show-floating-message';
import { SidePanelUI } from './side-panel';

export interface FarmContext {
  scene: Phaser.Scene;
  player: Phaser.Physics.Arcade.Sprite;
  sidePanel: SidePanelUI;
  audioManager: AudioManager;
  zoom: number;
  tileSize: number;
  onHarvest: (type: 'corn' | 'tomato') => void;
  setActing: (v: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLE FARM PLOT — plantar semilla
// ─────────────────────────────────────────────────────────────────────────────
export function handleFarmPlot(
  ctx: FarmContext,
  tile: Phaser.Tilemaps.Tile,
  worldX: number,
  worldY: number
): boolean {
  const { scene, sidePanel, audioManager, zoom } = ctx;

  const seed = sidePanel.getSelectedSeed();

  if (!seed) {
    sidePanel.open();
    return false;
  }

  if (sidePanel.getSeedCount(seed) <= 0) {
    announce('No hay semillas disponibles.');
    showFloatingMessageUI(scene, 'No hay semillas disponibles.', zoom);
    sidePanel.clearSelection();
    return false;
  }

  const key = `${tile.x}_${tile.y}`;
  if (scene.registry.get(key)) return false;

  const consumed = sidePanel.consumeSeed(seed);
  if (!consumed) return false;

  const plant = scene.add
    .sprite(worldX, worldY, 'plants')
    .setDepth(13 - 1);

  plant.play(`plant-grow-${seed}`);

  const label = seed === 'corn' ? 'Maíz' : 'Tomate';
  announce(`Semilla de ${label} plantada`);

  plant.setScale(0);
  scene.tweens.add({
    targets: plant,
    scale: 1,
    duration: 200,
  });

  scene.registry.set(key, plant);
  plant.setData('type', seed);
  plant.setData('watered', false);

  // 🌱 barra de crecimiento
  const BAR_WIDTH = 16;
  const BAR_HEIGHT = 2;
  const DURATION = 15000;

  const barBg = scene.add
    .rectangle(worldX - BAR_WIDTH / 2, worldY - 10, BAR_WIDTH, BAR_HEIGHT, 0x000000, 0.5)
    .setDepth(1000)
    .setOrigin(0, 0.5);

  const barFill = scene.add
    .rectangle(worldX - BAR_WIDTH / 2, worldY - 10, 0, BAR_HEIGHT, 0x00ff88)
    .setDepth(1001)
    .setOrigin(0, 0.5);

  // 🔥 bloquear riego hasta que termine
  plant.setData('growing', true);

  scene.tweens.add({
    targets: barFill,
    width: BAR_WIDTH,
    duration: DURATION,
    ease: 'Linear',
    onUpdate: () => {
      if (!plant.active) {
        barBg.destroy();
        barFill.destroy();
      }
    },
    onComplete: () => {
      plant.setData('growing', false); // ✅ ahora se puede regar
      barBg.destroy();
      barFill.destroy();
    },
  });

  audioManager.playSFX(ASSETS.plant.key);

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// WATER PLANT — regar planta (lógica interna)
// ─────────────────────────────────────────────────────────────────────────────
export function waterPlant(
  ctx: FarmContext,
  worldX: number,
  worldY: number,
  plant: Phaser.GameObjects.Sprite
): void {
  const { scene, player, audioManager, zoom, setActing } = ctx;

  plant.setData('watered', true);

  audioManager.playSFX(ASSETS.watering.key);

  playWaterAnimation(player, worldX, worldY, setActing);

  scene.time.delayedCall(300, () => {
    plant.clearTint();
  });

  announce('Regando...');
  showFloatingMessageUI(scene, '💧 Regando...', zoom);

  const type = plant.getData('type');
  plant.play(`plant-${type}`);
  plant.setTint(0x66ccff);
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLE WATER PLANT — caminar si está lejos, luego regar
// ─────────────────────────────────────────────────────────────────────────────
export function handleWaterPlant(
  ctx: FarmContext,
  worldX: number,
  worldY: number,
  plant: Phaser.GameObjects.Sprite
): void {
  const { scene, player, tileSize, setActing, zoom } = ctx;

  if (!plant?.getData) return;

  if (plant.getData('watered')) {
    announce('Esta planta ya fue regada');
    showFloatingMessageUI(scene, '💧 Ya está regada', zoom);
    return;
  }

  const dist = Phaser.Math.Distance.Between(player.x, player.y, worldX, worldY);

  if (dist > tileSize) {
    const pos = getAdjacentPosition(player.x, player.y, worldX, worldY, tileSize);
    movePlayerTo(scene, player, pos.x, pos.y, setActing, () => {
      waterPlant(ctx, worldX, worldY, plant);
    });
    return;
  }

  waterPlant(ctx, worldX, worldY, plant);
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLE HARVEST — cosechar planta
// ─────────────────────────────────────────────────────────────────────────────
export function handleHarvest(
  ctx: FarmContext,
  tile: Phaser.Tilemaps.Tile,
  plant: Phaser.GameObjects.Sprite
): void {
  const { scene, sidePanel, audioManager, zoom, onHarvest } = ctx;

  const type = plant.getData('type') as 'corn' | 'tomato';

  audioManager.playSFX(ASSETS.collect_item.key);

  scene.tweens.add({
    targets: plant,
    scale: 0,
    duration: 200,
    onComplete: () => {
      plant.destroy();
    },
  });

  const key = `${tile.x}_${tile.y}`;
  scene.registry.remove(key);

  sidePanel.addCrop(type);

  const label = type === 'corn' ? '🌽 Maíz' : '🍅 Tomate';
  announce(`+1 ${label} cosechado.`);
  showFloatingMessageUI(scene, `+1 ${label}`, zoom);

  onHarvest(type);
}