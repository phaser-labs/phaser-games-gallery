import Phaser from 'phaser'; // Importamos Phaser

import { config } from './config/gameConfig';
import {
  BookStoreScene,
  CarworkshopScene,
  ChurchScene,
  CoffeScene,
  FireStationScene,
  GasStationScene,
  HouseScene,
  InstructionsScene,
  Main,
  Menu,
  MuseumScene,
  PoliceScene,
  ShoolScene,
  StoreScene
} from './scenes';

export default class PhaserGame extends Phaser.Game {
  constructor(parentElement: HTMLDivElement) {
    super({
      ...config, // 📌 Se usa la configuración definida en `gameConfig.ts`
      parent: parentElement, // Se monta en un div de React
      scene: [
        Menu,
        Main,
        BookStoreScene,
        MuseumScene,
        StoreScene,
        GasStationScene,
        CarworkshopScene,
        ChurchScene,
        CoffeScene,
        HouseScene,
        FireStationScene,
        ShoolScene,
        PoliceScene,

        InstructionsScene
      ]
    });
  }
}
