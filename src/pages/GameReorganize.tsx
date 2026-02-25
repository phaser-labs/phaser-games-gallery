import { useCallback, useState } from 'react';
import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { sentences } from '@/data/data-game-reorganize';
import { GameReorganizeTemplate } from '@/games/game-reorganize-template/game-reorganize';
import type { GameReorganizeResult } from '@/games/game-reorganize-template/utils/types';
import { ModalFeedback } from '@/shared/core/components';

import '@styles/global.css';

export const GameReorganize = () => {
  const [isOpenModal, setIsOpenModal] = useState<true | false | null>(null);
  const [currentResult, setCurrentResult] = useState<GameReorganizeResult | null>(null);

  const closeModal = () => {
    setIsOpenModal(null);
  };

  const handleResult = useCallback((result: GameReorganizeResult) => {
    console.log('Resultado de la revisión:', result);
    setCurrentResult(result);
    setTimeout(() => {
      setIsOpenModal(result.isCorrect ? true : false);
    }, 1000);
  }, []);

  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Juego de Reorganizar Frases</h1>
      </div>
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <Row alignItems="center" justifyContent="center">
          <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
            <h2 className=" u-fs-400">Descripción del juego:</h2>
            <p>
              Este es un juego en el que debes reorganizar palabras hasta formar correctamente diferentes frases. Su
              mejor característica es la posibilidad de elegir entre tres temas distintos, o incluso crear uno
              personalizado.
            </p>
            <p className="u-fs-300 u-font-bold">Características:</p>
            <ul className="u-flow list_star">
              <li>
                <p>
                  <strong>Cantidad de frases:</strong> La cantidad que se desee, aunque se recomienda una cantidad entre
                  3 y 5.
                </p>
              </li>
              <li>
                <p>
                  <strong>Completa personalización:</strong> Puedes personalizar el juego con tus propios temas,
                  incluyendo fondos, sonidos, imágenes y tipografías.
                </p>
              </li>
            </ul>
          </div>

          <Col xs="12" md="7">
            <GameReorganizeTemplate sentences={sentences} gameId="game-template-reorganize" onResult={handleResult} />
          </Col>
        </Row>

        <ModalFeedback
          type={currentResult?.isCorrect ? 'success' : 'wrong'}
          onClose={closeModal}
          finalFocusRef="#main"
          isOpen={isOpenModal !== null}>
          <p>
            {isOpenModal
              ? '¡Has formado la frase correctamente!'
              : 'La frase no está bien formada. ¡Inténtalo de nuevo!'}
          </p>
        </ModalFeedback>
      </div>
    </>
  );
};
