import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { dataQuestions } from '@/data/data-game-car-question';
import GameCarQuestion from '@/games/game-car-quiz/GameCarQuiz';

export const CarQuestion = () => {
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
                  <strong>Preguntas:</strong> Se podrá realizar unicamente 4 preguntas.
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
          <Col xs="8">
            <GameCarQuestion data={dataQuestions} />
          </Col>
        </Row>
      </div>
    </>
  );
};
