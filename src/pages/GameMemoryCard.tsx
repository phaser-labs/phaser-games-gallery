import { Audio, Col, Row } from "books-ui";

import { BtnBack } from "@/components/btnBack";
import { GameMemory } from "@/games/game-memory-card/GameMemory";

import "@styles/global.css";

export const GameMemoryCard = () => {
  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Juego de Memoria</h1>
      </div>
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
          <h2 className=" u-fs-400">Descripción del juego:</h2>
          <p>
            Este es un tipico juego de memoria con un toque retro. Se puede personalizar completamente.
          </p>
          <p className="u-fs-300 u-font-bold">Características:</p>
          <ul className="u-flow list_star">
            <li>
              <p>
                <strong>Cantidad de cartas:</strong> Se podria agrandar la cantidad de cartas.
              </p>
            </li>
          </ul>
        </div>
        <Audio addClass="u-mt-0 u-mb-0" src="assets/audios/aud__des_ova-11_sld 1.mp3" />
        <Row alignItems="center" justifyContent="center">
          <Col xs="12">
            <GameMemory gameId="game-ova" />
          </Col>
        </Row>
      </div>
    </>
  );
};
