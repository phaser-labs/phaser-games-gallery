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
             <GameArcanumArcher data={dataQuestions} dialogs={dialogs} id="1" feedbacks={feedbackTexts} />
              </Col>
            </Row>
      </div>
    </>
  );
};
