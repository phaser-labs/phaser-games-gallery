
import { useCallback } from 'react';
import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { QUESTIONS } from '@/data/data-game-temple-of-knowledge';
import { AttackGame } from '@/games/game-temple-of-knowledge/attack-game';
import { GameResult } from '@/games/game-temple-of-knowledge/types/types';

import '@styles/global.css';
    
export const TempleOfKnowledgePage = () => {

  const handleResult = useCallback((result: GameResult) => {
    console.log('Resultado de la revisión:', result);
    // setCurrentResult(result);
    // setTimeout(() => {
    //   setIsOpenModal(result.isCorrect ? true : false);
    // }, 1000);
  }, []);
  
  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>El Templo de Conocimiento</h1>
      </div>
      <div className={'container'}>
        <Row alignItems="center" justifyContent="center">
          <Col xs="12">
            <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
              <h2 className=" u-fs-400">Descripción del juego:</h2>
              <p>
                     Responde preguntas para derrotar enemigos. Cada pregunta tiene opciones y se valida si la respuesta fue
            correcta.
              </p>
              <p className="u-fs-300 u-font-bold">Características:</p>
              <ul className="u-flow list_star">
                <li>
                  <p>
                    <strong>Preguntas dinámicas:</strong>  puedes pasar cualquier lista de preguntas por props maximo 4 opciones y minimo 2 opciones.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Callback de resultados:</strong> recibes un <code>GameResult</code> en cada respuesta.
                  </p>
                </li>
              </ul>
            </div>
            
          </Col>
          <Col xs="12" md="7">
            <AttackGame questions={QUESTIONS} onResult={handleResult}/>
          </Col>
        </Row>
      </div>

    </>
  );
};
