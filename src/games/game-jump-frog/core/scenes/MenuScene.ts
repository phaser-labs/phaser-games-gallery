import Phaser from 'phaser';

import { globalState } from '../utils/GlobalState';

// import '../../frogJumping.css';
export class Menu extends Phaser.Scene {
  instructionsElement!: Phaser.GameObjects.DOMElement;

  constructor() {
    super('menuScene');
  }

  preload() {
    const progressBar = this.add.graphics();
    // const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.add.text(300, height / 2 - 50, 'Cargando...', {
      fontSize: '32px',
      color: '#fff'
    });
    const percentText = this.add.text(400, height / 2 - 25, '0%', {
      fontSize: '18px',
      color: '#fff'
    });
    const assetText = this.add.text(300, height / 2 + 50, 'Assets', {
      fontSize: '18px',
      color: '#fff'
    });
    this.load.on('progress', function (value: number) {
      percentText.setText(Math.round(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(400 - 160, height / 2 - 10, value * 320, 50);
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
    this.load.image('whater', 'assets/game-jump-frog/images/background.png');
    this.load.image('frog', 'assets/game-jump-frog/images/frog.png');
    this.load.text('bordeBox', 'assets/game-jump-frog/images/borderBox.svg');
    this.load.image('water', 'assets/game-jump-frog/images/background.png');
    this.load.spritesheet('rana', 'assets/game-jump-frog/images/rana.png', {
      frameWidth: 142,
      frameHeight: 218
    });
    this.load.spritesheet('hundimiento2', 'assets/game-jump-frog/images/hundimiento2.png', {
      frameWidth: 177,
      frameHeight: 171
    });
    this.load.image('orilla', 'assets/game-jump-frog/images/orilla.png');
    // precargar sonidos
    this.load.audio('music', 'assets/game-jump-frog/audios/swamp.wav');
    this.load.audio('jump', 'assets/game-jump-frog/audios/jump.mp3');
    this.load.audio('croar', 'assets/game-jump-frog/audios/croar.mp3');
    this.load.audio('splash', 'assets/game-jump-frog/audios/hundimento.mp3');
    this.load.audio('success', 'assets/game-jump-frog/audios/success.mp3');
  }

  create() {
    this.add.image(480, 250, 'whater').setScale(1.2);
    this.add.image(400, 430, 'frog').setScale(0.3);
    // Obtener el contenido SVG
    const svgContent = this.cache.text.get('bordeBox');

    // Crear elemento DOM con Phaser
    const svgElement = this.add.dom(400, 130).createFromHTML(svgContent);
    // Ajustar propiedades si es necesario
    svgElement.setOrigin(0.5, 0.5); // Centrar
    svgElement.setScale(0.7); // Ajustar escala
    svgElement.setAngle(180);

    this.add.dom(
      400,
      58,
      'p',
      ' background-color :rgb(103, 165, 22); color:white; width:800px; height: 114px; padding:10px; text-align: center',
      'Saca la máxima puntuación ayudando a la rana a cruzar el lago saltando sobre el nenúfar que contine la respuesta correcta. Tienes tres opciones por cada pregunta. Si la respuesta escogida es correcta podrás seguir avanzando para llegar a la orilla; si, por el contrario, es incorrecta te hundirás. ¡Exitos en el recorrido!'
    );

    const botonStart = this.add.dom(400, 200, 'button', '', 'Jugar') as Phaser.GameObjects.DOMElement;
    botonStart.setInteractive();
    botonStart.setInteractive();
    botonStart.setOrigin();
    botonStart.setClassName('gameFrog__botonStart');

    this.tweens.add({
      targets: botonStart,
      duration: 1000,
      scaleX: 1.2,
      scaleY: 1.2,
      ease: 'Sine.easeInOut',
      loop: -1,
      yoyo: true
    });
    const htmlButton = botonStart.node as HTMLElement;

    // Agregar eventos hover
    htmlButton.addEventListener('mouseover', () => {
      htmlButton.style.backgroundColor = 'rgb(85, 138, 17)';
      htmlButton.style.boxShadow = 'gray 0px 3px 0px 0px';
      htmlButton.style.transform = 'translateY(2px)';
    });

    htmlButton.addEventListener('mouseout', () => {
      htmlButton.style.backgroundColor = 'rgb(103, 165, 22)';
      htmlButton.style.boxShadow = 'gray 0px 5px 0px 0px';
      htmlButton.style.transform = 'translateY(0)';
    });

    htmlButton.addEventListener('click', () => {
      const containerMainScene = document.querySelector('.gameFrog__container') as HTMLElement;
      // console.log(containerMainScene);
      containerMainScene.setAttribute('tabindex', '-1');
      containerMainScene.focus();
      this.scene.start('gameScene');
    });
    const fullScreenBtn = this.add.dom(720, 525, 'button', '', '') as Phaser.GameObjects.DOMElement;
    fullScreenBtn.setInteractive();
    fullScreenBtn.setOrigin();
    fullScreenBtn.setClassName('gameFrog__btnFullScreen');
    fullScreenBtn.node.setAttribute('aria-label', 'Pantalla completa');
    fullScreenBtn.node.setAttribute('aria-pressed', 'false');
    const HtmlfullScreenBtn = fullScreenBtn.node as HTMLElement;
    HtmlfullScreenBtn.addEventListener('click', () => {
      if (!this.scale.isFullscreen) {
        this.scale.startFullscreen();
      } else {
        this.scale.stopFullscreen();
      }
    });

    // Asegurar que se escale automáticamente
    this.scale.scaleMode = Phaser.Scale.FIT;
    this.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
    this.scale.fullscreenTarget = document.body;

    const containerSettings = this.add.dom(0, 0, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerSettings.setInteractive();
    containerSettings.setOrigin();
    containerSettings.setClassName('gameFrog__containerSettingshtml');
    const htmlContainerSettings = containerSettings.node as HTMLElement;

    // Agregar HTML directamente
    htmlContainerSettings.innerHTML = `
    <div  class="gameFrog__containerSettings">
      <div class="gameFrog__containerTittle">
      <span>
          <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#FFFFFF"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg>
      </span>
        <h2 >Opciones</h2>
      </div>
      <div class="gameFrog__sound">
        <div class="gameFrog__containerSound">
          <button class="gameFrog__buttonSound" aria-label="Sonido">
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFFFFF"><path d="M560-131v-68.67q94.67-27.33 154-105 59.33-77.66 59.33-176.33 0-98.67-59-176.67-59-78-154.33-104.66V-831q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm426.67 45.33v-332Q599-628 629.5-582T660-480q0 55-30.83 100.83-30.84 45.84-82.5 64.5ZM413.33-634l-104 100.67H186.67v106.66h122.66l104 101.34V-634Zm-96 154Z"/></svg>        </button>
          <button class="gameFrog__buttonSound2">Sonido</button>
        </div>
        <div class="gameFrog__ocultar" >
          <div class="gameFrog__general" role="region" aria-labelledby="audioSettingsTitleGeneral">
            <p id="audioSettingsTitleGeneral">Audio General</p>
            <label to="audioGeneral" class="gameFrog__switch" aria-label="activar o desactivar el audio general">
              <input id="audioGeneral" class="gameFrog__inputGeneral" type="checkbox" aria-checked="false aria-label ="activar o desactivar el audio general">
              <span class="gameFrog__slider gameFrog__round"></span>
            </label>
          </div>
          <div class="gameFrog__specific" role="region" aria-labelledby="audioSettingsTitleEspecifico">
            <p id="audioSettingsEspesifico">Audio Especifico</p>
            <label to="specifico" class="gameFrog__switch gameFrog__especific" aria-label="activar o desactivar el audio especifico">
              <input id="specifico" class="gameFrog__inputSpecific" type="checkbox" aria-checked="false" aria-label ="activar o desactivar el audio especifico" >
              <span class="gameFrog__slider gameFrog__round"></span>
            </label>
          </div>
        </div>

      </div>
      <div class="gameFrog__instrucciones">
        <div class="gameFrog__containerSound">
          <button aria-label="instrucciones" class="gameFrog__buttonSound gameFrog__btnInstruction1">
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFFFFF"><path d="M448.67-280h66.66v-240h-66.66v240Zm31.32-316q15.01 0 25.18-9.97 10.16-9.96 10.16-24.7 0-15.3-10.15-25.65-10.16-10.35-25.17-10.35-15.01 0-25.18 10.35-10.16 10.35-10.16 25.65 0 14.74 10.15 24.7 10.16 9.97 25.17 9.97Zm.19 516q-82.83 0-155.67-31.5-72.84-31.5-127.18-85.83Q143-251.67 111.5-324.56T80-480.33q0-82.88 31.5-155.78Q143-709 197.33-763q54.34-54 127.23-85.5T480.33-880q82.88 0 155.78 31.5Q709-817 763-763t85.5 127Q880-563 880-480.18q0 82.83-31.5 155.67Q817-251.67 763-197.46q-54 54.21-127 85.84Q563-80 480.18-80Zm.15-66.67q139 0 236-97.33t97-236.33q0-139-96.87-236-96.88-97-236.46-97-138.67 0-236 96.87-97.33 96.88-97.33 236.46 0 138.67 97.33 236 97.33 97.33 236.33 97.33ZM480-480Z"/></svg></button>
          <button class="gameFrog__buttonSound2 gameFrog__btnInstruction2">Instrucciones</button> </div>
        <div class="gameFrog__ocultar2">
          <p>Salta a cualquier lugar haciendo clic con el botón principal del ratón.
          También puedes hacerlo usando las teclas tab para seleccionar la opción que crea que es  correcta y enter para verificar
          si la respuesta es correcta. Para devolverse use las techas  shift + tab</p>
          <img src="./assets/images/teclado1.png" alt="uso de teclas flecha arriba, izquierda, derecha">
        </div>
    </div>
    `;

    const button = document.querySelector('.gameFrog__buttonSound');
    const button2 = document.querySelector('.gameFrog__buttonSound2');
    const buttonInstruction1 = document.querySelector('.gameFrog__btnInstruction1');
    const buttonInstruction2 = document.querySelector('.gameFrog__btnInstruction2');

    button?.addEventListener('click', handleClickSound);
    button2?.addEventListener('click', handleClickSound);
    buttonInstruction1?.addEventListener('click', handleClickInformation);
    buttonInstruction2?.addEventListener('click', handleClickInformation);
    let openSound: boolean = false;
    let openInformation: boolean = false;
    function handleClickSound() {
      openSound = !openSound;
      const sound = document.querySelector('.gameFrog__sound') as HTMLElement;
      const ocultar = document.querySelector('.gameFrog__ocultar') as HTMLElement;
      if (sound) {
        if (openSound) {
          ocultar.style.display = 'block';
          sound.style.height = '200px';
        } else {
          ocultar.style.display = 'none';
          sound.style.height = '85px';
        }
      }
    }
    function handleClickInformation() {
      openInformation = !openInformation;
      const ocultar2 = document.querySelector('.gameFrog__ocultar2') as HTMLElement;

      if (ocultar2) {
        if (openInformation) {
          ocultar2.style.display = 'none';
          ocultar2.style.padding = '0px';
          ocultar2.style.height = '0px';
          ocultar2.style.transition = 'height 3s ease';
        } else {
          ocultar2.style.display = 'block';
          ocultar2.style.padding = '1rem';
          ocultar2.style.height = '200px';
          ocultar2.style.transition = 'height 3s ease';
          ocultar2.style.overflow = 'hidden';
        }
      }
    }
    // En tu escena de Phaser
    let openModal = false;

    const botonConfig = this.add.dom(770, 525, 'button', '', '') as Phaser.GameObjects.DOMElement;
    botonConfig.setInteractive();
    botonConfig.setOrigin();
    botonConfig.setClassName('gameFrog__botonconfig');
    botonConfig.node.setAttribute('aria-label', 'configuración y instrucciones');
    botonConfig.node.setAttribute('aria-pressed', 'false');
    const btnConfig = botonConfig.node as HTMLElement;
    btnConfig.addEventListener('click', () => {
      openModal = !openModal;
      const divHtml = document.querySelector('.gameFrog__containerSettings') as HTMLElement;
      if (divHtml) {
        divHtml.setAttribute('tabindex', '-1'); // Hacer que el elemento sea enfocable
      }
      if (openModal) {
        console.log('abrir modal');
        divHtml.style.display = 'block';
        divHtml.style.transition = 'top 0.3s ease';
        divHtml.focus();
      } else {
        console.log('cerrar modal');
        divHtml.style.display = 'none';
        btnConfig.focus();
      }
    });

    this.tweens.add({
      targets: botonConfig,
      duration: 1000,
      scaleX: 1.2,
      scaleY: 1.2,
      ease: 'Sine.easeInOut',
      loop: 0,
      yoyo: true
    });

    //logica para el sonido

    const toggleSwitch = document.querySelector('.gameFrog__inputGeneral') as HTMLInputElement;
    const toggleSwitch2 = document.querySelector('.gameFrog__inputSpecific') as HTMLInputElement;
    // Función para actualizar el estado global y el localStorage
    // Función para actualizar el estado de la música
    function updateSwitchState(isChecked: boolean) {
      globalState.generalMusic = isChecked;
      localStorage.setItem('toggleSwitchState', isChecked.toString());
    }
    function updateSwitchState2(isChecked2: boolean) {
      globalState.specificMusic = isChecked2;
      localStorage.setItem('toggleSwitchState2', isChecked2.toString());
    }

    // Cargar estado almacenado
    function loadSwitchState() {
      const savedState = localStorage.getItem('toggleSwitchState');
      if (savedState !== null) {
        const isChecked = savedState === 'true';
        toggleSwitch.checked = isChecked;
        updateSwitchState(isChecked);
      }
    }
    function loadSwitchState2() {
      const savedState = localStorage.getItem('toggleSwitchState2');
      if (savedState !== null) {
        const isChecked2 = savedState === 'true';
        toggleSwitch2.checked = isChecked2;
        updateSwitchState2(isChecked2);
      }
    }

    toggleSwitch.addEventListener('change', function () {
      updateSwitchState(this.checked);
    });
    toggleSwitch2.addEventListener('change', function () {
      updateSwitchState2(this.checked);
    });
    this.scene.get('MainScene')?.events.emit('updateMusic');

    loadSwitchState();
    loadSwitchState2();

    // Cargar estado del segundo switch
  }

  update() {}
}
