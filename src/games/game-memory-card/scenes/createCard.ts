import Phaser from 'phaser';

import { CreateCardParams, ICardGameObject } from '../utils/types';



export const createCard = ({
    scene,
    x,
    y,
    frontTexture,
    cardName
}: CreateCardParams): ICardGameObject => {

    let isFlipping = false;
  
    const tweenRotation = { y: 0 }; // Grados, de 0 a 180

    const backTexture = "card-back";

    const card: Phaser.GameObjects.Plane = scene.add.plane(x, y, backTexture)
        .setName(cardName)
        .setInteractive()
        .setScale(1.5);

    // Iniciar boca abajo (rotada 180 grados en Y)
    card.modelRotation = new Phaser.Math.Vector3(0, Phaser.Math.DegToRad(180), 0);
    let isFaceUp = false; // Para saber el estado actual

    const flipCard = (callbackComplete?: () => void): void => {
        if (isFlipping) {
            return;
        }

        isFlipping = true;
        scene.sound.play("card-flip", { volume: 1.2 }); 

        const targetRotationY = isFaceUp ? 180 : 0; 

        scene.add.tween({
            targets: [tweenRotation],
            y: targetRotationY, 
            ease: 'Expo.Out',
            duration: 500,
            onStart: () => {
                scene.tweens.chain({
                    targets: card,
                    ease: 'Expo.InOut',
                    tweens: [
                        { duration: 200, scaleX: 1.1, scaleY: 1.1 },
                        { duration: 300, scaleX: 1, scaleY: 1 },
                    ]
                });
            },
            onUpdate: () => {
                card.modelRotation = new Phaser.Math.Vector3(0, Phaser.Math.DegToRad(tweenRotation.y), 0);

                const currentAngleDeg = tweenRotation.y;

                if (currentAngleDeg > 90) { // Si está más allá de los 90 grados, debería mostrar la textura trasera
                    if (card.texture.key !== backTexture) {
                        card.setTexture(backTexture);
                    }
                } else { // Si está antes de los 90 grados, debería mostrar la textura frontal
                    if (card.texture.key !== frontTexture) {
                        card.setTexture(frontTexture);
                    }
                }
            },
            onComplete: () => {
                isFlipping = false;
                isFaceUp = !isFaceUp;

                // Asegurar que la textura final sea la correcta
                if (isFaceUp) {
                    card.setTexture(frontTexture);
                    card.modelRotation = new Phaser.Math.Vector3(0, Phaser.Math.DegToRad(0), 0); // Normalizar a 0 grados si está boca arriba
                } else {
                    card.setTexture(backTexture);
                    card.modelRotation = new Phaser.Math.Vector3(0, Phaser.Math.DegToRad(180), 0); // Normalizar a 180 grados si está boca abajo
                }
                tweenRotation.y = targetRotationY; // Sincronizar valor del tween

                if (callbackComplete) {
                    callbackComplete();
                }
            }
        });
    };

    const destroyCard = (): void => {
        scene.add.tween({
            targets: [card],
            y: card.y - 1000,
            ease: 'Elastic.In',
            duration: 500,
            onComplete: () => {
                card.destroy();
            }
        });
    };



    return {
        gameObject: card,
        flip: flipCard,
        destroy: destroyCard,
        cardName
    };
};