import { useCallback, useState } from 'react';
import { Audio, Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import FrogJumping, { GameResult } from '@/games/game-jump-frog/FrogJumping';
import { ModalFeedback } from '@/shared/core/components';

import 'books-ui/styles';

import { dataGameFrog } from '../data/data-game-frog';

import '../styles/global.css';

type FeedbackContent = {
  title?: string;
  description: string;
};

const feedbackQ1: { [key: string]: FeedbackContent } = {
  '1-1': {
    title: '¡Ups!',
    description: 'Determinar el presupuesto no es el objetivo principal del análisis de actores clave.'
  },
  '1-2': {
    title: '¡Correcto!',
    description: 'Identificar a las partes interesadas es fundamental para el éxito del proyecto.'
  },
  '1-3': {
    title: '¡Ups!',
    description: 'Fijar los plazos de ejecución corresponde a la planificación del cronograma, no al análisis de actores.'
  }
};

export const FrogJump = () => {
  const [isOpen, setIsOpen] = useState<'success' | 'wrong' | null>(null);
  const [currentQuestion, setcurrentQuestion] = useState(1);
  const [currentResult, setCurrentResult] = useState<GameResult | null>(null);

  const closeModal = () => {
    setIsOpen(null);
  };

  const handleResult = useCallback((result: GameResult) => {
    setCurrentResult(result);

    setTimeout(() => {
      setIsOpen(result.isCorrect ? 'success' : 'wrong');
    }, 3500); // El delay es necesario por la animacion
  }, []);

  const getFeedbackContent = () => {
    if (!currentResult) return { title: '', description: '' };

    // Si es la primera pregunta (index 0)
    if (currentResult.questionIndex === 0 && feedbackQ1[currentResult.selectedAnswer]) {
      return feedbackQ1[currentResult.selectedAnswer];
    }

    // Feedback por defecto para el resto
    return {
      title: '',
      description: currentResult.isCorrect
        ? 'Has respondido correctamente.'
        : 'Has respondido incorrectamente. Vuelve a intentarlo.'
    };
  };

  const handleQuestionChange = (questionIndex: number) => {
    setcurrentQuestion(questionIndex);
  };

  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Frog Jump</h1>
      </div>
      <div className={'container'}>
        <Row justifyContent="center" alignItems="center">
          <Col xs="12">
            <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
              <h2 className=" u-fs-400">Descripción del juego:</h2>
              <p>
                Guía a nuestra valiente rana a través del estanque en este juego de preguntas y respuestas. En cada
                nivel, se te presentará una pregunta y tres nenúfares con posibles respuestas. Deberás pensar rápido y
                saltar con precisión hacia la opción correcta. Si aciertas, la ranita estará a salvo y lista para el
                siguiente desafío. Pero si te equivocas, el nenúfar se hundirá y tu aventura terminará con un
                refrescante baño.
              </p>
              <p className="u-fs-300 u-font-bold">Características:</p>
              <ul className="u-flow list_star">
                <li>
                  <p>
                    <strong>Preguntas:</strong> Se podrá realizar cualquier cantidad de preguntas.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Respuestas:</strong> Solo se podrá tener 3 opciones de respuestas.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Recomendaciones:</strong> Ideal la utilización de opciones cortas.
                  </p>
                </li>
              </ul>
            </div>
            <div>
              <Row justifyContent="center" alignItems="center">
                <Col xs="12" className="u-flow">
                  <Audio key={currentQuestion} src={`assets/audios/aud_ova-26_sld-17_${currentQuestion}.mp3`} />
                  <FrogJumping 
                    dataGameFrog={dataGameFrog} 
                    onResult={handleResult}
                    onQuestionChange={handleQuestionChange}
                  />
                </Col>
              </Row>
            </div>

            <ModalFeedback
              type={isOpen === 'success' ? 'success' : 'wrong'}
              isOpen={isOpen !== null}
              onClose={closeModal}
              finalFocusRef="#main">
              <h3>{getFeedbackContent().title}</h3>
              <p>{getFeedbackContent().description}</p>
            </ModalFeedback>

          </Col>
        </Row>
      </div>
    </>
  );
};
