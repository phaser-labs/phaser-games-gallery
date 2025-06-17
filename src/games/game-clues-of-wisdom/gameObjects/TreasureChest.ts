/* eslint-disable @typescript-eslint/no-explicit-any */
// src/game/gameObjects/TreasureChest.ts
import Phaser from 'phaser';

import { WordData } from '../utils/types'; // Necesitarás esta interfaz

import { Player } from './Player'; // Ajusta la ruta

// Evento para cuando se abre un cofre y se obtiene una palabra
export const WORD_FOUND_EVENT = 'wordFound';

export class TreasureChest extends Phaser.Physics.Arcade.Sprite {
    public containedWord: WordData; // La palabra que contiene
    private isOpen: boolean = false;
    private canBeOpened: boolean = false;
     openSoundKey: string = 'chest_open_sound'; // Carga este sonido

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        textureKey: string, // 'atlas'
        wordData: WordData
    ) {
        super(scene, x, y, textureKey, 'chest/chest-1'); // Inicia con el frame de cofre cerrado

        this.containedWord = wordData;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        const arcadeBody = this.body as Phaser.Physics.Arcade.Body;
        if (arcadeBody) {
            arcadeBody.setAllowGravity(true);
            arcadeBody.setImmovable(true);
            arcadeBody.setSize(this.width * 0.9, this.height * 0.9); // Ajusta
            arcadeBody.setOffset(this.width * 0.05, this.height * 0.1);
        }

        this.anims.play('chest_closed', true);
        this.setOrigin(0.5, 1); // Asume que la Y de Tiled es la base
        this.setData('clueId', wordData.text); // Guardar la palabra como ID para referencia
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);
        if (this.isOpen || !this.active) return;

        const player = (this.scene as any).player as Player;
        if (player && player.active) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            // Ajusta la distancia de interacción
            this.canBeOpened = distance < (this.width + player.width) / 2 * 0.7;
            // Aquí podrías emitir un evento para mostrar/ocultar un prompt de interacción en la UIScene
            // if (this.canBeOpened) this.scene.events.emit('showInteractionPrompt', this.x, this.y - this.height, 'E');
            // else this.scene.events.emit('hideInteractionPrompt');
        } else {
            this.canBeOpened = false;
        }
    }

    public attemptOpen(): boolean {
        if (this.isOpen || !this.canBeOpened || !this.active) {
            return false;
        }

        this.isOpen = true;
        this.anims.play('chest_open', true); // Cambia directamente al frame de abierto
                                            // Si tuvieras 'chest_opening', la reproducirías y luego 'chest_open' en onComplete
        // this.scene.sound.play(this.openSoundKey);

        this.scene.events.emit(WORD_FOUND_EVENT, this.containedWord, this);
        console.log(`Cofre abierto! Palabra encontrada: ${this.containedWord.text}`);

        // Podrías hacer que el cuerpo físico se deshabilite para que el jugador pueda pasar
        // (this.body as Phaser.Physics.Arcade.Body).enable = false;
        return true;
    }
}