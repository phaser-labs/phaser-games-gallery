import { useState } from 'react';

import { useGameManagerStore } from '../core/GameManager';
import { EventBus } from '../EventBus';
import { SpaceTyperGame } from '../SpaceTyper';

import { HUD } from './HUD';

import css from '../styles/space-typer.module.css';

export function SpaceTyperApp() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameState = useGameManagerStore((state) => state.gameState);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    EventBus.emit('toggle-mute');
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    EventBus.emit('toggle-pause', !isPaused);
  };

  const goToMenu = () => {
    if (isPaused) {
      setIsPaused(false);
      EventBus.emit('toggle-pause', false);
    }
    EventBus.emit('go-home');
  };

  return (
    <main>
    

      <section className={css['game-frame']}>
        <header className={css['game-frame__header']}>
          <div>
            <p className={css['game-frame__eyebrow']}>Desafio de escritura</p>
            <h1 className={css['game-frame__title']}>Space Typer</h1>
          </div>
          <div className={css['game-frame__intro']} role="region" aria-label="Introducción al juego">
            <p className={css['game-frame__subtitle']}>
              Escribe las palabras de cada alien para destruirlos antes de que lleguen a la Tierra.
            </p>
            <div className={css['game-frame__ui']} role="group" aria-label="Controles del juego">
              <button 
                title='Mute/Unmute Musica' 
                id='music' 
                className={css['game-frame__btn_ui']} 
                onClick={toggleMute}
                style={{ opacity: isMuted ? 0.5 : 1 }}
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-x-icon lucide-volume-x"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume2-icon lucide-volume-2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>
                )}
              </button>
               <button 
                title='Ir al Menu'
                id='menu' 
                className={css['game-frame__btn_ui']} 
                onClick={goToMenu}
                disabled={gameState === 'quieto'}
                style={{ opacity: gameState === 'quieto' ? 0.5 : 1, cursor: gameState === 'quieto' ? 'not-allowed' : 'pointer' }}
              >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </button>
              <button 
                title='Pausar/Reanudar'
                id='pause' 
                className={css['game-frame__btn_ui']} 
                onClick={togglePause}
                disabled={gameState === 'quieto' || gameState === 'gameOver'}
                style={{ opacity: (gameState === 'quieto' || gameState === 'gameOver') ? 0.5 : 1, cursor: (gameState === 'quieto' || gameState === 'gameOver') ? 'not-allowed' : 'pointer' }}
              >
              {isPaused ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>
              )}
              </button>
            </div>
          </div>

        </header>

        <div className={css['game-frame__stage']} style={{ position: 'relative' }}>
          <SpaceTyperGame />
          <HUD />
        </div>
      </section>
    </main>
  );
}

export default SpaceTyperApp;