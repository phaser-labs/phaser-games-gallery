import { FC, useEffect, useState } from 'react';

import { SceneConfig } from '../types/types';
import { themeManager } from '../utils/theme-manager';

import css from './styles.module.css';

interface SceneSelectorProps {
  onSceneChange?: (scene: SceneConfig) => void;
  gameEvents?: Phaser.Events.EventEmitter;
}

export const SceneSelector: FC<SceneSelectorProps> = ({ onSceneChange, gameEvents }) => {
  const [currentScene, setCurrentScene] = useState<SceneConfig>(themeManager.getCurrentTheme());

  const availableScenes = themeManager.getAllThemes();

  useEffect(() => {
    const unsubscribe = themeManager.subscribe((theme) => {
      setCurrentScene(theme);
    });

    return unsubscribe;
  }, []);

  const handleSceneSelect = (scene: SceneConfig) => {
    themeManager.setTheme(scene.id);
    onSceneChange?.(scene);

    // Notificar a Phaser sobre el cambio de tema
    if (gameEvents) {
      gameEvents.emit('themeChanged', themeManager.getCurrentTheme());
    }
  };

  return (
    <div className={css['scene-selector']}>
      <div className={css['scene-selector-header']}>
        <span className={css['theme-icon']}>🎮</span>
        <span className={css['theme-label']}>Selecciona un mundo:</span>
      </div>

      <div className={css['scene-buttons-container']}>
        {availableScenes.map((scene) => {
          const previewImage = scene.assets.miniture;

          return (
            <button
              key={scene.id}
              className={`${css['scene-button']} ${currentScene.id === scene.id ? css.active : ''}`}
              onClick={() => handleSceneSelect(scene)}
              aria-label={`Seleccionar mundo ${scene.name}`}>
              {previewImage && (
                <img
                  src={`assets/game-tricky-tower/${previewImage}`}
                  alt={scene.name}
                  className={css['scene-preview']}
                />
              )}

              <span className={css['scene-name']}>{scene.name}</span>

              {currentScene.id === scene.id && <span className={css['scene-check']}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
