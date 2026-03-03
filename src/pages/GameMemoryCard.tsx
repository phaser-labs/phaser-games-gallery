import { Audio, Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { GameMemory } from '@/games/game-memory-card/game-memory';

import '@styles/global.css';

const dataCards = [
  { name: 'card-back', img: 'assets/game-memory-card/cards/back01.png' },
  { name: 'card-0', img: 'assets/game-memory-card/cards/clubs_ace.png' },
  { name: 'card-1', img: 'assets/game-memory-card/cards/diamonds_ace.png' },
  { name: 'card-2', img: 'assets/game-memory-card/cards/hearts_ace.png' },
  { name: 'card-3', img: 'assets/game-memory-card/cards/spades_ace.png' },
  { name: 'card-4', img: 'assets/game-memory-card/cards/Joker1.png' },
  { name: 'card-5', img: 'assets/game-memory-card/cards/Joker2.png' }
]

export const GameMemoryCard = () => {
  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Juego de Memoria</h1>
      </div>
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
          <Audio addClass="u-mt-0 u-mb-0" src="assets/audios/aud__des_ova-11_sld 1.mp3" />
        <Row alignItems="center" justifyContent="center">
          <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
            <h2 className=" u-fs-400">Descripción del juego:</h2>
            <p>Este es un tipico juego de memoria con un toque retro. Se puede personalizar completamente.</p>
            <p className="u-fs-300 u-font-bold">Características:</p>
            <ul className="u-flow list_star">
              <li>
                <p>
                  <strong>Cantidad de cartas:</strong> Se podria agrandar la cantidad de cartas.
                </p>
              </li>
            </ul>
          </div>

          <Col xs="12">
            <GameMemory gameId="game-ova" cards={dataCards} onResult={(isCorrect) => console.log('Resultado:', isCorrect)} />
          </Col>
        </Row>
      </div>
    </>
  );
};
