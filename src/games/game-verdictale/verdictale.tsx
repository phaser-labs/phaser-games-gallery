import { useEffect, useRef } from 'react';

import { AnswerResult, Question } from './types/types';
import { loadQuestions } from './global-state';
import PhaserGame from './main';

import css from './styles/verdictale.module.css';

interface VerdictableProps {
  questions: Question[];
  gameId?: string;
  onResult?: (result: AnswerResult) => void;
}

export function Verdictale({ questions, gameId, onResult }: VerdictableProps) {
  const gameContainer = useRef<HTMLDivElement>(null);

  const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;
  const phaserGameInstanceRef = useRef<PhaserGame | null>(null);

  const containerId = `game-verdictale-${gameId ?? 'default'}`;

  // 1) Cargar questions al globalState
  useEffect(() => {
    if (questions?.length) loadQuestions(questions);
  }, [questions]);

  // 2) Crear Phaser (reinicia cuando cambia phaserKey)
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
  }, [containerId, questions, onResult, gameEvents]);

  return (
    <>
      <div className={css['gameVerdictale_container']} id="gameVerdictale-id">
        <div id="game-announcer" aria-live="polite" aria-atomic="true" className={css['visually-hidden']} />
        <div ref={gameContainer} id={containerId} tabIndex={-1} />
      </div>
    </>
  );
}
