import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import PathOfWisdom from '@/games/game-city-of-wisdom/Path-of-wisdom';

export const CityOfWisdom = () => {
  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Ciudad de Sabiduría</h1>
      </div>
      <div className={'container'}>
        <Row justifyContent="center" alignItems="center">
          <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
            <h2 className=" u-fs-400">Descripción del juego:</h2>
            <p>
              Este es un juego que combina la exploración de un entorno urbano con una narrativa educativa. Los
              jugadores asumen el papel de un personaje que debe explorar una ciudad llena de edificios y lugares
              interesantes, mientras aprenden sobre la historia, la cultura de su ciudad y además visitan los
              diferentes edificios que hay en ella, de esta manera aprendiedo palabras nuevas.
            </p>
            <p className="u-fs-300 u-font-bold">Características:</p>
            <ul className="u-flow list_star">
              <li>
                <p>
                  <strong>Objetivo:</strong> Explorar la ciudad y sus edificios.
                </p>
              </li>
              <li>
                <p>
                  <strong>Recomendaciones:</strong> Ideal para actividades en diferentes idiomas.
                </p>
              </li>
            </ul>
          </div>
          <Col xs="12" hd="10">
            <PathOfWisdom />
          </Col>
        </Row>
      </div>
    </>
  );
};
