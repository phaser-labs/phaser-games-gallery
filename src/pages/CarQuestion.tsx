import { Col, Row } from "books-ui"

import { BtnBack } from "@/components/btnBack"
import { dataQuestions } from "@/data/data-game-car-question"
import GameCarQuestion from "@/games/game-car-quiz/GameCarQuiz"


export const CarQuestion = () => {
  return (
   <>
      <div className="header">
        <BtnBack />
        <h1>Car Question</h1>
      </div>
      <div className={'container'}>
        <Row justifyContent="center" alignItems="center">
          <Col xs="8">
           <GameCarQuestion data={dataQuestions} />
          </Col>
        </Row>
            
      </div>
    </>
  )
}
