import { useEffect, useRef } from 'react';

import PhaserGame from './core/main'; // Importa el juego

import './pathOfWisdom.css';


/**
 * El componente GameCanvas sirve como contenedor para el juego de Phaser.
 * Inicializa la instancia del juego de Phaser y se asegura de limpiar correctamente al desmontar el componente.
 */
const PathOfWisdom: React.FC = () => {
  // Referencia al contenedor div para el juego
  const gameContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verifica si el contenedor del juego está disponible
    if (!gameContainer.current) return;

    // Crea una nueva instancia del juego de Phaser
    const game = new PhaserGame(gameContainer.current);

    // Función de limpieza para destruir la instancia del juego al desmontar el componente
    return () => {
      game.destroy(true);
    };
  }, []);

  // Renderiza el contenedor del juego
  return (
    <>
      <div
        className="cityOfWisdom__container"
        aria-label="">
        <div ref={gameContainer} className="cityOfWisdom__game-container" />
      </div>
    </>
  );
};

export default PathOfWisdom;