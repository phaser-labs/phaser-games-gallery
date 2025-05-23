export class PreloaderScene extends Phaser.Scene
{
    constructor()
    {
        super({
            key: 'Preloader'
        });
    }

    preload ()
    {
    this.load.image("volume-icon", "assets/game-memory-card/ui/volume-icon.png");
        this.load.image("volume-icon_off", "assets/game-memory-card/ui/volume-icon_off.png");
        this.load.image("background", "assets/game-memory-card/background.png");
        this.load.image("background-init", "assets/game-memory-card/bg-init.png");

        this.load.audio("theme-song", "assets/game-memory-card/audio/Mechanical.mp3");
        this.load.audio("whoosh", "assets/game-memory-card/audio/whoosh.mp3");
        this.load.audio("card-flip", "assets/game-memory-card/audio/card-flip.wav");
        this.load.audio("card-match", "assets/game-memory-card/audio/Confirm.wav");
        this.load.audio("card-mismatch", "assets/game-memory-card/audio/error.wav");
        this.load.audio("card-slide", "assets/game-memory-card/audio/card-place-4.ogg");
        this.load.audio("victory", "assets/game-memory-card/audio/level-complete.wav");


        this.load.image("card-back", "assets/game-memory-card/cards/card-back.png");
        this.load.image("card-0", "assets/game-memory-card/cards/card-0.png");
        this.load.image("card-1", "assets/game-memory-card/cards/card-1.png");
        this.load.image("card-2", "assets/game-memory-card/cards/card-2.png");
        this.load.image("card-3", "assets/game-memory-card/cards/card-3.png");
        this.load.image("card-4", "assets/game-memory-card/cards/card-4.png");
        this.load.image("card-5", "assets/game-memory-card/cards/card-5.png");

        this.load.image("heart", "assets/game-memory-card/ui/heart.png");

    }

    create ()
    {
        this.scene.start("Play");
    }
}