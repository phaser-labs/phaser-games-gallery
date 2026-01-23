

import { useEffect, useRef } from 'react';

//import { ModalFeedback } from '@/shared/core/components';
import PhaserGame from './main/main';

import "./stylesMemory.css";


interface GameMemoryProps {
  gameId?: string;
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

export const GameMemory = ({gameId }: GameMemoryProps) => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const phaserGameInstanceRef = useRef<PhaserGame | null>(null);
  const hasInitializedPhaser = useRef(false);

  const containerId = `game-container-${gameId || 'default'}`;




 useEffect(() => {
    if (!gameContainer.current || hasInitializedPhaser.current) {
        return;
    }
    const game = new PhaserGame({ containerId }); 
    phaserGameInstanceRef.current = game;
    hasInitializedPhaser.current = true;
    announce('¡Bienvenido al juego de memoria!, utiliza las flechas del teclado para mover las cartas, presiona la barra espaciadora para abrir las cartas. Para iniciar el juego, presiona la barra espaciadora o enter.'); // Mensaje inicial para el lector de pantalla
    return () => {
      if (phaserGameInstanceRef.current) {
        phaserGameInstanceRef.current.destroy(true);
        phaserGameInstanceRef.current = null;
      }
      
      hasInitializedPhaser.current = false;
    };
  }, [containerId ]); 





  return (
    <div className="gameMemory_container">
      {/* Div oculto para anuncios ARIA Live */}
      <div
        id="game-announcer"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          padding: '0',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: '0'
        }}></div>
      

      <div ref={gameContainer} id={containerId} tabIndex={0} />

      {/* Modales

      <ModalFeedback
        type="success"
        isOpen={modalType === 'success'}
        onClose={closeModal}
        finalFocusRef="#main"
        audio={answerText.successAudio}>
        <p dangerouslySetInnerHTML={{ __html: answerText.correctText }}></p>
      </ModalFeedback>
      <ModalFeedback
        type="wrong"
        isOpen={modalType === 'wrong'}
        onClose={closeModal}
        finalFocusRef="#main"
        audio={answerText.wrongAudio}>
        <p dangerouslySetInnerHTML={{ __html: answerText.incorrectText }}></p>
      </ModalFeedback> 
      */}
    </div>
  );
};
