import { useRef, useState } from 'react';
import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { initOptions } from '@/data/data-game-quiz-flight';
import { IRefQuizFlight } from '@/games/game-quiz-flight/quiz-flight';
import { QuizFlight } from '@/games/game-quiz-flight/quiz-flight';

import '@styles/global.css';

export const GameQuizFlight = () => {
  // The sprite can only be moved in the MainMenu Scene
  const [, setCanMoveSprite] = useState(true);

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefQuizFlight | null>(null);

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    setCanMoveSprite(scene.scene.key !== 'MainMenu');
  };

  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Quiz Flight</h1>
      </div>
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <Row justifyContent="center" alignItems="center">
          <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
            <h2 className=" u-fs-400">Descripción del juego:</h2>
            <p>
              Quiz Flight es un juego educativo interactivo diseñado para poner a prueba y mejorar tus conocimientos a
              través de preguntas de opción múltiple. En este juego, los jugadores asumen el papel de pilotos que deben
              responder correctamente a una serie de preguntas para avanzar en su vuelo y completar misiones.
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
                  <strong>Respuesta:</strong> Se puede tener entre 2 y 4 opciones de respuesta por pregunta.
                </p>
              </li>
              <li>
                <p>
                  <strong>Recomendaciones:</strong> Que las opciones no sean tan largas.
                </p>
              </li>
            </ul>
          </div>

          <Col xs="11" mm="10" md="9" lg="6">
            <QuizFlight options={initOptions} ref={phaserRef} currentActiveScene={currentScene} />
          </Col>
        </Row>
      </div>
    </>
  );
};
