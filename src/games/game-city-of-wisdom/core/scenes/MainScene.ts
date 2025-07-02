import { globalState } from '../utils/GlobalState';
type MovingNpc = {
  id: string;
  sprite: Phaser.Physics.Matter.Image;
  path: Phaser.Math.Vector2[];
  currentPointIndex: number;
  speed: number;
  pauseUntil?: number;
  delayOnRestart?: number;
};

interface TileData {
  objectgroup?: {
    objects?: {
      x?: number;
      y?: number;
      polygon?: { x: number; y: number }[];
    }[];
  };
}
interface CustomBody extends MatterJS.BodyType {
  customId?: string;
}

export class Main extends Phaser.Scene {
  private player: Phaser.Physics.Matter.Sprite | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private map: Phaser.Tilemaps.Tilemap | null = null;
  private road: Phaser.Tilemaps.TilemapLayer | null = null;
  private grass: Phaser.Tilemaps.TilemapLayer | null = null;
  private fallGroundLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private npcs: MovingNpc[] = [];
  private intersectionZonesPoly: Phaser.Geom.Polygon[] = [];
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;
  private currentIntersectionNpc: MovingNpc | null = null;
  private categoryVehiculos: number | null = null;
  private categoryBuildings: number | null = null;
  private categoryRect: number | null = null;
  public backgroundMusic!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.npcs = [];
    this.categoryVehiculos = this.matter.world.nextCategory();
    this.categoryBuildings = this.matter.world.nextCategory();
    this.categoryRect = this.matter.world.nextCategory();
    this.map = this.make.tilemap({ key: 'tilemap' });
    this.map.setRenderOrder('right-down');

    this.sound.stopAll();
    const handleMusicState = () => {
      if (globalState.generalMusic) {
        this.backgroundMusic.play();
      } else {
        this.backgroundMusic.pause();
      }
    };
    this.events.on('updateMusic', handleMusicState);

    this.backgroundMusic = this.sound.add('audioGeneral', {
      volume: 0.3,
      loop: true
    });
    this.events.emit('updateMusic');

    // this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    //   const x = Math.floor(pointer.worldX);
    //   const y = Math.floor(pointer.worldY);
    //   alert(`x: ${x}, y: ${y}`);
    // });
    const dryGrassGround = this.map.addTilesetImage('dry grass ground', 'dry grass ground');
    const grassyGround = this.map.addTilesetImage('grassy ground', 'grassy ground');
    const road00 = this.map.addTilesetImage('road 00', 'road00');
    const fallGround = this.map.addTilesetImage('fall ground', 'fallGround');
    const road02a = this.map.addTilesetImage('road 02 a', 'road02a');
    const road02c = this.map.addTilesetImage('road 02 c', 'road02c');
    const tree01 = this.map.addTilesetImage('tree 01', 'tree 01');
    const tree02 = this.map.addTilesetImage('tree 02', 'tree 02');
    const treeC = this.map.addTilesetImage('treeC', 'treeC');
    const palmTree = this.map.addTilesetImage('palm tree', 'palm tree');
    const signStopB = this.map.addTilesetImage('signStopB', 'signStopB');
    const trafficLightA = this.map.addTilesetImage('trafficLightA', 'trafficLightA');
    const lightPoleA = this.map.addTilesetImage('lightPoleA', 'lightPoleA');
    const trashBag = this.map.addTilesetImage('trashBag', 'trashBag');
    const mailBoxBlackB = this.map.addTilesetImage('mailBoxBlackB', 'mailBoxBlackB');

    const originX = (this.map.height * this.map.tileWidth) / 2;
    const originY = -400;

