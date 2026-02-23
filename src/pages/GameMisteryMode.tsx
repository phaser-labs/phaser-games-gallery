import { useRef, useState } from 'react';
import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { gameData } from '@/data/data-game-mistery-mode';
import { GameMisteryMode, IRefGameMisteryMode } from '@/games/game-mistery-mode/game-mistery-mode';

import '@styles/global.css';

export const MisteryModeGame = () => {
  // The sprite can only be moved in the MainMenu Scene
  const [, setCanMoveSprite] = useState(true);

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefGameMisteryMode | null>(null);

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    setCanMoveSprite(scene.scene.key !== 'MainMenu');
  };

  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Game Mistery Mode</h1>
      </div>
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
          <h2 className=" u-fs-400">Descripción del juego:</h2>
          <p>
            <strong>Game Mistery Mode</strong> es un juego de deducción donde los jugadores se convierten en detectives
            para resolver casos descubriendo personajes misteriosos. Cada caso presenta pistas ocultas que deberás
            revelar estratégicamente para identificar la respuesta correcta antes de quedarte sin oportunidades.
          </p>

          <p className="u-fs-300 u-font-bold">Características:</p>

          <ul className="u-flow list_star">
            <li>
              <p>
                <strong>Sistema de pistas progresivas:</strong> Cada caso contiene 5 pistas que se revelan una por una,
                desde las más generales hasta las más específicas, ayudándote a deducir la respuesta.
              </p>
            </li>
            <li>
              <p>
                <strong>Puntuación basada en estrategia:</strong> A menos pistas utilizadas, más puntos obtienes. Desde
                20 puntos usando solo 1 pista, hasta 1 punto si necesitas las 5 pistas.
              </p>
            </li>
            <li>
              <p>
                <strong>Gestión de vidas:</strong> Dispones de 4 vidas por caso. Cada respuesta incorrecta consume una
                vida, y al perder todas, el caso se cierra mostrando tu progreso.
              </p>
            </li>
            <li>
              <p>
                <strong>Botón de ayuda:</strong> Si has usado todas las pistas y aún no resuelves el caso, puedes
                activar la ayuda que revela información adicional sobre el personaje.
              </p>
            </li>
            <li>
              <p>
                <strong>Sistema de progresión:</strong> Avanza a través de múltiples casos, acumulando puntos y viendo
                tu evolución como detective hasta completar todos los misterios.
              </p>
            </li>
          </ul>
        </div>
        <Row justifyContent="center" alignItems="center">
          <Col xs="11" mm="10" md="9" lg="6">
            <GameMisteryMode gameData={gameData} ref={phaserRef} currentActiveScene={currentScene} />
          </Col>
        </Row>
      </div>
    </>
  );
};
