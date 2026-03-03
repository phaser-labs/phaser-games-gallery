import { useCallback } from 'react';
import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { CHALLENGE } from '@/data/data-tricky-rush';
import { TrickyGame } from '@/games/game-tricky-rush/tricky-game';
import { GameResult } from '@/games/game-tricky-rush/types/types';


export const TrickyRushPage = () => {
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
        <h1>TRICKY GAME</h1>
      </div>
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <Row alignItems="center" justifyContent="center">
          <Col xs="12">
            <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
              <h2 className="u-fs-500">Descripción del juego:</h2>
              <p>
                En <strong>Tower Rush</strong>, los jugadores ponen a prueba su agilidad mental y coordinación
                construyendo una torre mientras resuelven frases correctamente. Cada palabra correcta fortalece la
                estructura, pero los errores invocan bloques peligrosos que pueden desestabilizarla.
              </p>
              <p>
                El objetivo es completar todos los desafíos sin tocar el láser ni perder todas las vidas. Solo quienes
                logren equilibrio entre rapidez y precisión podrán dominar la torre.
              </p>
              <p className="u-fs-400">
                <strong>Características:</strong>
              </p>
              <ul className="u-flow list_star">
                <li>
                  <strong>Desafíos de construcción de frases:</strong>
                  El jugador recibe un conjunto de palabras desordenadas y debe organizarlas correctamente para formar
                  la oración completa.
                </li>
                <li>
                  <strong>Múltiples frases:</strong>
                  El juego puede incluir varias frases por partida, aumentando progresivamente la dificultad.
                </li>
                <li>
                  <strong>Mecánica estilo arcade:</strong>
                  Cada acierto genera bloques que se apilan en la torre. Los errores producen bloques de penalización
                  que dificultan el equilibrio.
                </li>
                <li>
                  <strong>Sistema de vidas:</strong>
                  Si la torre colapsa o el jugador toca el láser, pierde vidas. Al agotarse, la partida termina.
                </li>
                <li>
                  <strong>Personalización de mundos:</strong>
                  Se puede escoger entre diferentes diseños de escenarios, cada uno con su propio estilo visual.
                </li>
                <li>
                  <strong>Selección de personaje y materiales:</strong>
                  El jugador puede elegir su personaje y el tipo de bloque (normal, vidrio o piedra).
                </li>
              </ul>
            </div>
          </Col>
          <Col xs="12" md="8">
            <TrickyGame words={CHALLENGE} onResult={handleResult} />
          </Col>
        </Row>
      </div>
    </>
  );
}

