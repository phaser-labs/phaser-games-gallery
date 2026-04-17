
import { useState } from 'react';
import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { quizCulturaGeneral } from '@/games/game-quiz-pool/data/DataGame';
import { DataGame_2 } from '@/games/game-quiz-pool/data/DataGame_2';
import { QuizPool_v1 } from '@/games/game-quiz-pool/QuizPool_v1';
import { QuizPool_v2 } from '@/games/game-quiz-pool/QuizPool_v2';
import { QuizPool_v3 } from '@/games/game-quiz-pool/QuizPool_v3';

import 'books-ui/styles';

import '../styles/global.css';


export const PoolQuestionPage = () => {
  const [choose, setChoose] = useState<0 | 1 | 2 | 3>(0);

  const handleClick = (value: 1 | 2 | 3) => {
    setChoose(value);
 };
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

              </p>
              <p className="u-fs-300 u-font-bold">Características:</p>
              <ul className="u-flow list_star">
                <li>
                  <p>
                    <strong>Preguntas:</strong>
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Respuestas:</strong>
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Recomendaciones:</strong>
                  </p>
                </li>
              </ul>
            </div>
            <div>
              <Row justifyContent="center" alignItems="center">
                <Col xs="12" className="u-flow">
                  {/* <QuizPool_v3 dataGame={DataGame_2} /> */}
                  {/* ── Selector de versión ─────────────────────────── */}
                  {choose === 0 && (
                    <div>
                      <p className="quizPool__Text_chose">Seleccione el escenario de juego</p>

                      <div className="containerBtnschose">
                        <button className="containerBtn" onClick={() => handleClick(1)}>
                          <img src="assets/game-pool-question/images/version_01.png" alt="Opción 1" />
                        </button>
                        <button className="containerBtn" onClick={() => handleClick(2)}>
                          <img src="assets/game-pool-question/images/version_02.png" alt="Opción 2" />
                        </button>
                        <button className="containerBtn" onClick={() => handleClick(3)}>
                          <img src="assets/game-pool-question/images/version_03.png" alt="Opción 3" />
                        </button>
                      </div>
                    </div>
                  )}
                  {/* ── Versión seleccionada ────────────────────────── */}
                  {choose === 1 && <QuizPool_v1 dataGame={quizCulturaGeneral} />}
                  {choose === 2 && <QuizPool_v2 dataGame={quizCulturaGeneral} />}
                  {choose === 3 && <QuizPool_v3 dataGame={DataGame_2} />}
                </Col>
              </Row>
            </div>

          </Col>
        </Row>
      </div>
    </>
  );
};
