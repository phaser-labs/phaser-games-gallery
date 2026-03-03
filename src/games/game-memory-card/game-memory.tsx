

import { useEffect, useRef } from 'react';

import PhaserGame from './main/main';
import { ICardData } from './utils/types';

import "./stylesMemory.css";


interface GameMemoryProps {
  gameId?: string;
  cards?: ICardData[];
  onResult?: (isCorrect: boolean) => void;
}

// Helper para la región ARIA Live
const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
};

export const GameMemory = ({ gameId, cards, onResult }: GameMemoryProps) => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const phaserGameInstanceRef = useRef<PhaserGame | null>(null);
  const hasInitializedPhaser = useRef(false);

  const containerId = `game-container-${gameId || 'default'}`;


 useEffect(() => {
    if (!gameContainer.current || hasInitializedPhaser.current) {
        return;
    }
    const game = new PhaserGame({ containerId, cards, onResult }); 
    phaserGameInstanceRef.current = game;
    hasInitializedPhaser.current = true;
    announce('¡Bienvenido al juego de memoria!, utiliza las flechas del teclado para mover las cartas, presiona la barra espaciadora para abrir las cartas. Para iniciar el juego, presiona la barra espaciadora o enter.');
    return () => {
      if (phaserGameInstanceRef.current) {
        phaserGameInstanceRef.current.destroy(true);
        phaserGameInstanceRef.current = null;
      }
      
      hasInitializedPhaser.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps 

  return (
    <div className="gameMemory_container">
      {/* Región ARIA Live polite — eventos de juego no críticos */}
      <div
        id="game-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Región ARIA Live assertive — eventos críticos: victoria, derrota */}
      <div
        id="game-announcer-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Contador de vidas oculto — actualizado dinámicamente desde Play.ts */}
      <span id="lives-counter" aria-live="polite" className="sr-only" />

      <div ref={gameContainer} id={containerId} tabIndex={0} />

      {/* Instrucciones de teclado visibles */}
      <p className="memory-keyboard-hint" aria-label="Instrucciones de teclado">
        Mover: <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> o <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        Voltear carta: <kbd>Space</kbd> o <kbd>Enter</kbd>
      </p>

    </div>
  );
};
