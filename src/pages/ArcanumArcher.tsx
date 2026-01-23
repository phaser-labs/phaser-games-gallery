import { useCallback, useState } from 'react';
import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { dataQuestions, dialogs, feedbackTexts } from '@/data/data-game-arcanum';
import { GameArcanumArcher, GameResult } from '@/games/game-arcanum-archer/game-arcanum';
import { ModalFeedback } from '@/shared/core/components';

import '@styles/global.css';

export const ArcanumArcher = () => {
  const [modalOpen, setModalOpen] = useState<'success' | 'wrong' | null>(null);
  const [currentResult, setCurrentResult] = useState<GameResult | null>(null);

  const closeModal = () => {
    setModalOpen(null);
  };

  const handleResult = useCallback((result: GameResult) => {
    console.log('Resultado del juego:', result);
    setCurrentResult(result);
   setTimeout(() => {
      setModalOpen(result.isCorrect ? 'success' : 'wrong');
    }, 800); // El delay es necesario por la animacion
  }, []);

  const getModalFeedbackContent = () => {
    if (!currentResult) return { title: '', description: '' };

    const levelKey = `level${currentResult.questionIndex + 1}` as keyof typeof feedbackTexts;
    const levelFeedback = feedbackTexts[levelKey];
    const defaultFeedback = feedbackTexts.default;

    const message = currentResult.isCorrect
      ? levelFeedback?.correct || defaultFeedback.correct
      : levelFeedback?.incorrect || defaultFeedback.incorrect;

    return {
      title: currentResult.isCorrect ? '¡Correcto!' : '¡Incorrecto!',
      description: message,
    };
  };

  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Arcanum Archer</h1>
      </div>
      <div className={'container'}>
        <Row alignItems="center" justifyContent="center">
          <Col xs="12">
            <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
              <h2 className=" u-fs-400">Descripción del juego:</h2>
              <p>
                Este juego transforma la evaluación tradicional en un desafío épico de arquería mágica. Diseñado para
                aumentar la participación y la concentración, este juego invita a los estudiantes a convertirse en
                aprendices de una academia mágica donde deben "disparar" a las respuestas correctas. El juego está
                estructurado en 5 niveles de dificultad creciente, simulando el avance a través de las enseñanzas de 5
                "profesores". Esta estructura permite un viaje de aprendizaje progresivo. La mecánica de apuntar y
                disparar no solo es divertida, sino que también fomenta la concentración y proporciona un refuerzo
                positivo instantáneo al acertar en el blanco. El juego es totalmente personalizable, permitiendo a los
                docentes cargar sus propias preguntas y definir el número de respuestas (objetivos) para cada desafío.
              </p>
              <p className="u-fs-300 u-font-bold">Características:</p>
              <ul className="u-flow list_star">
                <li>
                  <p>
                    <strong>Preguntas:</strong> Se podrá realizar unicamente 5 preguntas.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Respuestas:</strong> Se pueden tener más de 4 opciones de respuestas(targets) a la vez.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Recomendaciones:</strong> Ideal la utilización de opciones cortas.
                  </p>
                </li>
              </ul>
            </div>
            <GameArcanumArcher
              data={dataQuestions}
              dialogs={dialogs}
              id="1"
              feedbacks={feedbackTexts}
              onResult={handleResult}
            />
          </Col>
        </Row>
      </div>

      <ModalFeedback
        type={currentResult?.isCorrect ? 'success' : 'wrong'}
        onClose={closeModal}
        finalFocusRef="#main"
        isOpen={modalOpen !== null}
      >
        <h2>{getModalFeedbackContent().title}</h2>
        <p>{getModalFeedbackContent().description}</p>
      </ModalFeedback>
    </>
  );
};
