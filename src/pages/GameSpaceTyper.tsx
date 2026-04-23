import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { SpaceTyperApp } from '@/games/game-space-typer/components/App';

import '@styles/global.css';

export const SpaceTyperPage = () => {
  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Space Typer</h1>
      </div>
      <div className={'container'}>
        <Row alignItems="center" justifyContent="center">
          <Col xs="12" md="10" lg="7" >
            <div className="u-flow m-4 mx-8">
              <h2 className=" u-fs-400">Descripción del juego:</h2>
              <p>
                Space Typer es un juego de mecanografía ambientado en el espacio, donde los jugadores deben defender su nave espacial de oleadas de enemigos escribiendo palabras correctamente. El objetivo es mejorar la velocidad y precisión de mecanografía mientras se disfruta de una experiencia de juego emocionante y desafiante.
              </p>
              <p className="u-fs-300 u-font-bold">Características:</p>
              <ul className="u-flow list_star">

                <li>
                  <p>
                    <strong>Personalización:</strong> Cantidad de palabras ilimitada, dando la posibilidad de utilizar cualquier tema o vocabulario que el jugador desee, desde palabras comunes hasta términos técnicos o de fantasía.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Recomendación importante:</strong> Solo recibe palabras, no frases completas, para mantener la jugabilidad fluida y desafiante.
                  </p>
                </li>
              </ul>
            </div>

            <SpaceTyperApp />
            
          </Col>
        </Row>
      </div>

    </>
  );
};
