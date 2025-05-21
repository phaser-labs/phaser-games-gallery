import { useEffect, useRef } from 'react';

import PhaserGame from './core/main'; // Importa el juego
import { globalState } from './core/utils/GlobalState'; // Importa el estado global

import './frogJumping.css';
interface DataGameFrog {
  id: number;
  question: string;
  options: {
    id: string;
    label: string;
    state: 'wrong' | 'success';
  }[];
}
interface FrogJumpingProps {
  dataGameFrog: DataGameFrog[];
}
/**
 * El componente GameCanvas sirve como contenedor para el juego de Phaser.
 * Inicializa la instancia del juego de Phaser y se asegura de limpiar correctamente al desmontar el componente.
 */
const FrogJumping: React.FC<FrogJumpingProps> = ({ dataGameFrog }) => {
  globalState.data = dataGameFrog;
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
        className="gameFrog__container"
        aria-label="Juego de rana  educativa, navegue por el contenido, encontrara una pregunta  con sus posibles respuestas, seleccione la respuesta correcta usando las tecla enter.">
        <div ref={gameContainer} className="gameFrog__game-container" />
      </div>
    </>
  );
};

export default FrogJumping;
