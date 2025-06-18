import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { dataQuestions, dialogs, feedbackTexts } from '@/data/data-game-arcanum';
import { GameArcanumArcher } from '@/games/game-arcanum-archer/GameArcanum';

import '@styles/global.css';

export const ArcanumArcher = () => {
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
            <GameArcanumArcher data={dataQuestions} dialogs={dialogs} id="1" feedbacks={feedbackTexts} />
          </Col>
        </Row>
      </div>
    </>
  );
};
