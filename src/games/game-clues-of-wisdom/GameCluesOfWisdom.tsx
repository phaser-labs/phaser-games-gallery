
import { useEffect, useRef } from 'react';

import PhaserGame from './main/main';
import { LevelStructure } from './utils/types';

import './styles/gamePistas.css';

interface GameCluesProps {
  data: LevelStructure[];
  gameId: string;
}

// Helper para la región ARIA Live
/* const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
}; */

export const GameCluesOfWisdom = ({ data, gameId }: GameCluesProps) => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;
  const phaserGameInstanceRef = useRef<PhaserGame | null>(null); // Tipo PhaserGame

  // Usa el gameId para el containerId, o uno por defecto si gameId no se provee
  const uniqueContainerId = `game-container-${gameId || 'default-pistas'}`;


  useEffect(() => {
    if (!gameContainer.current || !data || data.length === 0) { // Añade chequeo para data
        console.warn('GamePistas: No hay contenedor, datos o los datos están vacíos. No se iniciará Phaser.');
        return;
    }

    // Asegúrate de que no haya una instancia previa corriendo en el mismo contenedor si gameId cambia
    // (Aunque el cleanup del useEffect debería manejarlo)
    if (phaserGameInstanceRef.current) {
        phaserGameInstanceRef.current.destroy(true);
        phaserGameInstanceRef.current = null;
    }


    // Pasa allSentenceChallengesData y targetChallengeId
    const game = new PhaserGame({
      containerId: uniqueContainerId, // Usa el ID único
      gameEvents,
      initialMuteState: false,
      allSentenceChallengesData: data, // Aquí pasas el array completo
    });
    phaserGameInstanceRef.current = game;

    return () => {
      if (phaserGameInstanceRef.current) {
        phaserGameInstanceRef.current.destroy(true);
        phaserGameInstanceRef.current = null;
      }
    };
  }, [uniqueContainerId, gameEvents, data]);

  return (
    <div className="gamePistas_container">
      <div
        id="game-announcer"
        aria-live="polite"
        aria-atomic="true"
        className='visually-hidden'></div>
      <div ref={gameContainer} id={uniqueContainerId} tabIndex={0} />
    </div>
  );
};
