import { Audio, Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { questionsDataArquery } from '@/data/data-game-arquery';
import { GameArquery } from '@/games/game-simple-arquery/GameArquery';

export const GameArquerySimple = () => {
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
            responder preguntas. A medida que se presentan los desafíos, el jugador verá un conjunto de objetivos en
            pantalla. El número de estos varía entre dos y cuatro, y cada uno está asociado a una posible respuesta. El
            proceso es simple: leer la pregunta, identificar la respuesta correcta y ejecutar un disparo preciso al
            centro del objetivo correspondiente. El juego está diseñado como una prueba continua, donde el jugador debe
            avanzar contestando una pregunta tras otra hasta completar el desafío en su totalidad.
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
            <GameArquery questions={questionsDataArquery} gameId="game-ova" />
          </Col>
        </Row>
      </div>
    </>
  );
};
