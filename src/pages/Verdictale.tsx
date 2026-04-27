
import { useCallback } from 'react';
import { Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import { QUESTIONS } from '@/data/data-game-verdictale';
import { AnswerResult } from '@/games/game-verdictale/types/types';
import { Verdictale } from '@/games/game-verdictale/verdictale';

import 'books-ui/styles';

import '../styles/global.css';


export const GameVerdictalePage = () => {
  const handleResult = useCallback((result: AnswerResult) => {
    console.log('Resultado:', result);
  }, []);

  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Verdictale</h1>
      </div>
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <Row alignItems="center" justifyContent="center">
          <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
            <h2 className=" u-fs-400">Descripción del juego:</h2>
             <p>
                En <strong>Verdictale</strong>, los jugadores exploran un misterioso pueblo pixel art donde criaturas
                habitan dentro de las casas. Cada encuentro representa un desafío de conocimiento: deberás responder
                preguntas de verdadero o falso para avanzar.
              </p>
              <p>
                El nombre <strong>Verdictale</strong> nace de la combinación de dos conceptos:
                <br />
                <strong>“Verdict” (veredicto)</strong> y <strong>“Tale” (historia)</strong>. Esto representa la esencia
                del juego: <strong>una historia donde cada respuesta es un veredicto que define tu destino</strong>.
              </p>
              <p>
                Cada decisión cuenta. Tus respuestas determinan si logras liberar el pueblo o sucumbes ante las
                criaturas. Solo quienes piensen con claridad y actúen con precisión lograrán devolver la paz.
              </p>
              <p>
                El objetivo es visitar todas las casas, superar cada desafío y completar la historia tomando decisiones
                correctas. Solo quienes combinen lógica, atención y valentía podrán alcanzar el final.
              </p>
            <p className="u-fs-300 u-font-bold">Características:</p>
            <ul className="u-flow list_star">
              <li>
                <p>
                  <strong>Cantidad de preguntas:</strong> La cantidad de preguntas que se pueden presentar es totalmente personalizable y se reparten de manera aleatoria entre las casas.
                </p>
              </li>
              <li>
                <p>
                  <strong>Contenido de preguntas:</strong> Las preguntas son de verdadero o falso.
                </p>
              </li>
              <li>
                <p>
                  <strong>Tener en cuenta:</strong> Las unicas respuestas posibles son "verdadero" o "falso".
                </p>
              </li>
            </ul>
          </div>

          <Col xs="8">
            <Verdictale questions={QUESTIONS} onResult={handleResult} />
          </Col>
        </Row>
      </div>
    </>
  );
};