    if (
      !dryGrassGround ||
      !grassyGround ||
      !road00 ||
      !road02a ||
      !road02c ||
      !fallGround ||
      !tree01 ||
      !tree02 ||
      !treeC ||
      !palmTree ||
      !signStopB ||
      !trafficLightA ||
      !lightPoleA ||
      !trashBag ||
      !mailBoxBlackB
    ) {
      return;
    } else {
      this.grass = this.map.createLayer('grass', [dryGrassGround, grassyGround], originX, originY);
      this.road = this.map.createLayer('path', [road00, road02a, road02c], originX, originY);
      this.fallGroundLayer = this.map.createLayer('forest', [fallGround], originX, originY);
      const treeLayer1 = this.map.createLayer('trees', [tree01, tree02, treeC, palmTree], originX - 10, originY - 100);
      const props = this.map.createLayer(
        'props',
        [signStopB, trafficLightA, lightPoleA, trashBag, mailBoxBlackB],
        originX - 200,
        originY + 50
      );
      props!.setDepth(800);
      props!.skipCull = true;
      this.grass!.skipCull = true;
      this.road!.skipCull = true;
      this.fallGroundLayer!.skipCull = true;
      treeLayer1!.skipCull = true;
    }
    const path1 = [new Phaser.Math.Vector2(1348, 1711), new Phaser.Math.Vector2(3981, 404)];
    const path2 = [new Phaser.Math.Vector2(4497, 641), new Phaser.Math.Vector2(1914, 2014)];
    const path3 = [new Phaser.Math.Vector2(5014, 894), new Phaser.Math.Vector2(2416, 2277)];
    const path4 = [new Phaser.Math.Vector2(1488, 894), new Phaser.Math.Vector2(4138, 2206)];
    const path5 = [new Phaser.Math.Vector2(4047, 411), new Phaser.Math.Vector2(1408, 1768)];
    const path6 = [new Phaser.Math.Vector2(1928, 2025), new Phaser.Math.Vector2(4598, 681)];
    const path7 = [new Phaser.Math.Vector2(2675, 2179), new Phaser.Math.Vector2(5109, 956)];
    const path8 = [new Phaser.Math.Vector2(4217, 2150), new Phaser.Math.Vector2(1531, 828)];
    const path9 = [new Phaser.Math.Vector2(4720, 1887), new Phaser.Math.Vector2(2125, 626)];
    const path10 = [new Phaser.Math.Vector2(5229, 1628), new Phaser.Math.Vector2(2589, 338)];
    const npcData = [
      { startX: 1348, startY: 1711, path: path1, speed: 6, pauseUntil: 2 },
      { startX: 1348, startY: 1711, path: path1, speed: 6, pauseUntil: 2 },
      { startX: 4497, startY: 641, path: path2, speed: 8, pauseUntil: 2 },
      { startX: 5014, startY: 894, path: path3, speed: 6, pauseUntil: 2 },
      { startX: 5014, startY: 894, path: path3, speed: 6, pauseUntil: 2 },
      { startX: 1488, startY: 894, path: path4, speed: 8, pauseUntil: 2 },
      { startX: 1488, startY: 894, path: path4, speed: 8, pauseUntil: 2 },
      { startX: 1488, startY: 894, path: path4, speed: 8, pauseUntil: 2 },
      { startX: 1348, startY: 1711, path: path1, speed: 6, pauseUntil: 2 },
      { startX: 4047, startY: 411, path: path5, speed: 6, pauseUntil: 2 },
      { startX: 4047, startY: 411, path: path5, speed: 6, pauseUntil: 2 },
      { startX: 1928, startY: 2025, path: path6, speed: 7, pauseUntil: 2 },
      { startX: 1928, startY: 2025, path: path6, speed: 7, pauseUntil: 2 },
      { startX: 2675, startY: 2179, path: path7, speed: 4, pauseUntil: 2 },
      { startX: 2675, startY: 2179, path: path7, speed: 4, pauseUntil: 2 },
      { startX: 4217, startY: 2150, path: path8, speed: 4, pauseUntil: 2 },
      { startX: 4217, startY: 2150, path: path8, speed: 4, pauseUntil: 2 },
      { startX: 4720, startY: 1887, path: path9, speed: 5, pauseUntil: 2 },
      { startX: 4720, startY: 1887, path: path9, speed: 5, pauseUntil: 2 },
      { startX: 5229, startY: 1628, path: path10, speed: 5, pauseUntil: 2 },
      { startX: 5229, startY: 1628, path: path10, speed: 5, pauseUntil: 2 }
    ];

