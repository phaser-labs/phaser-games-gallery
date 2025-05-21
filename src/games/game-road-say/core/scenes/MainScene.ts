import { globalState } from '../utils/GlobalState';

export class Main extends Phaser.Scene {
  private numeros = [
    { x: 200, y: 200, frame: 1 },
    { x: 290, y: 150, frame: 2 },
    { x: 380, y: 100, frame: 3 },
    { x: 470, y: 50, frame: 4 },
    { x: 530, y: 130, frame: 5 },
    { x: 430, y: 180, frame: 6 },
    { x: 330, y: 225, frame: 7 },
    { x: 230, y: 280, frame: 8 },
    { x: 125, y: 330, frame: 9 },

    { x: 292, y: 358, frame: 1 },
    { x: 315, y: 370, frame: 0 },
    { x: 386, y: 310, frame: 1 },
    { x: 400, y: 320, frame: 1 },
    { x: 473, y: 258, frame: 1 },
    { x: 490, y: 270, frame: 2 },
    { x: 575, y: 201, frame: 1 },
    { x: 590, y: 215, frame: 3 },
    { x: 671, y: 152, frame: 1 },
    { x: 683, y: 172, frame: 4 },

    { x: 715, y: 230, frame: 1 },
    { x: 740, y: 235, frame: 5 },

    { x: 620, y: 280, frame: 1 },
    { x: 645, y: 285, frame: 6 },
    { x: 525, y: 330, frame: 1 },
    { x: 545, y: 335, frame: 7 },
    { x: 425, y: 385, frame: 1 },
    { x: 440, y: 390, frame: 8 },

    { x: 325, y: 435, frame: 1 },
    { x: 340, y: 440, frame: 9 },
    { x: 425, y: 485, frame: 2 },
    { x: 450, y: 500, frame: 0 },
    { x: 570, y: 510, frame: 2 },
    { x: 595, y: 520, frame: 1 },
    { x: 680, y: 460, frame: 2 },
    { x: 710, y: 470, frame: 2 },
    { x: 770, y: 410, frame: 2 },
    { x: 800, y: 420, frame: 3 }
  ];
  private direccionMovimientos = ['movimiento_1', 'movimiento_2', 'movimiento_4'];
  private follower: Phaser.GameObjects.Sprite | null = null;
  private camino: { x: number; y: number; anim: string }[] = []; // camino
  private currentStep: number = 0;
  private lastDiceValue: number = 0;
  private diceSum: number = 0; // acumulador
  private resultNull: boolean | null = null;
  private isOpenModal: boolean | string | null | undefined;
  private backgroundMusic!: Phaser.Sound.BaseSound;
  constructor() {
    super('MainScene');
  }

  preload() {}

