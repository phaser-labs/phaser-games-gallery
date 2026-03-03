import Phaser from "phaser";

import { PieceType } from "../types/types";

export function createBaseTextures(scene: Phaser.Scene, tileSize: number) {
    createGlassTexture(scene, tileSize);
    createStoneTexture(scene, tileSize);
}

function createGlassTexture(scene: Phaser.Scene, size: number) {
    if (scene.textures.exists("block_glass")) return;

    const g = scene.add.graphics().setVisible(false);

    // 🔹 Base azul hielo
    g.fillStyle(0x6fd3ff, 1);
    g.fillRect(0, 0, size, size);

    // 🔹 Brillo diagonal suave
    g.fillStyle(0xffffff, 0.15);
    g.beginPath();
    g.moveTo(0, size * 0.2);
    g.lineTo(size * 0.8, 0);
    g.lineTo(size, 0);
    g.lineTo(0, size);
    g.closePath();
    g.fillPath();

    // 🔹 Highlight pequeño
    g.fillStyle(0xffffff, 0.25);
    g.fillCircle(size * 0.3, size * 0.3, size * 0.18);

    // 🔹 BORDE EXTERNO SUTIL
    g.lineStyle(1, 0x2c7fb8, 0.5); // azul más oscuro
    g.strokeRect(0.5, 0.5, size - 1, size - 1);

    g.generateTexture("block_glass", size, size);
    g.destroy();
}

function createStoneTexture(scene: Phaser.Scene, size: number) {
    if (scene.textures.exists("block_stone")) return;

    const g = scene.add.graphics().setVisible(false);

    const baseColor = 0xbfc3cc;   // gris claro
    const darkEdge = 0x8c9099;    // borde oscuro
    const shadow = 0x7a7e87;      // sombra interna

    // -----------------------
    // Base
    // -----------------------
    g.fillStyle(baseColor, 1);
    g.fillRect(0, 0, size, size);

    // -----------------------
    // Borde externo
    // -----------------------
    g.lineStyle(1, darkEdge, 1);
    g.strokeRect(0.5, 0.5, size - 1, size - 1);

    // -----------------------
    // Sombra inferior
    // -----------------------
    g.fillStyle(shadow, 0.25);
    g.fillRect(0, size * 0.6, size, size * 0.4);

    // -----------------------
    // Parches claros tipo piedra
    // -----------------------
    g.fillStyle(0xffffff, 0.25);

    for (let i = 0; i < 3; i++) {
        const x = Phaser.Math.Between(2, size - 6);
        const y = Phaser.Math.Between(2, size - 6);
        const w = Phaser.Math.Between(3, 6);
        const h = Phaser.Math.Between(2, 4);

        g.fillRoundedRect(x, y, w, h, 2);
    }

    g.generateTexture("block_stone", size, size);
    g.destroy();
}

export function createColoredBlockTexture(scene: Phaser.Scene, size: number, color: number): string {
    const key = `block_color_${color}`;

    if (scene.textures.exists(key)) return key;

    const g = scene.add.graphics().setVisible(false);

    // base
    g.fillStyle(color, 1);
    g.fillRect(0, 0, size, size);

    // borde claro arriba/izquierda
    g.lineStyle(2, 0xffffff, 0.3);
    g.beginPath();
    g.moveTo(0, size);
    g.lineTo(0, 0);
    g.lineTo(size, 0);
    g.strokePath();

    // borde oscuro abajo/derecha
    g.lineStyle(2, 0x000000, 0.3);
    g.beginPath();
    g.moveTo(size, 0);
    g.lineTo(size, size);
    g.lineTo(0, size);
    g.strokePath();

    g.generateTexture(key, size, size);
    g.destroy();

    return key;
}

export function getColorForPiece(type: PieceType): number {
    switch (type) {
        case "I": return 0xa271ff;
        case "J": return 0x9aeb00;
        case "L": return 0xf361ff;
        case "O": return 0xebd320;
        case "S": return 0xff61b2;
        case "T": return 0x61d3e3;
        case "Z": return 0xffa200;
        default: return 0xffffff;
    }
}

export function createPenaltyBlockTexture(
    scene: Phaser.Scene,
    size: number
) {
    const key = `block_penalty`;

    if (scene.textures.exists(key)) return key;

    const g = scene.add.graphics();

    // Fondo más grueso
    g.fillStyle(0xDDDDDD, 1);
    g.fillRect(0, 0, size, size);

    // Detalle interior tipo piedra
    g.fillStyle(0x000000, 0.15);
    g.fillRect(3, 3, size - 6, size - 6);

    g.generateTexture(key, size, size);
    g.destroy();

    return key;
}
