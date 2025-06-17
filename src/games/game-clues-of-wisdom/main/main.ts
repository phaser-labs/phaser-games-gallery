import Phaser from 'phaser';

import { config as baseGameConfig } from '../config/config';
import { Controls, EndGame, InstructionScene, Menu, PlayScene, PreloadScene, Settings, UIScene } from '../scenes';
import { VOLUME_REGISTRY_KEY, VOLUME_SETTINGS, VolumeState } from '../scenes/Settings';
import { LevelStructure } from '../utils/types';


interface CustomGameConfigOptions extends Phaser.Types.Core.GameConfig {
  containerId: string;
  gameEvents: Phaser.Events.EventEmitter;
  initialMuteState: boolean;
  allSentenceChallengesData?: LevelStructure[]; // Array de todos los desafío
}

export default class PhaserGame extends Phaser.Game {
  public gameEvents: Phaser.Events.EventEmitter;

  constructor(config: CustomGameConfigOptions) {
    const finalGameConfig: Phaser.Types.Core.GameConfig = {
      ...baseGameConfig,
      parent: config.containerId,
      scene: [PreloadScene, Menu, InstructionScene, Settings, Controls, PlayScene, UIScene, EndGame],
    };

    super(finalGameConfig);
    this.gameEvents = config.gameEvents;

 const savedVolumeState = this.registry.get(VOLUME_REGISTRY_KEY) as VolumeState | undefined;
    const initialState = savedVolumeState || 'full';
    const initialSetting = VOLUME_SETTINGS[initialState];
    if (this.sound && initialSetting) { // Verificar que sound y setting existan
        this.sound.mute = initialSetting.isMuted;
        this.sound.volume = initialSetting.level;
    }   if (config.allSentenceChallengesData && config.allSentenceChallengesData.length > 0) {
      this.registry.set('allSentenceChallenges', config.allSentenceChallengesData);
      console.log('PhaserGame: Datos de desafíos de frases recibidos:', config.allSentenceChallengesData);
      
      const firstChallenge = config.allSentenceChallengesData[0];
      this.registry.set('currentChallengeConfig', firstChallenge);
      console.log('PhaserGame: Usando el primer desafío por defecto:', firstChallenge);

    } else {
      this.registry.remove('allSentenceChallenges'); // Limpiar si no hay datos 
      this.registry.remove('currentChallengeConfig'); // Limpiar si no hay datos
      console.warn('PhaserGame: No se proporcionaron datos de desafíos de frases (allSentenceChallengesData) o el array está vacío.');
    }
  }
  
}
