import Phaser from 'phaser';

import { globalState } from '../utils/GlobalState';

// import '../../frogJumping.css';
export class Menu extends Phaser.Scene {
  constructor() {
    super('menuScene');
  }
  preload() {
    const progressBar = this.add.graphics();
    // const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.add.text(400, height / 2 - 50, 'Cargando...', {
      fontSize: '32px',
      color: '#fff'
    });
    const percentText = this.add.text(600, height / 2 - 25, '0%', {
      fontSize: '18px',
      color: '#fff'
    });
    const assetText = this.add.text(400, height / 2 + 50, 'Assets', {
      fontSize: '18px',
      color: '#fff'
    });
    this.load.on('progress', function (value: number) {
      percentText.setText(Math.round(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(400, height / 2 - 10, value * 320, 50);
    });
    this.load.on('fileprogress', function (file: Phaser.Loader.File) {
      assetText.setText('Cargando: ' + file.key);
      console.log(file.src);
    });
    this.load.on('complete', function () {
      progressBar.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });
    this.load.image('backGrass', 'assets/game-road-say/maps/backGrass.png');
    this.load.spritesheet('avatar', 'assets/game-road-say/images/Run_Sword_Body.png', {
      frameWidth: 640,
      frameHeight: 640
    });
    // 🗺️ Cargar el mapa JSON
    // this.load.tilemapTiledJSON('tilemap', 'assets/maps/isometricoPrueba.json');
    this.load.tilemapTiledJSON('tilemap', 'assets/game-road-say/maps/isometrico2.json');

    // 🖼️ Cargar cada tileset por separado
    this.load.image('blocks_76', 'assets/game-road-say/maps/blocks_76.png');
    this.load.image('blocks_77', 'assets/game-road-say/maps/blocks_77.png');
    this.load.image('blocks_4', 'assets/game-road-say/maps/blocks_4.png');
    this.load.image('blocks_32', 'assets/game-road-say/maps/blocks_32.png');
    this.load.image('blocks_35', 'assets/game-road-say/maps/blocks_35.png');
    this.load.image('blocks_69', 'assets/game-road-say/maps/blocks_69.png');
    this.load.image('home', 'assets/game-road-say/maps/home.png');
    this.load.image('numeros', 'assets/game-road-say/maps/numeros.png');
    this.load.image('arbol1', 'assets/game-road-say/maps/arbol_1.png');
    this.load.image('backGrass', 'assets/game-road-say/maps/backGrass.png');
    this.load.spritesheet('numero', 'assets/game-road-say/maps/numeros.png', { frameWidth: 101, frameHeight: 115 });
    // sprites de movimientos isometricos
    for (let i = 1; i <= 5; i++) {
      this.load.spritesheet(`movimiento_${i}`, `assets/game-road-say/maps/WalkForward_Bow_Body_${i}.png`, {
        frameWidth: 180,
        frameHeight: 180
      });
    }
    this.load.spritesheet('die', 'assets/game-road-say/maps/WalkForward_Bow_Body_5.png', {
      frameWidth: 180,
      frameHeight: 180
    });
    this.load.spritesheet('atack', 'assets/game-road-say/maps/Attack_Sword_Body_157.png', {
      frameWidth: 180,
      frameHeight: 180
    });
    this.load.spritesheet('jump', 'assets/game-road-say/maps/Jump_Bow_Body_090.png', {
      frameWidth: 180,
      frameHeight: 180
    });
    this.load.audio('audioGeneral', 'assets/game-road-say/audios/audioGeneral.mp3');
    this.load.audio('caminar', 'assets/game-road-say/audios/caminar.mp3');
    this.load.audio('caida', 'assets/game-road-say/audios/caida.mp3');
    this.load.audio('espada', 'assets/game-road-say/audios/espada.mp3');
    this.load.audio('saltar', 'assets/game-road-say/audios/saltar.mp3');
    this.load.image('startButton', 'assets/game-road-say/images/start.jpg');
    this.load.image('confetti', 'assets/game-road-say/images/confettii.png');
    this.load.image('backGrass', 'assets/game-road-say/maps/backGrass.png');
    this.load.spritesheet('avatarQuieta', 'assets/game-road-say/images/Idle_Bow_Body.png', {
      frameWidth: 640,
      frameHeight: 640
    });
    this.load.audio('dado', 'assets/game-road-say/audios/dado.mp3');
  }
  create() {
    this.add.image(0, 0, 'backGrass').setOrigin(0, 0).setScale(0.8);
    this.anims.create({
      key: 'follower-anims',
      frames: this.anims.generateFrameNumbers('avatar', { start: 0, end: 31 }),
      frameRate: 25,
      repeat: -1
    });
    const follower = this.add.sprite(150, 280, 'avatar').setOrigin(0.5, 0.5);
    follower.play('follower-anims');
    const containerText = this.add.dom(700, 300, 'div', '', '') as Phaser.GameObjects.DOMElement;

    containerText.setClassName('gameRoadDice__containerTexthtml');
    const htmlContainerText = containerText.node as HTMLElement;
    htmlContainerText.innerHTML = `
    <h1 class="gameRoadDice__title"> Camino de preguntas</h1>
    <ul class="gameRoadDice__text">
      <li><strong >Lanza el dado</strong> para avanzar por el camino.</li>
      <li>Al caer en una casilla especial (3, 7, 13, 18 o 22), se abrirá una<strong>pregunta de cultura general.</strong></li>
      <li> <strong>Lee cuidadosamente </strong> la pregunta y selecciona la opción que consideres correcta.</li>
      <li>Si tu respuesta es  <strong>incorrecta</strong>, el personaje <strong>regresará al inicio</strong> y deberás intentarlo de nuevo.</li>
      <li> El objetivo es <strong>llegar al final del camino </strong>respondiendo correctamente las preguntas clave. </li>
    </ul>
    `;
    const btnIniciar = this.add.dom(700, 580, 'button', '', 'Iniciar') as Phaser.GameObjects.DOMElement;
    btnIniciar.setClassName('gameRoadDice__startButton');
    const htmlbtnIniciar = btnIniciar.node as HTMLElement;

    htmlbtnIniciar.addEventListener('click', () => {
      this.scene.start('MainScene');
    });

    const containerBtnsAudio = this.add.dom(1020, 610, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerBtnsAudio.setClassName('gameRoadDice__containerBtnsAudio');
    const htmlcontainerBtnsAudio = containerBtnsAudio.node as HTMLElement;

    htmlcontainerBtnsAudio.innerHTML = `
    <button id="btnAudioGeneral" class="gameRoadDice__btnGeneral" aria-label="Audio general precione la tecla enter">
      <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#000000"><path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z"/></svg>
    </button>
    <button id="btnAudioSpecific" class="gameRoadDice__btnAudioSpecific"  aria-label="Audio específico precione la tecla enter">
      <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="  #000000"><path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"/></svg>
    </button>
    `;
    let audioGeneralActivo: boolean = false;
    let audioEspecificoActivo: boolean = false;

    const btnAudioGeneral = document.getElementById('btnAudioGeneral');
    const btnAudioSpecific = document.getElementById('btnAudioSpecific');

    // Recuperar estados guardados (si existen)
    audioGeneralActivo = localStorage.getItem('audioGeneralActivo') === 'false' ? false : true;
    audioEspecificoActivo = localStorage.getItem('audioEspecificoActivo') === 'false' ? false : true;
    globalState.specificMusic = audioEspecificoActivo;
    globalState.generalMusic = audioGeneralActivo;
    // Aplicar clases visuales al cargar
    if (btnAudioGeneral && btnAudioSpecific) {
      // Botón general
      btnAudioGeneral.addEventListener('click', () => {
        audioGeneralActivo = !audioGeneralActivo;
        localStorage.setItem('audioGeneralActivo', audioGeneralActivo.toString());
        btnAudioGeneral.classList.toggle('is-inactive', !audioGeneralActivo);
        globalState.generalMusic = audioGeneralActivo;
      });

      // Botón específico
      btnAudioSpecific.addEventListener('click', () => {
        audioEspecificoActivo = !audioEspecificoActivo;
        localStorage.setItem('audioEspecificoActivo', audioEspecificoActivo.toString());
        btnAudioSpecific.classList.toggle('is-inactive', !audioEspecificoActivo);
        globalState.specificMusic = audioEspecificoActivo;
      });
    }
    console.log('audioGeneralActivo', globalState.generalMusic);
  }

  update() {}
}
