import { Audio, Col, Row } from "books-ui"

import { BtnBack } from "@/components/btnBack"
import { questionsDataArquery } from "@/data/data-game-arquery"
import { GameArquery } from "@/games/game-simple-arquery/GameArquery"

export const GameArquerySimple = () => {
  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Desafío del Arquero</h1>
      </div>
      <div className={'container'}>
        <Audio a11y src="assets/audios/aud__des_ova-11_sld 1.mp3" />
              <Row justifyContent="center" alignItems="center">
                <Col xs="11" mm="10" md="9" lg="8" hd="8">
                  <GameArquery questions={questionsDataArquery} gameId="game-ova" />
                </Col>
              </Row>
      </div>
    </>
  )
}
