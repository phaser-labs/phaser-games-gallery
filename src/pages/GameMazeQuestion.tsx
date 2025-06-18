import { BtnBack } from '@/components/btnBack';
import { questionsGameMaze } from '@/data/data-game-maze';
import GameMaze from '@/games/game-maze/GameMaze';

export const GameMazeQuestion = () => {
  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Game Maze</h1>
      </div>

      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
          <h2 className=" u-fs-400">Descripción del juego:</h2>
          <p>
            Este es un juego que combina la navegación en laberintos con la resolución de trivias. La jugabilidad se
            centra en guiar a un personaje a través de un mapa mientras se esquivan varios monstruos que lo patrullan.
            El método para responder a las preguntas del juego es físico: cada una de las cuatro opciones de respuesta
            (A, B, C, D) está asignada a una ubicación distinta en el mapa. El desafío principal consiste en identificar
            la respuesta correcta y luego planificar y ejecutar una ruta segura hacia la celda correspondiente. El éxito
            depende de la capacidad del jugador para maniobrar a través del laberinto y evadir a los enemigos en el
            camino.
          </p>
          <p className="u-fs-300 u-font-bold">Características:</p>
          <ul className="u-flow list_star">
            <li>
              <p>
                <strong>Preguntas:</strong> Se podrá realizar todas las preguntas posibles.
              </p>
            </li>
            <li>
              <p>
                <strong>Respuestas:</strong> Se pueden tener unicamente 4 opciones de respuestas.
              </p>
            </li>
            <li>
              <p>
                <strong>Recomendaciones:</strong> Ideal la utilización de opciones largas.
              </p>
            </li>
          </ul>
        </div>
        <GameMaze questions={questionsGameMaze} />
      </div>
    </>
  );
};
