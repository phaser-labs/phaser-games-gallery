import { Scene } from "phaser";

export function createAnimations(scene: Scene) {

    type playerKey = "player1" | "player2" | "player3" | "player4";
    const players: playerKey[] = ["player1", "player2", "player3", "player4"];

    players.forEach(player => {
        const idleKey = `${player}_idle`;
        const spellKey = `${player}_spell`;

        scene.anims.create({
            key: `${player}-idle`,
            frames: scene.anims.generateFrameNumbers(idleKey, { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });

        scene.anims.create({
            key: `${player}-spell`,
            frames: scene.anims.generateFrameNumbers(spellKey, { start: 0, end: 4 }),
            frameRate: 4,
            repeat: 0
        });

    });
}