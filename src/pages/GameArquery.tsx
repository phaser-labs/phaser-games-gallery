import { useCallback, useState } from 'react';
import { Audio, Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { questionsDataArquery } from '@/data/data-game-arquery';
import { GameResult, GameSimpleArquery } from '@/games/game-simple-arquery';
import { ModalFeedback } from '@/shared/core/components';


type FeedbackContent = {
  title?: string;
  description: string;
  audio: string;
}

const dataFeedbackQuestion4: { [key: string]: FeedbackContent } = {
  a: {
    title: '¡Excelente disparo!',
    description: 'Has acertado en el blanco con una precisión impresionante. ¡Sigue así!',
    audio: 'assets/audios/successA.mp3',
  },
  b: {
    title: 'Disparo fallido B',
    description: 'Tu flecha no alcanzó el objetivo. ¡Inténtalo de nuevo para mejorar tu puntería!',
    audio: 'assets/audios/errorB.mp3',
  },
  c: {
    title: 'Disparo fallido C',
    description: 'Tu flecha no alcanzó el objetivo. ¡Muy mal!',
    audio: 'assets/audios/errorC.mp3',
  }
}

export const GameArquerySimple = () => {
  const [modalOpen, setModalOpen] = useState<'success' | 'wrong' | null>(null);
  const [currentResult, setCurrentResult] = useState<GameResult | null>(null);

  const closeModal = () => {
    setModalOpen(null);
  };

  const handleResult = useCallback((result: GameResult) => {
    console.log('Resultado del juego:', result);
    setCurrentResult(result);
    setModalOpen(result.isCorrect ? 'success' : 'wrong');
  }, []);


  const getModalFeedbackContent = () => {
    if (!currentResult) return { title: '', description: '', audio: '' };

    // Caso especial para la pregunta 4
    if (currentResult.questionIndex === 3) {
      if(currentResult.selectedAnswer === 'a') {
        return dataFeedbackQuestion4.a;
      } else {
        return dataFeedbackQuestion4[currentResult.selectedAnswer as 'b' | 'c'];
      }
    } else {
      /* Resto de preguntas */
      return {
        description: currentResult.isCorrect
          ? '¡Bien hecho!'
          : 'Sigue intentando',
        audio: currentResult.isCorrect ? 'assets/audios/successDefault.mp3' : 'assets/audios/errorDefault.mp3',
      };
    }
  }

 

  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Desafío del Arquero</h1>
      </div>
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
          <h2 className=" u-fs-400">Descripción del juego:</h2>
          <p>
            La mecánica central de este juego es la interacción directa a través de un arco y una flecha para
            preguntas. A medida que se presentan los desafíos, el jugador verá un conjunto de objetivos en pantalla. El
            número de estos varía entre dos y cuatro, y cada uno está asociado a una posible respuesta. El proceso es
            simple: leer la pregunta, identificar la respuesta correcta y ejecutar un disparo preciso al centro del
            objetivo correspondiente. El juego está diseñado como una prueba continua, donde el jugador debe avanzar
            contestando una pregunta tras otra hasta completar el desafío en su totalidad.
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
                <strong>Respuestas:</strong> Se pueden tener 4, 3 o 2 opciones de respuestas.
              </p>
            </li>
            <li>
              <p>
                <strong>Recomendaciones:</strong> Ideal la utilización de opciones cortas.
              </p>
            </li>
          </ul>
        </div>
        <Audio a11y src="assets/audios/aud__des_ova-11_sld 1.mp3" />
        <Row justifyContent="center" alignItems="center">
          <Col xs="11" mm="10" md="9" lg="8" hd="8">
            <GameSimpleArquery questions={questionsDataArquery} onResult={handleResult} gameId="game-ova" />
          </Col>
        </Row>
      </div>
      

      {/* Modales individuales para cada respuesta o variantes(algunos si otros no) */}
      <ModalFeedback
        type={currentResult?.isCorrect ? 'success' : 'wrong'}
        onClose={closeModal}
        finalFocusRef="#main"
        audio={getModalFeedbackContent().audio}
        isOpen={modalOpen !== null}>
        <h2>{getModalFeedbackContent().title??''}</h2>
        <p>{getModalFeedbackContent().description}</p>
      </ModalFeedback>


      {/* Modales unicos para cada pregunta */}
     {/* 
        <ModalFeedback
          type="success"
          onClose={closeModal}
          finalFocusRef="#main"
          audio="assets/audios/success.mp3"
          isOpen={modalOpen === 'success'}>
          <p>Has respondido correctamente</p>
        </ModalFeedback>*/}

     {/*
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
