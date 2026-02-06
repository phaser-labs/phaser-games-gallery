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
          <Col xs="12"md="10" lg="8" >
            <div style={{ width: '100%', margin: '0 auto' }} className="u-flow">
              <h2 className=" u-fs-400">Descripción del juego:</h2>
              <p>
                Este juego está en construcción...
              </p>
              <p className="u-fs-300 u-font-bold">Características:</p>
              <ul className="u-flow list_star">
                
              </ul>
            </div>
            <GameWhackAQuestion data={dataGameWhackAQuestion} />
          </Col>
        </Row>
      </div>

    </>
  );
};