    const vehiculosObjects = this.map.getObjectLayer('cars');
    vehiculosObjects?.objects.forEach((obj, index) => {
      const npcInfo = npcData[index];
      const gid = obj.gid !== undefined ? obj.gid : 0;
      const tilesets = this.map?.tilesets;
      const tileset = tilesets?.find((ts) => gid >= ts.firstgid && gid < ts.firstgid + ts.total);
      if (!tileset) return;

      const firstgid = tileset.firstgid;
      const tileIndex = gid! - firstgid;
      const tileData = (tileset.tileData as TileData[])[tileIndex];

      if (!tileData || !tileData.objectgroup || !tileData.objectgroup.objects) {
        console.log(`No object data found for tile GID ${gid}`);
        return;
      }
      if (tileData?.objectgroup?.objects?.length > 0) {
        const polyObj = tileData.objectgroup.objects[0];
        if (polyObj.polygon) {
          const offsetX = polyObj.x || 0;
          const offsetY = polyObj.y || 0;
          const vertices = polyObj.polygon?.map((p: { x: number; y: number }) => ({
            x: p.x + offsetX,
            y: p.y + offsetY
          }));

          // Espera opcional para animar entrada o stagger
          this.time.delayedCall(index * 1000, () => {
            const textureName = tileset.name;
            const body = this.matter.bodies.fromVertices(npcInfo.startX, npcInfo.startY, [vertices], {
              label: 'vehiculo',
              isStatic: false,
              friction: 0,
              frictionAir: 0.01,
              restitution: 0.5,
              inertia: Infinity
            });

            const sprite = this.matter.add.image(npcInfo.startX, npcInfo.startY, textureName, tileIndex);
            if (sprite.body) {
              this.matter.world.remove(sprite.body);
            }

            this.matter.add.gameObject(sprite, body);

            body.collisionFilter.category = this.categoryVehiculos ?? 0;
            body.collisionFilter.mask = 0xffffffff ^ (this.categoryBuildings ?? 0);

            sprite.setFixedRotation();
            const npcId = Phaser.Utils.String.UUID();
            this.npcs.push({
              id: npcId,
              sprite,
              path: npcInfo.path,
              currentPointIndex: 1,
              speed: npcInfo.speed || 1.5
            });
          });
        }
      }
    });
    const npcDataBuildings = [
      // coordenadas del cafe
      { buildingX: 2896, buildingY: 1146 },
      // coordenadas del taller de carros
      { buildingX: 4389, buildingY: 1005 },
      // coordenadas de estacion de bomberos
      { buildingX: 2920, buildingY: 651 },
      // coordenadas de la escuela
      { buildingX: 2252, buildingY: 911 },
      // coordenadas del iglesia
      { buildingX: 2202, buildingY: 1489 },
      // coordenadas de la gasolinera
      { buildingX: 3909, buildingY: 1229 },
      // coordenadas del banco péro no aparece
      { buildingX: 2423, buildingY: 1236 },
      // coordenadas de la casa  la policia
      { buildingX: 1754, buildingY: 1226 },
      // coordenadas de la casa  la azul pequeña
      { buildingX: 3324, buildingY: 1018 },
      // coordenadas de la casa  tienda
      { buildingX: 3371, buildingY: 1402 },
      // coordenadas del museo
      { buildingX: 2828, buildingY: 1622 },
      // coordenadas de la libreria
      { buildingX: 4776, buildingY: 1207 },
      // coordenadas del lago
      { buildingX: 4347, buildingY: 1477 }
    ];
    const edificiosObjects = this.map.getObjectLayer('buildings');

