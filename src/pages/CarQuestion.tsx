import { useCallback, useState } from 'react';
import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { dataQuestions } from '@/data/data-game-car-question';
import GameCarQuestion, { GameResult } from '@/games/game-car-quiz/game-car-quiz';
import { ModalFeedback } from '@/shared/core/components';

type FeedbackContent = {
  title?: string;
  description: string;
  audio: string;
};

const dataFeedbackQuestion1: { [key: string]: FeedbackContent } = {
  a: {
    title: 'Respuesta fallida en A',
    description: 'No lo hiciste bien. ¡Muy mal!',
    audio: 'assets/audios/errorA.mp3'
  },
  b: {
    title: '¡Excelente respuesta!',
    description: 'Has encontrado la respuesta correcta. ¡Sigue así!',
    audio: 'assets/audios/successB.mp3'
  },
  c: {
    title: 'Respuesta incorrecta en C',
    description: 'Has encontrado la respuesta incorrecta. ¡Sigue intentando!',
    audio: 'assets/audios/errorC.mp3'
  }
};


export const CarQuestion = () => {
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
  
      // Caso especial para la pregunta de indice 1
      if (currentResult.questionIndex === 0) {
        if (currentResult.selectedAnswer === 'b') {
          return dataFeedbackQuestion1.b;
        } else {
          return dataFeedbackQuestion1[currentResult.selectedAnswer as 'a' | 'c' ];
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
        <h1>Car Question</h1>
      </div>
      <div className={'container'}>
        <Row justifyContent="center" alignItems="center">
          <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
            <h2 className=" u-fs-400">Descripción del juego:</h2>
            <p>
              Este es un juego que combina la exploración de un entorno urbano con un sistema de preguntas y
              respuestas. El jugador se pone al volante de un coche y navega por una ciudad en busca de cuatro
              personajes específicos. Cada uno de estos personajes presenta un desafío intelectual en forma de pregunta
              de opción múltiple. La mecánica principal consiste en conducir hasta encontrar a estos individuos,
              interactuar con ellos para recibir la pregunta y luego elegir la respuesta correcta. Un acierto recompensa
              al jugador con una estrella. La meta final es demostrar tu conocimiento acumulando las cuatro estrellas
              disponibles, una por cada habitante ayudado, completando así la misión en la ciudad.
            </p>
            <p className="u-fs-300 u-font-bold">Características:</p>
            <ul className="u-flow list_star">
              <li>
                <p>
                  <strong>Preguntas:</strong> Se podrá realizar multiples preguntas.
                </p>
              </li>
              <li>
                <p>
                  <strong>Respuestas:</strong> Se pueden tener desde 2 hasta 6 opciones de respuesta a la vez.
                </p>
              </li>
            </ul>
          </div>
          <Col xs="8">
            <GameCarQuestion data={dataQuestions} onResult={handleResult} />
          </Col>
        </Row>
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
      
    </>
  );
};
