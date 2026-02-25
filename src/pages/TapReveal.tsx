import { useEffect, useState } from 'react';
import { Audio, Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';

import 'books-ui/styles';

import { animations } from '../games/game-tap-reveal/core/utils/AnimationsGsap';
import { globalState } from '../games/game-tap-reveal/core/utils/GlobalState';
import TapReveal from '../games/game-tap-reveal/TapReveal';

import '../styles/global.css';

export const TapRevealGame = () => {
  const [choose, setChoose] = useState(0);
  useEffect(() => {
    globalState.choose = choose;
    document.dispatchEvent(new CustomEvent('chooseChanged', { detail: choose }));
  }, [choose]);

  const handleClick = (value: number) => {
    setChoose(value);
  };
  useEffect(() => {
    const tapReveal__warningChose = document.querySelector('.tapReveal__warningChose') as HTMLElement;
    if (tapReveal__warningChose) {
      animations.animationsWarningMessage(tapReveal__warningChose, 0.8, 1, false);
    }
  }, []);

  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Tap Reveal</h1>
      </div>
      <div className={'container'} style={{ gridTemplateColumns: '1fr' }}>
        <Row justifyContent="center" alignItems="center">
          <div style={{ width: '60%', margin: '0 auto' }} className="u-flow">
            <h2 className=" u-fs-400">Descripción del juego:</h2>
            <p>
              Este juego es una dinámica interactiva donde el jugador debe adivinar imágenes ocultas. El desafío
              consiste en descubrir qué imagen se encuentra detrás del panel, utilizando la intuición y las pistas
              disponibles. El jugador dispone de tres ayudas especiales que solo pueden usarse una vez por ronda, y una
              ayuda ilimitada que puede activarse tantas veces como sea necesario, con una penalización de 5 puntos por
              cada uso. Cada respuesta incorrecta descuenta 10 puntos del marcador, por lo que la estrategia es
              fundamental para maximizar la puntuación. El objetivo final es responder correctamente a todas las
              imágenes del conjunto y obtener el puntaje más alto posible.
            </p>
            <p className="u-fs-300 u-font-bold">Características:</p>
            <ul className="u-flow list_star">
              <li>
                <p>
                  <strong>Imágenes:</strong> Crea tantas adivinanzas como quieras, con la libertad de usar todas las
                  imágenes que desees para adivinar.
                </p>
              </li>
              <li>
                <p>
                  <strong>Personalización:</strong> Personaliza a tu gusto la totalidad de los elementos gráficos, desde
                  las imágenes de las adivinanzas hasta los fondos y botones.
                </p>
              </li>
            </ul>
          </div>
          <Audio a11y src={`assets/audios/ally/aud_des_ova-26_sld-17__1.mp3`} />

          {choose !== 0 ? (
            <Col xs="12" hd="10">
              <Audio addClass="u-mb-2" src={`assets/audios/aud_ova-26_sld-17_1.mp3`} />
              <TapReveal />
            </Col>
          ) : (
            <Col xs="12" hd="12">
              <p className="tapReveal__Text_chose">Seleccione el estilo de actividad que desee realizar</p>
              <div className="containerBtnschose">
                <button className="tapReveal__btnChose" onClick={() => handleClick(1)}>
                  <img
                    src="assets/images/option_1.png"
                    alt="Opción de diseño 1: cajas coloridas, sistema de puntos con barra de progreso, y botones de ayudas redondos con imágenes adentro y un fondo de un paisaje de montañas en un atardecer"
                  />
                </button>
                <button className="tapReveal__btnChose" onClick={() => handleClick(2)}>
                  <img
                    src="assets/images/option_2.png"
                    alt="Opcion de diseño 2: Gráfica de puntuación de tipo manómetro con cuadrícula de imágenes de patos de diferentes colores y botones de ayudas de color rojo sin ningún tipo de imágenes o iconos."
                  />
                </button>
                <button className="tapReveal__btnChose" onClick={() => handleClick(3)}>
                  <img
                    src="assets/images/option_3.png"
                    alt="Opcion de diseño 3: Gráfica de puntos  con una copa  brillante, una cuadrícula  de figuras de colores  y botones de ayudas con colores vivos e  imágenes en la parte superior derecha."
                  />
                </button>
              </div>
              <div className="tapReveal__warningChose">
                <h2>Advertencia</h2>
                <p>
                  Todos los elementos multimedia empleados en el presente recurso (imágenes, sonidos, gráficos, vídeos,
                  etc.) han sido obtenidos a través de fuentes disponibles en Internet. No se garantiza que dichas obras
                  cuenten con licencias comerciales o permisos explícitos para su explotación, ni que sean de dominio
                  público.
                </p>
                <h2>Se recomienda encarecidamente:</h2>
                <ul className="tapReveal__warningChose-ul">
                  <li>
                    Desarrollar y utilizar recursos multimedia propios y originales, o asegurarse de que los elementos
                    usados tengan una licencia adecuada para uso comercial (por ejemplo, Creative Commons con derechos
                    comerciales permitidos, licencias pagas, etc.).
                  </li>
                  <li>
                    Actualizar el contenido del juego o recurso antes de su distribución comercial para reemplazar los
                    elementos multimedia sin licencia por otros debidamente autorizados.
                  </li>
                  <li>
                    Verificar y documentar la licencia de cada recurso antes de su inclusión en productos que se
                    ofrezcan con fines lucrativos.
                  </li>
                </ul>
                <p>
                  El titular del presente recurso no se responsabiliza por reclamaciones legales derivadas del uso
                  indebido de contenidos protegidos que no cuenten con permisos apropiados.
                </p>
              </div>
            </Col>
          )}
        </Row>
      </div>
    </>
  );
};
