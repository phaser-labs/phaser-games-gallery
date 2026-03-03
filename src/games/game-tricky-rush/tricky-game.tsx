import { useCallback, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

import type { GameResult, SceneConfig, TypeWord } from './types/types';
import { announce } from './utils/announce';
import { themeManager } from './utils/theme-manager';
import { SceneSelector } from './components';
import { loadQuestions } from './global-state';
import PhaserGame from './main';

import css from './styles/tricky.module.css';

interface TrickyGameProps {
  words: TypeWord[];
  gameId?: string;
  onResult?: (result: GameResult) => void;
}

export function TrickyGame({ words, gameId, onResult }: TrickyGameProps) {
  const gameContainer = useRef<HTMLDivElement>(null);

  const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;
  const phaserGameInstanceRef = useRef<PhaserGame | null>(null);

  const containerId = `game-tricky-${gameId ?? 'default'}`;

  const [phaserKey, setPhaserKey] = useState(0);

  // 1) Cargar questions al globalState
  useEffect(() => {
    if (words?.length) loadQuestions(words);
  }, [words]);

  // 2) Manejar cambio de escena
  const handleSceneChange = useCallback(
    (scene: SceneConfig) => {
      themeManager.setTheme(scene.id);

      gameEvents.emit('scene-changed', { scene });

      setPhaserKey((k) => k + 1);

      announce(`Mundo cambiado a ${scene.name}`);
    },
    [gameEvents]
  );

  // 3) Crear Phaser (reinicia cuando cambia phaserKey)
  useEffect(() => {
    if (!gameContainer.current) return;

    if (phaserGameInstanceRef.current) {
      phaserGameInstanceRef.current.destroy(true);
      phaserGameInstanceRef.current = null;
    }

    phaserGameInstanceRef.current = new PhaserGame({
      gameId: containerId,
      onResult,
      gameEvents
    });

    return () => {
      phaserGameInstanceRef.current?.destroy(true);
      phaserGameInstanceRef.current = null;
    };
  }, [containerId, phaserKey, words, onResult, gameEvents]);

  return (
    <>
      {/* Selector de mundos */}
      <div className={css['theme-selector-container']}>
        <SceneSelector onSceneChange={handleSceneChange} gameEvents={gameEvents} />
      </div>

      <div className={css['gameTricky_container']} id="gameTricky-id">
        <div id="game-announcer" aria-live="polite" aria-atomic="true" className={css['visually-hidden']} />
        <div key={phaserKey} ref={gameContainer} id={containerId} tabIndex={-1} />
      </div>
    </>
  );
}
