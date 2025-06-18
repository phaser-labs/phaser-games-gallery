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
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
          <h2 className=" u-fs-400">Descripción del juego:</h2>
          <p>
            En este juego, el jugador se embarca en una misión que combina la acción de las plataformas con la
            resolución de un puzzle de palabras. El objetivo principal es completar una frase visible en la parte
            superior de la pantalla. Para lograrlo, el jugador debe explorar el nivel en busca de cofres. Cada cofre
            abierto revela una palabra. Si la palabra es una de las que se necesitan para la frase, esta se rellenará
            automáticamente en el espacio correspondiente. El entorno presenta desafíos como enemigos de varios tipos,
            que pueden ser eliminados saltando sobre ellos, y trampas de espinas que resultan en la pérdida inmediata de
            todas las vidas. Para ayudar al jugador, hay zanahorias disponibles que restauran una vida al ser recogidas.
            La victoria se consigue una vez que se han localizado todas las palabras necesarias y la frase final ha sido
            revelada.
          </p>
          <p className="u-fs-300 u-font-bold">Características:</p>
           <ul className="u-flow list_star">
                <li>
                  <p>
                    <strong>Cantidad de Frases:</strong> Se podrá realizar cualquier frase.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Personalizable:</strong> Se puede tanto encontrar palabras y completar frases, como tambien la posibilidad de armar la frase con toda en blanco.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Recomendaciones:</strong> Que la frase no sea tan larga o tenga muchas palabras.
                  </p>
                </li>
              </ul>
        </div>
        <Row justifyContent="center" alignItems="center">
          <Col xs="11" mm="10" md="9" lg="6">
            <GameCluesOfWisdom data={level1Data} gameId="game-ova" />
          </Col>
        </Row>
      </div>
    </>
  );
};
