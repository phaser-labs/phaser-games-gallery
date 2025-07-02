import Phaser from 'phaser';

import { createSlider } from '../../../../../public/slider/slider';

import { Main } from './MainScene';
export class GasStationScene extends Phaser.Scene {
  constructor() {
    super('GasStationScene');
  }
  preload() {}

  create() {
    const mainScene = this.scene.get('MainScene') as Main;
    if (mainScene.backgroundMusic?.isPlaying) {
      mainScene.backgroundMusic.pause();
    }
    const title = this.add.text(600, -100, 'Gas Station', {
      fontFamily: 'pixel',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });

    title.setOrigin(0.5, 0);
    title.setDepth(2);

    this.tweens.add({
      targets: title,
      y: 10,
      duration: 800,
      ease: 'Back.easeOut'
    });
    const video = this.add.video(310, 280, 'gasStation');

    video.setDisplaySize(635, 520); // Ocupar todo el canvas
    video.setOrigin(0.5);
    video.setLoop(true); // Bucle infinito
    video.play(true); // true = reproducir automáticamente
    video.setMute(true); // false = reproducir automático
    const slider = this.add.dom(50, 60).createFromCache('slider');
    slider.setOrigin(0, 0);
    if (video.video) {
      video.video.playbackRate = 0.4;
    }
    const overlay = this.add.rectangle(0, 0, 1200, 800, 0x000000, 0.4);
    overlay.setOrigin(0);
    overlay.setDepth(1);
    // Agrega CSS manualmente al <head>
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'slider/slider.css';
    document.head.appendChild(link);

    const sliderData = [
      {
        title: 'Gas station',
        image: 'https://i1.sndcdn.com/artworks-000165384395-rhrjdn-t500x500.jpg',
        audio: 'assets/audio/audio1.mp3',
        description: 'We stopped at a gas station for fuel.'
      },
      {
        title: 'Fuel / Gasoline',
        image: 'https://i1.sndcdn.com/artworks-000185743981-tuesoj-t500x500.jpg',
        audio: 'assets/audio/audio2.mp3',
        description: 'I need to buy some fuel.'
      },
      {
        title: 'Diesel',
        image: 'https://i1.sndcdn.com/artworks-000158708482-k160g1-t500x500.jpg',
        audio: 'assets/audio/audio2.mp3',
        description: 'This truck runs on diesel.'
      },
      {
        title: 'Fuel pump',
        image: 'https://i1.sndcdn.com/artworks-000062423439-lf7ll2-t500x500.jpg',
        audio: 'assets/audio/audio2.mp3',
        description: 'Bomba de gasolina'
      },
      {
        title: 'Nozzle',
        image: 'https://i1.sndcdn.com/artworks-000028787381-1vad7y-t500x500.jpg',
        audio: 'assets/audio/audio2.mp3',
        description: 'He inserted the nozzle into the tank.'
      },
      {
        title: 'Gasoline meter',
        image: 'https://i1.sndcdn.com/artworks-000108468163-dp0b6y-t500x500.jpg',
        audio: 'assets/audio/audio2.mp3',
        description: 'The meter shows how many liters you’ve pumped.'
      },
      {
        title: 'Cashier',
        image: 'https://i1.sndcdn.com/artworks-000064920701-xrez5z-t500x500.jpg',
        audio: 'assets/audio/audio2.mp3',
        description: 'I paid the cashier for the gas.'
      }
    ];
    //Asegurarse de que el contenido esté disponible antes de aplicar lógica
    this.time.delayedCall(10, () => {
      createSlider(sliderData); // <- Ejecuta la lógica del slider con los datos
    });
    //boton de regresar  al mundo
    const html = `
     <form>
       <button
         name="goToMain"
         aria-label="Ir a MainScene"
         type="button"
         style="border-radius: 100px; padding: 5px;  cursor: pointer; display: flex; align-items: center; background-color:#ffffff; box-shadow: 0 0 10px rgb(0, 0, 0); border: none">
         <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill=rgb(0, 0, 0)><path d="m480-320 56-56-64-64h168v-80H472l64-64-56-56-160 160 160 160Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
       </button>
     </form>
   `;

    const domElement = this.add.dom(1060, 610).createFromHTML(html);
    const button = domElement.getChildByName('goToMain') as HTMLButtonElement;

    if (button) {
      button.addEventListener('click', () => {
        this.scene.start('MainScene');
      });
    }
  }
  update() {}
}
