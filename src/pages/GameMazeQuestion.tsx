import { useCallback, useState } from 'react';

import { BtnBack } from '@/components/btnBack';
import { questionsGameMaze } from '@/data/data-game-maze';
import GameMaze from '@/games/game-maze/game-maze';
import { GameResult } from '@/games/game-maze/utils/types';
import { ModalFeedback } from '@/shared/core/components';

type FeedbackContent = {
  title?: string;
  description: string;
  audio: string;
};

const dataFeedbackQuestion1: { [key: string]: FeedbackContent } = {
  a: {
    title: 'cueva fallido A',
    description: 'No lo hiciste bien. ¡Muy mal!',
    audio: 'assets/audios/errorA.mp3'
  },
  b: {
    title: 'cueva fallido B',
    description: '¡Muy mal!',
    audio: 'assets/audios/errorB.mp3'
  },
  c: {
    title: '¡Excelente cueva!',
    description: 'Has encontrado la cueva correcta. ¡Sigue así!',
    audio: 'assets/audios/successC.mp3'
  },
  d: {
    title: 'cueva fallido D',
    description: '¡Muy maaaaaaaal!',
    audio: 'assets/audios/errorD.mp3'
  }
};

export const GameMazeQuestion = () => {
  const [modalOpen, setModalOpen] = useState<'success' | 'wrong' | null>(null);
  const [currentResult, setCurrentResult] = useState<GameResult | null>(null);
  const closeModal = () => {
    setModalOpen(null);
  };

  const handleResult = useCallback((result: GameResult) => {
    console.log(result);
    setCurrentResult(result);
    setModalOpen(result.isCorrect ? 'success' : 'wrong');
  }, []);

  const getModalFeedbackContent = () => {
    if (!currentResult) return { title: '', description: '', audio: '' };

    // Caso especial para la pregunta 1
    if (currentResult.questionIndex === 0) {
      if (currentResult.selectedAnswer === 'c') {
        return dataFeedbackQuestion1.c;
      } else {
        return dataFeedbackQuestion1[currentResult.selectedAnswer as 'a' | 'b' | 'd'];
      }
    } else {
      /* Resto de preguntas */
      return {
        description: currentResult.isCorrect ? 'Has respondido correctamente' : 'Has respondido incorrectamente',
        audio: currentResult.isCorrect ? 'assets/audios/success.mp3' : 'assets/audios/error.mp3'
      };
    }
  };

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
        <GameMaze questions={questionsGameMaze} onResult={handleResult} />
      </div>

      <ModalFeedback
        type={currentResult?.isCorrect ? 'success' : 'wrong'}
        onClose={closeModal}
        finalFocusRef="#main"
        audio={getModalFeedbackContent().audio}
        isOpen={modalOpen !== null}>
        <h2>{getModalFeedbackContent().title ?? ''}</h2>
        <p>{getModalFeedbackContent().description}</p>
      </ModalFeedback>

      {/*  <ModalFeedback
        type="success"
        onClose={closeModal}
        finalFocusRef="#main"
        audio="assets/audios/success.mp3"
        isOpen={modalOpen === 'success'}>
        <p>Has respondido correctamente</p>
      </ModalFeedback>

      <ModalFeedback
        type="wrong"
        onClose={closeModal}
        finalFocusRef="#main"
        audio="assets/audios/error.mp3"
        isOpen={modalOpen === 'wrong'}>
        <p>Has respondido incorrectamente</p>
      </ModalFeedback> */}
    </>
  );
};
