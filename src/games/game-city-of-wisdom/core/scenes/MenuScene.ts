// import '../../frogJumping.css';
export class Menu extends Phaser.Scene {
  constructor() {
    super('menuScene');
  }
  preload() {
    this.load.image('loadingBg', 'assets/images/logo_load.png');
  }

  create() {
    // Mostrar imagen de fondo mientras se cargan los demás recursos
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingImage = this.add.image(width / 2, height / 2, 'loadingBg');
    loadingImage.setOrigin(0.5);
    loadingImage.setScale(0.8); // ajusta si lo necesitas

    const progressBar = this.add.graphics();
    const loadingText = this.add
      .text(width / 2, height / 2 + 100, 'Cargando...', {
        fontSize: '24px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 140, 300 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      loadingText.destroy();
      loadingImage.destroy();

      // Cambia de escena o inicia el juego
      this.scene.start('InstructionsScene');
    });
    this.load.image('logo', 'assets/images/logo.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/maps/worldIsometric.json');
    this.load.image('dry grass ground', 'assets/images/dry grass ground.png');
    this.load.image('grassy ground', 'assets/images/grassy ground.png');
    this.load.image('road00', 'assets/images/road 00.png');
    this.load.image('road01a', 'assets/images/road 01 a.png');
    this.load.image('fallGround', 'assets/images/fall ground.png');
    this.load.image('road02a', 'assets/images/road 02 a.png');
    this.load.image('road02c', 'assets/images/road 02 c.png');
    this.load.image('palm tree', 'assets/images/palm tree.png');
    this.load.image('tree 01', 'assets/images/tree 01.png');
    this.load.image('tree 02', 'assets/images/tree 02.png');
    this.load.image('treeC', 'assets/images/treeC.png');
    // props
    this.load.image('lightPoleA', 'assets/images/lightPoleA.png');
    this.load.image('trashBag', 'assets/images/trashBag.png');
    this.load.image('mailBoxBlackB', 'assets/images/mailBoxBlackB.png');
    this.load.image('signStopB', 'assets/images/signStopB.png');
    this.load.image('trafficLightA', 'assets/images/trafficLightA.png');
    this.load.image('senalVenta', 'assets/images/senalVenta.png');
    // cars
    this.load.image('pickUp01b', 'assets/images/pickup 01b.png');
    this.load.image('pickup 01a', 'assets/images/pickup 01a.png');
    this.load.image('prueba', 'assets/images/pickup 01a.png');
    this.load.image('pickup02a', 'assets/images/pickup 02a.png');
    this.load.image('pickup 02b', 'assets/images/pickup 02b.png');
    this.load.image('suv01c', 'assets/images/suv 01c.png');
    this.load.image('vehicle01d', 'assets/images/vehicle 01 d.png');
    this.load.image('vehicle 04c', 'assets/images/vehicle 04c.png');
    this.load.image('autoBlueA', 'assets/images/autoBlueA.png');
    this.load.image('autoRedC', 'assets/images/autoRedC.png');
    this.load.image('vehicle 04a', 'assets/images/vehicle 04a.png');
    this.load.image('vehicle 03c', 'assets/images/vehicle 03c.png');
    this.load.image('pickup 03c', 'assets/images/pickup 03c.png');
    this.load.image('suv 01d', 'assets/images/suv 01d.png');
    this.load.image('suv 02d', 'assets/images/suv 02d.png');
    this.load.image('suv 05d', 'assets/images/suv 05d.png');
    // buildings
    this.load.image('convenience store 01b', 'assets/images/convenience store 01b.png');
    this.load.image('churchB', 'assets/images/churchB.png');
    this.load.image('fireStationA', 'assets/images/fireStationA.png');
    this.load.image('gasStationA', 'assets/images/gasStationA.png');
    this.load.image('schoolA', 'assets/images/schoolA.png');
    this.load.image('cafeB', 'assets/images/cafeB.png');
    this.load.image('autoShopA', 'assets/images/autoShopA.png');
    this.load.image('mailBoxBlackB', 'assets/images/mailBoxBlackB.png');
    this.load.image('policeStationB', 'assets/images/policeStationB.png');
    this.load.image('houseSmallBlueA', 'assets/images/houseSmallBlueA.png');
    this.load.image('shopSmallBrownA', 'assets/images/shopSmallBrownA.png');
    this.load.image('museum', 'assets/images/museum.png');
    this.load.image('lake', 'assets/images/lake.png');
    this.load.image('libreriaGrande-removebg-preview', 'assets/images/libreriaGrande-removebg-preview.png');

    // player
    this.load.spritesheet('playerWalk-E', 'assets/images/walk-E.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    this.load.spritesheet('playerWalk-N', 'assets/images/walk-N.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    this.load.spritesheet('playerWalk-NE', 'assets/images/walk-NE.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    this.load.spritesheet('playerWalk-S', 'assets/images/walk-S.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    this.load.spritesheet('playerWalk-SE', 'assets/images/walk-SE.png', {
      frameWidth: 128,
      frameHeight: 128
    });

    // npcs de personas y animales
    this.load.spritesheet('cowboy', 'assets/images/cowboy.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    this.load.spritesheet('junko', 'assets/images/junko.png', {
      frameWidth: 100,
      frameHeight: 105
    });
    this.load.spritesheet('male', 'assets/images/male.png', {
      frameWidth: 65,
      frameHeight: 128
    });
    this.load.spritesheet('cat', 'assets/images/cat.png', {
      frameWidth: 62,
      frameHeight: 60
    });
    this.load.spritesheet('dog', 'assets/images/dog.png', {
      frameWidth: 62,
      frameHeight: 60
    });
    this.load.spritesheet('deer', 'assets/images/deer.png', {
      frameWidth: 80,
      frameHeight: 80
    });
    this.load.spritesheet('horse', 'assets/images/horse.png', {
      frameWidth: 100,
      frameHeight: 100
    });

    this.load.spritesheet('bunny', 'assets/images/bunny.png', {
      frameWidth: 50,
      frameHeight: 108
    });
    this.load.spritesheet('lady', 'assets/images/lady.png', {
      frameWidth: 104,
      frameHeight: 103
    });
    this.load.spritesheet('orco', 'assets/images/orco.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('police', 'assets/images/police.png', {
      frameWidth: 50,
      frameHeight: 86
    });
    this.load.spritesheet('estudiante', 'assets/images/estudiante.png', {
      frameWidth: 57.1,
      frameHeight: 79
    });
    this.load.spritesheet('estudianteNiña', 'assets/images/estudianteNiña.png', {
      frameWidth: 66,
      frameHeight: 109
    });
    this.load.spritesheet('bombero', 'assets/images/bombero.png', {
      frameWidth: 72.5,
      frameHeight: 114.6
    });
    this.load.spritesheet('jesus', 'assets/images/jesus.png', {
      frameWidth: 66.6,
      frameHeight: 112.5
    });
    this.load.spritesheet('gasolinero', 'assets/images/trabajadorGasolina.png', {
      frameWidth: 50,
      frameHeight: 92
    });
    this.load.html('slider', 'slider/slider.html');
    // videos de  fondo
    this.load.video('carworkshop', 'assets/videos/carworkshop.mp4');
    this.load.video('booksStore', 'assets/videos/booksStore.mp4');
    this.load.video('church', 'assets/videos/church.mp4');
    this.load.video('coffeShop', 'assets/videos/coffeShop.mp4');
    this.load.video('fireStation', 'assets/videos/fireStation.mp4');
    this.load.video('gasStation', 'assets/videos/gasStation.mp4');
    this.load.video('museum', 'assets/videos/museum.mp4');
    this.load.video('policeStation', 'assets/videos/policeStation.mp4');
    this.load.video('school', 'assets/videos/school.mp4');
    this.load.video('store', 'assets/videos/store.mp4');
    this.load.video('house', 'assets/videos/house.mp4');
    this.load.spritesheet('player', 'assets/images/player.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    //audios
    this.load.audio('audioGeneral', 'assets/audios/traffic-in-city.mp3');

    this.load.start(); // ⚠️ IMPORTANTE para comenzar la carga manualmente
    // Imagen central
  }

  update() {}
}
