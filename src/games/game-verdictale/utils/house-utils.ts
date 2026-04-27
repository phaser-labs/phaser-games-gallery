export function showFloatingMessage(scene: Phaser.Scene, text: string) {
    const msg = scene.add.text(
        scene.scale.width / 2,
        80,
        text,
        {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 4 },
        }
    )
        .setOrigin(0.5)
        .setDepth(200)
        .setScrollFactor(0);

    scene.tweens.add({
        targets: msg,
        y: msg.y - 20,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => msg.destroy()
    });
}