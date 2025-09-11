import { Col, Row } from "books-ui";

import { BtnBack } from "@/components/btnBack";
import { sentences } from "@/data/data-game-reorganize";
import { GameReorganizeTemplate } from "@/games/game-reorganize-template/GameReorganize";

import "@styles/global.css";

export const GameReorganize = () => {
  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Juego de Reorganizar Frases</h1>
      </div>
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
          <h2 className=" u-fs-400">Descripción del juego:</h2>
          <p>
           Este es un juego en el que debes reorganizar palabras hasta formar correctamente diferentes frases. Su mejor característica es la posibilidad de elegir entre tres temas distintos, o incluso crear uno personalizado.
          </p>
          <p className="u-fs-300 u-font-bold">Características:</p>
          <ul className="u-flow list_star">
            <li>
              <p>
                <strong>Cantidad de frases:</strong> La cantidad que se desee, aunque se recomienda una cantidad entre 3 y 5.
              </p>
            </li>
              <li>
              <p>
                <strong>Completa personalización:</strong> Puedes personalizar el juego con tus propios temas, incluyendo fondos, sonidos, imágenes y tipografías.
              </p>
            </li>
          </ul>
        </div>
        <Row alignItems="center" justifyContent="center">
          <Col xs="12" md="7">
     <GameReorganizeTemplate 
        sentences={sentences} 
        gameId="game-template-reorganize"
      />
          </Col>
        </Row>
      </div>
    </>
  );
};
