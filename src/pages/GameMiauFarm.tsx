
import { useCallback } from 'react';
import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { CHALLENGE } from '@/data/data-game-miau-farm';
import { KittyFarm } from '@/games/game-miau-farm/kitty-farm';
import { GameResult } from '@/games/game-miau-farm/types/types';

import 'books-ui/styles';

import '../styles/global.css';


export const GameMiauFarmPage = () => {
  const handleResult = useCallback((result: GameResult) => {
    console.log('Resultado:', result);
  }, []);
  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Miau Farm</h1>
      </div>
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <Row alignItems="center" justifyContent="center">
          <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
            <h2 className=" u-fs-400">Descripción del juego:</h2>
            <p>
              En <strong>Miau Farm</strong>, los jugadores exploran un mundo pixel art recolectando conocimiento
              escondido en cofres. Cada tesoro desbloqueado otorga una semilla que puedes plantar, regar y cosechar en
              tu propia granja.
            </p>
            <p>
              El objetivo es abrir todos los cofres, aprender su contenido y cosechar todas las plantas que sembraste.
              Solo quienes combinen exploración y dedicación completarán su cosecha de saberes.
            </p>
            <p className="u-fs-300 u-font-bold">Características:</p>
            <ul className="u-flow list_star">
              <li>
                <p>
                  <strong>Cantidad de cofres:</strong> La cantidad de cofres que se pueden abrir es totalmente personalizable.
                </p>
              </li>
              <li>
                <p>
                  <strong>Cantidad de semillas:</strong> La cantidad de semillas que se pueden plantar es totalmente dependiente de la cantidad de cofres abiertos.
                </p>
              </li>
              <li>
                <p>
                  <strong>Contenido de cofres:</strong> La información o conocimiento que se obtiene al abrir cada cofre es completamente personalizable, lo que permite adaptar el juego a diferentes temáticas o áreas de aprendizaje.
                </p>
              </li>
            </ul>
          </div>

          <Col xs="8">
            <KittyFarm gameId="game-miau-farm" advices={CHALLENGE} onResult={handleResult} />
          </Col>
        </Row>
      </div>
    </>
  );
};