    edificiosObjects?.objects.forEach((obj, index) => {
      const buildingInfo = npcDataBuildings[index];

      const gidBulding = obj.gid !== undefined ? obj.gid : 0;

      const tilesetsBulding = this.map?.tilesets;

      const tilesetBulding = tilesetsBulding?.find(
        (ts) => gidBulding >= ts.firstgid && gidBulding < ts.firstgid + ts.total
      );

      if (!tilesetBulding) return;

      const firstgid = tilesetBulding.firstgid;
      const tileIndex = gidBulding! - firstgid;
      const tileData = (tilesetBulding.tileData as TileData[])[tileIndex];

      if (!tileData || !tileData.objectgroup || !tileData.objectgroup.objects) {
        return;
      }
      if (tileData?.objectgroup?.objects?.length > 0) {
        const polyObj = tileData.objectgroup.objects[0];
        if (polyObj.polygon) {
          const offsetX = polyObj.x || 0;
          const offsetY = polyObj.y || 0;

          const scaleFactor =
            obj.name === 'fireStation' ? 0.8 : obj.name === 'school' ? 0.8 : obj.name === 'policeStation' ? 0.8 : 1;
          const vertices = polyObj.polygon?.map((p: { x: number; y: number }) => ({
            x: (p.x + offsetX) * scaleFactor,
            y: (p.y + offsetY) * scaleFactor
          }));

          const textureName = tilesetBulding.name;
          const body = this.matter.bodies.fromVertices(buildingInfo.buildingX, buildingInfo.buildingY, [vertices], {
            label: 'building',
            isStatic: true
          });

          const sprite = this.matter.add.image(buildingInfo.buildingX, buildingInfo.buildingY, textureName, tileIndex);
          if (obj.name === 'fireStation' || obj.name === 'school' || obj.name === 'policeStation') {
            sprite.setScale(0.8);
          }
          if (obj.name === 'convenience store') {
            console.log('si existe');
          }
          if (sprite.body) {
            this.matter.world.remove(sprite.body);
          } // Elimina el cuerpo rectangular

          this.matter.add.gameObject(sprite, body);
          body.collisionFilter.category = this.categoryBuildings ?? 0;
          sprite.setFixedRotation();
          sprite.setDepth(1000);
        }
      }
    });
    this.add.image(3832, 1660, 'senalVenta').setOrigin(0, 0).setDepth(0).setScale(0.3).setDepth(1100);
    this.fallGroundLayer!.setCollisionByProperty({ collides: true });

    this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.player = this.matter.add.sprite(2000, 1200, 'playerWalk-E');
    this.player.setRectangle(this.player.width * 0.1, this.player.height * 0.4);
    this.player.setFixedRotation();
    if (this.player.body !== null) {
      const playerBody = this.player.body as Matter.Body;
      playerBody.label = 'player';
    }

