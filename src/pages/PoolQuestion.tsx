
import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import QuizPoolApp from '@/games/game-quiz-pool/QuizPoolApp';

import 'books-ui/styles';

import '../styles/global.css';


export const PoolQuestionPage = () => {

  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Question Pool</h1>
      </div>
      <div className={'container'}>
        <Row justifyContent="center" alignItems="center">
          <Col xs="12">
            <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
              <h2 className=" u-fs-400">Descripción del juego:</h2>
              <p>
                Este juego de preguntas y respuestas es una experiencia interactiva diseñada para desafiar el conocimiento de los jugadores en diversas áreas temáticas. A través de una serie de preguntas, los participantes pueden poner a prueba su conocimiento mientras se divierten. Este juego no solo ofrece entretenimiento, sino que también fomenta el aprendizaje y la competencia amistosa entre los jugadores.
              </p>
              <p className="u-fs-300 u-font-bold">Características:</p>
              <ul className="u-flow list_star">
                <li>
                  <p>
                    <strong>Preguntas:</strong> el número total de preguntas puede variar, siendo totalmente personalizable.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Respuestas:</strong> cada pregunta tiene de 4 a 6 opciones de respuesta, de las cuales solo una es correcta.
                  </p>
                </li>
              </ul>
            </div>
            <div>
                <Col xs="12" className="u-flow">
                   <QuizPoolApp />
                </Col>
             
            </div>

          </Col>
        </Row>
      </div>
    </>
  );
};
