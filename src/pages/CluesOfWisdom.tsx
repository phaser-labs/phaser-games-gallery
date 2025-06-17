import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { level1Data } from '@/data/data-game-clues-of-wisdom';
import { GameCluesOfWisdom } from '@/games/game-clues-of-wisdom/GameCluesOfWisdom';

import '@styles/global.css';

export const CluesOfWisdom = () => {
  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Pistas de Sabiduría: La Odisea de Nira</h1>
      </div>
      <div className={'container'}>
       <Row justifyContent="center" alignItems="center">
        <Col xs="11" mm="10" md="9" lg="6">
          <GameCluesOfWisdom data={level1Data} gameId="game-ova" />
        </Col>
      </Row>
      </div>
    </>
  );
};
