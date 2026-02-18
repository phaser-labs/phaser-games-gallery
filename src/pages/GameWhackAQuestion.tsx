import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import {dataGameWhackAQuestion} from '@/data/data-game-whack-a-question';
import { GameWhackAQuestion } from '@/games/game-whack-a-question';

import '@styles/global.css';

export const WhackAQuestion = () => {
  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Whack A Question</h1>
      </div>
      <div className={'container'}>
        <Row alignItems="center" justifyContent="center">
          <Col xs="12"md="10" lg="7" >
            <div style={{ width: '100%', margin: '0 auto' }} className="u-flow">
              <h2 className=" u-fs-400">Descripción del juego:</h2>
              <p>
                En Whack-a-Question, los jugadores se enfrentan a una serie de preguntas que aparecen en diferentes agujeros. El objetivo es responder correctamente a las preguntas golpeando el topo correspondiente antes de que desaparezca. Cada pregunta tiene un tiempo limitado para ser respondida, los jugadores deben ser rápidos y precisos para no perder sus vidas, y ganar el juego.
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
                <strong>Respuestas:</strong> Se pueden tener hasta 8 opciones de respuestas.
              </p>
            </li>
            <li>
              <p>
                <strong>Personalización:</strong> Se puede escoger entre diferentes diseños de mundos, cada uno con su propio estilo visual.
              </p>
            </li>
              </ul>
            </div>
            <GameWhackAQuestion data={dataGameWhackAQuestion} />
          </Col>
        </Row>
      </div>

    </>
  );
};
