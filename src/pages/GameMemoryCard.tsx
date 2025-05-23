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
      <div className={'container'}>
        <Audio a11y src="assets/audios/aud__des_ova-11_sld 1.mp3" />
        <Row alignItems="center" justifyContent="center">
          <Col xs="12">
            <GameMemory gameId="game-ova" />
          </Col>
        </Row>
      </div>
    </>
  );
};