  create() {
    // this.input.on('pointerdown', (pointer) => {
    //   const x = Math.floor(pointer.worldX);
    //   const y = Math.floor(pointer.worldY);
    //   alert(`X: ${x}  Y: ${y}`);
    // });
    this.currentStep = 0;
    this.lastDiceValue = 0;
    this.diceSum = 0;
    this.scene.launch('DiceScene');
    this.resultNull = null;
    this.isOpenModal = '';
    // agregando sonidos
    // Iniciar animación
    // valor para desahabilitas los sonidos de saltos, y  cuando se unde  la hoja

    this.sound.stopAll();
    console.log('sonido de fondo', globalState.generalMusic);
    const handleMusicState = () => {
      if (globalState.generalMusic) {
        this.backgroundMusic.play();
      } else {
        this.backgroundMusic.pause();
      }
    };
    this.events.on('updateMusic', handleMusicState);
    // Inicializar el audio (pero no reproducirlo aún)
    this.backgroundMusic = this.sound.add('audioGeneral', {
      volume: 0.5,
      loop: true
    });
    this.events.emit('updateMusic');

    //pintar el mapa
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset76 = map.addTilesetImage('blocks_76', 'blocks_76');
    const tileset77 = map.addTilesetImage('blocks_77', 'blocks_77');
    const tileset4 = map.addTilesetImage('blocks_4', 'blocks_4');
    const tileset32 = map.addTilesetImage('blocks_32', 'blocks_32');
    const tileset35 = map.addTilesetImage('blocks_35', 'blocks_35');
    const tileset69 = map.addTilesetImage('blocks_69', 'blocks_69');
    const tilesetHome = map.addTilesetImage('home', 'home');
    this.add.image(0, 0, 'backGrass').setOrigin(0, 0).setScale(0.3);
    this.add.image(400, 0, 'backGrass').setOrigin(0, 0).setScale(0.3);
    this.add.image(700, 0, 'backGrass').setOrigin(0, 0).setScale(0.3);
    this.add.image(460, 300, 'backGrass').setOrigin(0, 0).setScale(0.5);
    this.add.image(0, 400, 'backGrass').setOrigin(0, 0).setScale(0.3);
    // Añadir un sprite o gráficos al contenedor (para visualizarlo)

    if (!tileset76 || !tileset77 || !tileset4 || !tileset32 || !tileset35 || !tileset69 || !tilesetHome) {
      return;
    } else {
      map
        .createLayer('grass', [tileset76, tileset77, tileset4, tileset32, tileset35, tileset69, tilesetHome])
        ?.setOrigin(0, 0);

      const objectLayer = map.getObjectLayer('arboles');
      if (objectLayer) {
        objectLayer.objects.forEach((obj) => {
          if (obj.x !== undefined && obj.y !== undefined && obj.gid !== undefined) {
            const isoX = obj.x - obj.y;
            const isoY = (obj.x + obj.y) / 2;
            const sprite = this.add.sprite(isoX, isoY, 'arbol1').setScale(0.3);
            sprite.setOrigin(-3.6, 0.5); // Ajusta el origen del sprite para centrarlo en la posición isométrica
          }
        });
      }
      map.createLayer('home', [tilesetHome])?.setScale(1.4);
      this.numeros.forEach((numero) => {
        this.add.sprite(numero.x, numero.y, 'numero', numero.frame).setScale(0.4);
      });
    }
    this.direccionMovimientos.forEach((direccion) => {
      this.anims.create({
        key: direccion,
        frames: this.anims.generateFrameNumbers(direccion, { start: 0, end: 31 }),
        frameRate: 40,
        repeat: -1
      });
    });

    this.camino = [
      { x: 94, y: 295, anim: 'movimiento_1' }, //0
      { x: 211, y: 224, anim: 'movimiento_1' }, //1
      { x: 307, y: 174, anim: 'movimiento_1' }, //2
      { x: 399, y: 120, anim: 'movimiento_1' }, //3
      { x: 497, y: 70, anim: 'movimiento_1' }, //4
      { x: 565, y: 120, anim: 'movimiento_2' }, //5
      { x: 496, y: 174, anim: 'movimiento_4' }, //6
      { x: 393, y: 219, anim: 'movimiento_4' }, //7
      { x: 308, y: 276, anim: 'movimiento_4' }, //8
      { x: 210, y: 325, anim: 'movimiento_4' }, //9
      { x: 266, y: 379, anim: 'movimiento_2' }, //10
      { x: 402, y: 325, anim: 'movimiento_1' }, //11
      { x: 497, y: 276, anim: 'movimiento_1' }, //12
      { x: 603, y: 223, anim: 'movimiento_1' }, //13
      { x: 685, y: 172, anim: 'movimiento_1' }, //14
      { x: 767, y: 233, anim: 'movimiento_2' }, //15
      { x: 691, y: 279, anim: 'movimiento_4' }, //16
      { x: 597, y: 325, anim: 'movimiento_4' }, //17
      { x: 499, y: 374, anim: 'movimiento_4' }, //18
      { x: 400, y: 429, anim: 'movimiento_4' }, //19
      { x: 463, y: 478, anim: 'movimiento_2' }, //20
      { x: 570, y: 519, anim: 'movimiento_2' }, //21
      { x: 671, y: 472, anim: 'movimiento_1' }, //22
      { x: 821, y: 412, anim: 'movimiento_1' } //23

      // … añade tantos como necesites
    ];
    this.follower = this.add.sprite(this.camino[0].x, this.camino[0].y, this.camino[0].anim);
    this.follower.play(this.camino[0].anim);
    this.currentStep = 0;

    // console.log(this.currentStep);
    this.moveToNextPoint();
  }
  private moveToNextPoint(finalStep: number = 0) {
    const nextStep = this.currentStep + 1;
    // Si ya llegamos o pasamos el paso final, no hacemos nada

    if (nextStep > finalStep || nextStep >= this.camino.length) {
      // console.log('Movimiento finalizado en el paso:', this.currentStep);
      this.follower?.anims.stop(); // Detener animación

      this.follower?.setFrame(0);

      return;
    }

    const nextPoint = this.camino[nextStep];
    const caminar = this.sound.add('caminar', { volume: 1 });

    this.tweens.add({
      targets: this.follower,
      x: nextPoint.x,
      y: nextPoint.y,
      duration: 1000,
      ease: 'Linear',
      onStart: () => {
        this.follower?.play(nextPoint.anim);
        if (globalState.specificMusic) {
          caminar.play();
        }
      },
      onComplete: () => {
        this.currentStep = nextStep;
        // sigue al siguiente paso si no ha llegado
        this.moveToNextPoint(finalStep);
        caminar.stop(); // Detener el sonido de caminar
      }
    });
    //console.log(nextStep); // se ve en que paso va el avatar
    this.time.delayedCall(2000, () => {
      if (nextStep === 23) {
        this.scene.sleep('DiceScene');
        this.scene.start('endGameScene');
        globalState.diceValue = 0;
      }
    });

    window.dispatchEvent(
      new CustomEvent('accumulatedChange', {
        detail: {
          accumulated: this.diceSum,
          resultNull: this.resultNull,
          currentStep: this.currentStep + 1
        }
      })
    );

    window.addEventListener('updateGameState', this.handleGameStateEvent);
  }
  private handleGameStateEvent = (e: Event) => {
    this.anims.create({
      key: 'follower-die',
      frames: this.anims.generateFrameNumbers('die', { start: 0, end: 31 }),
      frameRate: 40,
      repeat: 0
    });
    this.anims.create({
      key: 'follower-atack',
      frames: this.anims.generateFrameNumbers('atack', { start: 0, end: 31 }),
      frameRate: 40,
      repeat: 2
    });
    this.anims.create({
      key: 'follower-jump',
      frames: this.anims.generateFrameNumbers('jump', { start: 0, end: 31 }),
      frameRate: 40,
      repeat: 0
    });
    const custom = e as CustomEvent<{ result: boolean; isOpen: string | null | undefined }>;
    const result = custom.detail.result;
    this.isOpenModal = custom.detail.isOpen;

    // Aquí puedes usar el resultado para actualizar tu juego

    if (result === true && this.isOpenModal === null) {
      this.follower?.anims.play('follower-atack', true);

      if (globalState.specificMusic) {
        const espadas = this.sound.add('espada', { volume: 1 });
        espadas.play();
      }
      this.resultNull = null;
    } else if (result === false && this.isOpenModal === null) {
      this.follower?.anims.play('follower-die', true);
      if (globalState.specificMusic) {
        const caida = this.sound.add('caida', { volume: 1 });
        caida.play();
      }

      this.follower?.once('animationcomplete-follower-die', () => {
        this.tweens.add({
          targets: this.follower, // el objeto que quieres desvanecer
          alpha: 0, // opacidad final
          duration: 1000, // duración en milisegundos (1 segundo)
          onComplete: () => {
            this.follower?.setVisible(false); // ocultarlo completamente tras desvanecerse
          }
        });
      });
      this.follower?.once('animationcomplete-follower-die', () => {
        this.time.delayedCall(2000, () => {
          this.follower?.setVisible(true);
          this.follower?.setAlpha(1);
          this.follower?.setPosition(this.camino[0].x + 30, this.camino[0].y - 20);
          this.currentStep = 0;
          this.diceSum = 0;
          this.resultNull = null;
          this.follower?.anims.play('follower-jump', true);
          // Simular salto alto con un tween (movimiento tipo arco)
          this.tweens.add({
            targets: this.follower,
            y: this.follower && this.follower.y - 150, // más valor = salto más alto
            duration: 100,
            ease: 'Sine.easeOut',
            yoyo: true,
            onComplete: () => {
              this.follower?.anims.play('follower-jump', true);
              if (globalState.specificMusic) {
                const saltar = this.sound.add('saltar', { volume: 1 });
                saltar.play();
              }
            } // regresa a su posición original
          });
        });
      });
    }
  };

  update() {
    const currentDiceValue = globalState.diceValue;
    if (currentDiceValue !== this.lastDiceValue) {
      this.lastDiceValue = currentDiceValue;

      this.diceSum += currentDiceValue;
      // console.log('Valor actual del dado:', currentDiceValue);
      // console.log('Valor acumulado:', this.diceSum);

      // Llama al movimiento con el acumulado
      this.moveToNextPoint(this.diceSum);
    }
    globalState.diceValue = 0;
  }
}
