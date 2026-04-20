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

              </p>
              <p className="u-fs-300 u-font-bold">Características:</p>
              <ul className="u-flow list_star">

                <li>
                  <p>
                    <strong>Personalización:</strong>
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Recomendación importante:</strong>
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
