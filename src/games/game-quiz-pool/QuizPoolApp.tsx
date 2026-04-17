// eslint-disable-next-line simple-import-sort/imports
import { Audio, Col, Row } from 'books-ui';

import './tailwind.css';
import { useState } from 'react';

import 'books-ui/styles';

import { quizCulturaGeneral } from './data/DataGame';
import { DataGame_2 } from './data/DataGame_2';
import { QuizPool_v1 } from './QuizPool_v1';
import { QuizPool_v2 } from './QuizPool_v2';
import { QuizPool_v3 } from './QuizPool_v3';
import '../../styles/global.css';

function QuizPoolApp() {
  const [choose, setChoose] = useState(0);

  const handleClick = (value: number) => {
    setChoose(value);
  };

  return (
    <>
        <Audio a11y src={`assets/game-pool-question/audios/ally/aud_des_ova-26_sld-17__1.mp3`} />
        <Row justifyContent="flex-start" alignItems="center">
          {/* <QuizPool_v1 dataGame={quizCulturaGeneral} /> */}
          <Col xs="12">
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
    </>
  );
}

export default QuizPoolApp;