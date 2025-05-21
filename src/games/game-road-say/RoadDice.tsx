import { useEffect, useRef } from 'react';

import PhaserGame from './core/main'; // Importa el juego
import { globalState } from './core/utils/GlobalState'; // Importa el estado global

import './roadDice.css';
interface DataGameRoadDice {
  id: number;
  question: string;
  options: {
    id: string;
    label: string;
    state: 'wrong' | 'success';
  }[];
}
interface FrogJumpingProps {
  dataGameRoadDice: DataGameRoadDice[];
}
/**
 * El componente GameCanvas sirve como contenedor para el juego de Phaser.
 * Inicializa la instancia del juego de Phaser y se asegura de limpiar correctamente al desmontar el componente.
 */
const RoadDice: React.FC<FrogJumpingProps> = ({ dataGameRoadDice }) => {
  globalState.data = dataGameRoadDice;
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
        className="roadDice__container"
        aria-label="Juego que consta de un trayecto que tiene que caminar un avatar  con el valor de se va sumando en cada lazada de un dado  hay algunos campos del caminido donde saldra una ventana modal con una pregunta  si la respuesta es incorrecta  el avatar se devolvera al inicio de lo contrario avanzara">
        <div ref={gameContainer} className="roadDice__game-container" />
      </div>
    </>
  );
};

export default RoadDice;