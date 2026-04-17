import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

import type { Advice, GameResult } from './types/types';
import { loadAdvices } from './global-state';
import PhaserGame from './main';

import css from './styles/kitty-farm.module.css';

interface KittyGameProps {
  advices: Advice[];
  gameId?: string;
  onResult?: (result: GameResult) => void;
}

export function KittyFarm({ advices, gameId, onResult }: KittyGameProps) {
  const gameContainer = useRef<HTMLDivElement>(null);

  const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;
  const phaserGameInstanceRef = useRef<PhaserGame | null>(null);

  const containerId = `game-kitty-farm-${gameId ?? 'default'}`;

  // 1) Cargar questions al globalState
  useEffect(() => {
    if (advices?.length) loadAdvices(advices);
  }, [advices]);

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
  }, [containerId, advices, onResult, gameEvents]);

  return (
    <>
      <div className={css['gameKittyFarm_container']} id="gameKittyFarm-id">
        <div id="game-announcer" aria-live="polite" aria-atomic="true" className={css['visually-hidden']} />
        <div ref={gameContainer} id={containerId} tabIndex={-1} />
      </div>
    </>
  );
}
