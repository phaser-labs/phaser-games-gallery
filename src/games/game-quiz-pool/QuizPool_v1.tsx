import { useEffect, useRef } from 'react';

import {Quiz} from './types/AppTypes';
import PhaserGame from './versiones/version1/main'; // Importa el juego

// import { globalState } from './core/utils/GlobalState'; // Importa el estado global
import css from './QuizPool.module.css';
export const QuizPool_v1 = ({ dataGame }: { dataGame: Quiz[] }) => {
  // Referencia al contenedor div para el juego
  const gameContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Verifica si el contenedor del juego está disponible
    if (!gameContainer.current) return;

    // Crea una nueva instancia del juego de Phaser
    const game = new PhaserGame(gameContainer.current, dataGame);


    // Función de limpieza para destruir la instancia del juego al desmontar el componente
    return () => {
      game.destroy(true);
    };
  }, [dataGame]);
  return (
    <>
      <div id="game-announcer" aria-live="polite" aria-atomic="true" className={css['u-sr-only']}></div>
      <div
        className={css.quizPool__container}
        aria-label="Pool Quiz es un juego educativo desarrollado en Phaser 3 con React, que combina la mecánica clásica del billar con dinámicas de preguntas y respuestas. El jugador controla un taco de billar para golpear la bola blanca y dirigir la bola objetivo hacia la tronera que corresponde a la respuesta correcta de cada pregunta.">
        <div ref={gameContainer} className={`game-container ${css.quizPool__gameContainer}`} />
      </div>
    </>
  );
};