    this.cameras.main.startFollow(this.player!, true);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.debugGraphics = this.add.graphics();
    this.matter.world.convertTilemapLayer(this.fallGroundLayer!, {
      renderDebug: {
        graphics: this.debugGraphics,
        tileColor: null,
        tileBodyColor: 0xff0000,
        bodyBoundsColor: 0x00ff00
      }
    });
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = true;

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.anims.create({
      key: 'playerWalk-E',
      frames: this.anims.generateFrameNumbers('playerWalk-E', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'playerWalk-N',
      frames: this.anims.generateFrameNumbers('playerWalk-N', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'playerWalk-NE',
      frames: this.anims.generateFrameNumbers('playerWalk-NE', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'playerWalk-S',
      frames: this.anims.generateFrameNumbers('playerWalk-S', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'playerWalk-SE',
      frames: this.anims.generateFrameNumbers('playerWalk-SE', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'cowboy',
      frames: this.anims.generateFrameNumbers('cowboy', { start: 0, end: 14 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'cowboy-up',
      frames: this.anims.generateFrameNumbers('cowboy', { start: 57, end: 70 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'junko-up',
      frames: this.anims.generateFrameNumbers('junko', { start: 9, end: 11 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'male',
      frames: this.anims.generateFrameNumbers('male', { start: 4, end: 7 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'cat-white',
      frames: this.anims.generateFrameNumbers('cat', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'cat-black',
      frames: this.anims.generateFrameNumbers('cat', { start: 12, end: 14 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'cat-yellow',
      frames: this.anims.generateFrameNumbers('cat', { start: 7, end: 7 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'dog-black',
      frames: this.anims.generateFrameNumbers('dog', { start: 12, end: 15 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'deer-eat',
      frames: this.anims.generateFrameNumbers('deer', { start: 5, end: 9 }),
      frameRate: 3,
      repeat: -1
    });
    this.anims.create({
      key: 'deer-walk',
      frames: this.anims.generateFrameNumbers('deer', { start: 10, end: 14 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'horse-walk',
      frames: this.anims.generateFrameNumbers('horse', { start: 10, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'bunny',
      frames: this.anims.generateFrameNumbers('bunny', { start: 12, end: 15 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'lady',
      frames: this.anims.generateFrameNumbers('lady', { start: 16, end: 22 }),
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'orco-1',
      frames: this.anims.generateFrameNumbers('orco', { start: 0, end: 49 }),
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'orco-2',
      frames: this.anims.generateFrameNumbers('orco', { start: 50, end: 99 }),
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'police',
      frames: this.anims.generateFrameNumbers('police', { start: 0, end: 7 }),
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'estudiante',
      frames: this.anims.generateFrameNumbers('estudiante', { start: 0, end: 6 }),
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'estudianteNiña',
      frames: this.anims.generateFrameNumbers('estudianteNiña', { start: 0, end: 5 }),
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'bombero',
      frames: this.anims.generateFrameNumbers('bombero', { start: 0, end: 29 }),
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'jesus',
      frames: this.anims.generateFrameNumbers('jesus', { start: 0, end: 5 }),
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'gasolinero',
      frames: this.anims.generateFrameNumbers('gasolinero', { start: 0, end: 3 }),
      frameRate: 1,
      repeat: -1
    });

    this.createRhomboidIntersections();

    const rectangles = [
      { x: 3761, y: 1986, width: 250, height: 30, angleRad: 100 },
      { x: 4260, y: 1708, width: 250, height: 30, angleRad: 100 },
      { x: 4766, y: 1481, width: 250, height: 30, angleRad: 100 },
      { x: 4652, y: 1105, width: 250, height: 30, angleRad: 60 },
      { x: 3663, y: 570, width: 250, height: 30, angleRad: 70 },
      { x: 1838, y: 1501, width: 250, height: 30, angleRad: 10 },
      { x: 2368, y: 1760, width: 250, height: 30, angleRad: 10 },
      { x: 2865, y: 2030, width: 250, height: 30, angleRad: 10 },
      { x: 1806, y: 1302, width: 60, height: 80, angleRad: 380, id: 'PoliceScene' },
      { x: 2166, y: 1057, width: 20, height: 130, angleRad: 137, id: 'ShoolScene' },
      { x: 2768, y: 755, width: 20, height: 90, angleRad: 137, id: 'FireStationScene' },
      { x: 3247, y: 1071, width: 20, height: 90, angleRad: 137, id: 'HouseScene' },
      { x: 2843, y: 1261, width: 20, height: 90, angleRad: 140, id: 'CoffeScene' },
      { x: 2286, y: 1615, width: 20, height: 90, angleRad: 180, id: 'ChurchScene' },
      { x: 2775, y: 1783, width: 20, height: 90, angleRad: 360.2, id: 'MuseumScene' },
      { x: 3411, y: 1511, width: 20, height: 90, angleRad: 360.2, id: 'StoreScene' },
      { x: 3808, y: 1327, width: 20, height: 300, angleRad: 360.2, id: 'GasStationScene' },
      { x: 4234, y: 1028, width: 20, height: 300, angleRad: 360.2, id: 'CarworkshopScene' },
      { x: 4671, y: 1329, width: 20, height: 300, angleRad: 360.2, id: 'BookStoreScene' }
    ];

    this.createMultipleRectangles(rectangles);

    const playerSize = {
      width: this.player.width,
      height: this.player.height
    };

    this.createcharaptersWithLoop(
      this,
      'cowboy',
      'cowboy',
      new Phaser.Math.Vector2(3219, 2117),
      new Phaser.Math.Vector2(4416, 1366),
      0,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'cowboy-up',
      'cowboy',
      new Phaser.Math.Vector2(1788, 1006),
      new Phaser.Math.Vector2(4127, 2206),
      100,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'junko',
      'junko-up',
      new Phaser.Math.Vector2(2519, 2338),
      new Phaser.Math.Vector2(3367, 1854),
      0,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'male',
      'male',
      new Phaser.Math.Vector2(3132, 1438),
      new Phaser.Math.Vector2(3482, 1639),
      100,
      playerSize
    );

    this.createcharaptersWithLoop(
      this,
      'cat',
      'cat-white',
      new Phaser.Math.Vector2(3411, 892),
      new Phaser.Math.Vector2(3983, 878),
      100,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'cat',
      'cat-black',
      new Phaser.Math.Vector2(2258, 1665),
      new Phaser.Math.Vector2(2668, 1496),
      100,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'cat',
      'cat-yellow',
      new Phaser.Math.Vector2(3542, 1283),
      new Phaser.Math.Vector2(3542, 1283),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'dog',
      'dog-black',
      new Phaser.Math.Vector2(3209, 2132),
      new Phaser.Math.Vector2(3987, 1668),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'deer',
      'deer-eat',
      new Phaser.Math.Vector2(3712, 1761),
      new Phaser.Math.Vector2(3712, 1761),
      0,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'deer',
      'deer-walk',
      new Phaser.Math.Vector2(2540, 1796),
      new Phaser.Math.Vector2(4119, 1704),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'horse',
      'horse-walk',
      new Phaser.Math.Vector2(4015, 1694),
      new Phaser.Math.Vector2(3004, 2030),
      0,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'bunny',
      'bunny',
      new Phaser.Math.Vector2(2841, 925),
      new Phaser.Math.Vector2(3467, 617),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'lady',
      'lady',
      new Phaser.Math.Vector2(2724, 1389),
      new Phaser.Math.Vector2(3128, 1222),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'orco',
      'orco-1',
      new Phaser.Math.Vector2(2576, 1761),
      new Phaser.Math.Vector2(2576, 1761),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'orco',
      'orco-2',
      new Phaser.Math.Vector2(2796, 1898),
      new Phaser.Math.Vector2(2796, 1898),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'police',
      'police',
      new Phaser.Math.Vector2(1474, 1456),
      new Phaser.Math.Vector2(2106, 1226),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'police',
      'police',
      new Phaser.Math.Vector2(1834, 1046),
      new Phaser.Math.Vector2(2172, 1262),
      200,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'estudiante',
      'estudiante',
      new Phaser.Math.Vector2(2350, 1188),
      new Phaser.Math.Vector2(1954, 989),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'estudianteNiña',
      'estudianteNiña',
      new Phaser.Math.Vector2(2520, 1027),
      new Phaser.Math.Vector2(2520, 1027),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'bombero',
      'bombero',
      new Phaser.Math.Vector2(2663, 805),
      new Phaser.Math.Vector2(2663, 805),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'jesus',
      'jesus',
      new Phaser.Math.Vector2(2426, 1481),
      new Phaser.Math.Vector2(2426, 1481),
      1000,
      playerSize
    );
    this.createcharaptersWithLoop(
      this,
      'gasolinero',
      'gasolinero',
      new Phaser.Math.Vector2(3839, 1366),
      new Phaser.Math.Vector2(3839, 1366),
      1000,
      playerSize
    );

    this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Detecta si uno es el player y el otro es un rectángulo
        const isPlayerA = bodyA.label === 'player';
        const isRectangleA = bodyA.label === 'custom-rectangle';

        if (isPlayerA || isRectangleA) {
          const rectangleBody = isRectangleA ? bodyA : bodyB;
          const customBody = rectangleBody as CustomBody;
          if (customBody.customId !== undefined) {
            const isBoss = confirm('¿desea conocer los elementos de este edificio?');
            if (isBoss) {
              const targetSceneId = customBody.customId; // ejemplo: 'ScenePolice'
              this.goToSceneById(this, targetSceneId);
            }
          }
        }
      });
    });
    const centerX = this.cameras.main.centerX - 540;
    const centerY = this.cameras.main.centerY - 315;
    const containerText = this.add.dom(centerX, centerY, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerText.setScrollFactor(0);
    containerText.setClassName('cityOfWisdom__containerBtnMain');
    const htmlContainerText = containerText.node as HTMLElement;
    htmlContainerText.innerHTML = `
        <button  class="cityOfWisdom__containerBtnMain__btnIniciar" id="startButton">
          <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="back"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>
        </button>
        `;
    const startButton = document.getElementById('startButton') as HTMLButtonElement;
    startButton.addEventListener('click', () => {
      this.scene.start('menuScene');
    });
  }
  // Función para cambiar de escena dinámicamente por ID
  private goToSceneById(scene: Phaser.Scene, id: string) {
    if (scene.scene.get(id)) {
      scene.scene.start(id);
    } else {
      console.warn(`La escena con ID '${id}' no está registrada.`);
    }
  }

  private createcharaptersWithLoop(
    scene: Phaser.Scene,
    texture: string,
    animKey: string,
    startPos: Phaser.Math.Vector2,
    endPos: Phaser.Math.Vector2,
    setDepth: number,
    playerSize: { width: number; height: number }
  ) {
    const sprite = scene.matter.add.sprite(startPos.x, startPos.y, texture);
    sprite.setRectangle(playerSize.width * 0.1, playerSize.height * 0.1);
    sprite.play(animKey);
    sprite.setDepth(setDepth);
    sprite.setFixedRotation();
    if (sprite.body !== null) {
      (sprite.body as Matter.Body).collisionFilter.mask = 0;
    }

    scene.tweens.add({
      targets: sprite,
      x: endPos.x,
      y: endPos.y,
      duration: 9000,
      ease: 'Linear',
      yoyo: true,
      repeat: -1,
      onYoyo: () => {
        sprite.setFlipX(true);
      },
      onRepeat: () => {
        sprite.setFlipX(false);
      }
    });

    return sprite;
  }

  update() {
    // movimento del NPC
    this.updateMovingNpcs();
    // movimento del player
    const speed = 5;
    let vx = 0;
    let vy = 0;

    const left = this.cursors?.left.isDown;
    const right = this.cursors?.right.isDown;
    const up = this.cursors?.up.isDown;
    const down = this.cursors?.down.isDown;

    // Movimiento en isométrico
    if (up && left) {
      vx = -speed;
      vy = -speed / 2;
      (this.player as Phaser.GameObjects.Sprite).anims.play('playerWalk-N', true);
      (this.player as Phaser.GameObjects.Sprite).setFlipX(false);
    } else if (up && right) {
      vx = speed;
      vy = -speed / 2;

      (this.player as Phaser.GameObjects.Sprite).anims.play('playerWalk-NE', true);
      (this.player as Phaser.GameObjects.Sprite).setFlipX(false);
    } else if (down && left) {
      vx = -speed;
      vy = speed / 2;
      (this.player as Phaser.GameObjects.Sprite).anims.play('playerWalk-SE', true);
      (this.player as Phaser.GameObjects.Sprite).setFlipX(true);
    } else if (down && right) {
      vx = speed;
      vy = speed / 2;
      (this.player as Phaser.GameObjects.Sprite).anims.play('playerWalk-SE', true);
      (this.player as Phaser.GameObjects.Sprite).setFlipX(false);
    } else if (left) {
      vx = -speed;
      vy = 0;
      (this.player as Phaser.GameObjects.Sprite).anims.play('playerWalk-E', true);
      (this.player as Phaser.GameObjects.Sprite).setFlipX(true);
    } else if (right) {
      vx = speed;
      vy = 0;
      (this.player as Phaser.GameObjects.Sprite).anims.play('playerWalk-E', true);
      (this.player as Phaser.GameObjects.Sprite).setFlipX(false);
    } else if (up) {
      vx = 0;
      vy = -speed;
      (this.player as Phaser.GameObjects.Sprite).anims.play('playerWalk-N', true);
    } else if (down) {
      vx = 0;
      vy = speed;
      (this.player as Phaser.GameObjects.Sprite).anims.play('playerWalk-S', true);
    } else {
      (this.player as Phaser.Physics.Matter.Sprite).setVelocity(0, 0);
      (this.player as Phaser.GameObjects.Sprite).anims.stop();
      return;
    }
    (this.player as Phaser.Physics.Matter.Sprite).setVelocity(vx, vy);
  }
  private createRhomboidIntersections() {
    const offset = 200;

    // Lista de centros para cada rombo
    const centers = [
      { x: 2327, y: 1264 },
      { x: 2849, y: 991 },
      { x: 3369, y: 721 },
      { x: 2839, y: 1501 },
      { x: 3366, y: 1258 },
      { x: 3869, y: 983 },
      { x: 3358, y: 1757 },
      { x: 3876, y: 1501 },
      { x: 4398, y: 1246 }
    ];

    this.intersectionZonesPoly = centers.map(({ x, y }) => {
      return new Phaser.Geom.Polygon([
        x,
        y - offset, // Punto superior
        x + offset,
        y, // Derecho
        x,
        y + offset, // Inferior
        x - offset,
        y // Izquierdo
      ]);
    });
  }

  private updateMovingNpcs() {
    const now = this.time.now;

    for (const npc of this.npcs) {
      const path = npc.path;
      const sprite = npc.sprite;

      // Si está en pausa, lo detenemos y saltamos a la siguiente iteración
      if (npc.pauseUntil && now < npc.pauseUntil) {
        sprite.setVelocity(0, 0);
        continue;
      }

      const i = npc.currentPointIndex;
      const target = path[i];
      const npcX = sprite.x;
      const npcY = sprite.y;
      const distance = Phaser.Math.Distance.Between(npcX, npcY, target.x, target.y);

      const point = new Phaser.Geom.Point(npcX, npcY);
      const isInIntersection = this.intersectionZonesPoly.some((poly) =>
        Phaser.Geom.Polygon.ContainsPoint(poly, point)
      );

      // Control de intersección
      if (isInIntersection) {
        if (!this.currentIntersectionNpc) {
          this.currentIntersectionNpc = npc;
        }

        if (this.currentIntersectionNpc !== npc) {
          npc.pauseUntil = now + 10;
          sprite.setVelocity(0, 0);
          continue;
        }
      }

      if (!isInIntersection && this.currentIntersectionNpc === npc) {
        this.currentIntersectionNpc = null;
      }

      let shouldWait = false;

      for (const otherNpc of this.npcs) {
        if (otherNpc === npc) continue;

        const samePath = otherNpc.path === npc.path;
        if (!samePath) continue;

        const dx = otherNpc.sprite.x - npcX;
        const dy = otherNpc.sprite.y - npcY;
        const distanceBetween = Math.hypot(dx, dy);
        if (distanceBetween > 150) continue;

        const npcTarget = path[npc.currentPointIndex];
        const otherTarget = otherNpc.path[otherNpc.currentPointIndex];

        const distNpcToTarget = Phaser.Math.Distance.Between(npcX, npcY, npcTarget.x, npcTarget.y);
        const distOtherToTarget = Phaser.Math.Distance.Between(
          otherNpc.sprite.x,
          otherNpc.sprite.y,
          otherTarget.x,
          otherTarget.y
        );

        if (distOtherToTarget < distNpcToTarget) {
          shouldWait = true;
          break;
        }
      }
      if (shouldWait) {
        npc.pauseUntil = now + 400;
        sprite.setVelocity(0, 0);
        continue;
      }

      if (distance < 4) {
        npc.currentPointIndex++;

        if (npc.currentPointIndex >= path.length) {
          sprite.setPosition(path[0].x, path[0].y);
          npc.currentPointIndex = 1;

          if (npc.delayOnRestart) {
            npc.pauseUntil = now + npc.delayOnRestart;
          }

          sprite.setVelocity(0, 0);
          continue;
        }
      }

      const angle = Phaser.Math.Angle.Between(npcX, npcY, target.x, target.y);
      const speed = npc.speed || 100;
      sprite.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }
  private createMultipleRectangles(
    rectConfigs: { x: number; y: number; width: number; height: number; angleRad: number; id?: string }[]
  ) {
    rectConfigs.forEach((config) => {
      const { x, y, width, height, angleRad, id } = config;
      const rectangle = this.matter.add.rectangle(x, y, width, height, {
        isStatic: true,
        angle: angleRad,
        label: 'custom-rectangle',
        collisionFilter: {
          category: this.categoryRect ?? 0,
          mask: 0xffffffff ^ this.categoryVehiculos!
        }
      }) as CustomBody;
      rectangle.customId = id;
    });
  }
}
