import { useRef } from 'react';

import { useA11yAttribute } from '../../hooks/useA11yAttribute';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { FullScreenButton } from '../fullscreen-button';

import Crab from './Crab';

import css from './styles/level.module.css';

interface Props {
  children: JSX.Element[] | JSX.Element;
}

export const Parallax: React.FC<Props> = ({ children }) => {
  const cancelAnimation = useReduceMotion();
  const { stopAnimations } = useA11yAttribute();

  const refDeph1 = useRef<HTMLImageElement>(null);
  const refDeph2 = useRef<HTMLImageElement>(null);
  const refDeph3 = useRef<HTMLImageElement>(null);
  const refDeph4 = useRef<HTMLImageElement>(null);
  const crabContainer = useRef<HTMLDivElement>(null);

  const handleDepthMove: React.MouseEventHandler = (e) => {
    if (!cancelAnimation && !stopAnimations) {
      const offsetX = window.innerWidth / 2 - e.nativeEvent.clientX;
      const offsetY = window.innerHeight / 2 - e.nativeEvent.clientY;

      if (refDeph1.current) refDeph1.current.style.left = offsetX / 25 + 'px';
      if (refDeph2.current) refDeph2.current.style.left = offsetX / 100 + 'px';
      if (crabContainer.current) crabContainer.current.style.left = offsetX / 100 + 'px';
      if (refDeph3.current) refDeph3.current.style.left = offsetX / 150 + 'px';
      if (refDeph4.current) refDeph4.current.style.left = offsetX / 100 + 'px';

      if (refDeph1.current) refDeph1.current.style.top = offsetY / 25 + 'px';
      if (refDeph2.current) refDeph2.current.style.top = offsetY / 100 + 'px';
      if (crabContainer.current) crabContainer.current.style.top = offsetY / 100 + 'px';
      if (refDeph3.current) refDeph3.current.style.top = offsetY / 150 + 'px';
      if (refDeph4.current) refDeph4.current.style.top = offsetY / 100 + 'px';
    }
  };

  return (
    <div className={css.wrapper_depths} onMouseMove={handleDepthMove}>
      {/* Animacion de Profundidad*/}
      <img src="assets/images/Fondo_mar.webp" className={css.image_back} alt="" />
      <img src="assets/images/Fondo_mar.webp" className={css.image_depth} ref={refDeph4} alt="" />
      <img src="assets/images/Fondo_algas_detras_de_la_arena.webp" className={css.image_depth} ref={refDeph3} alt="" />
      <img src="assets/images/Fondo_arena.webp" alt="" ref={refDeph2} className={css.image_depth} />

      <div className={css.crab_container}>
        <div className={css.crap_surface} ref={crabContainer}>
          <Crab />
        </div>
      </div>

      <img src="assets/images/Fondo_Primer_plano.webp" className={css.image_depth} ref={refDeph1} alt="" />
      <FullScreenButton elementId="fullscreen__section" addClass={css.fullScreen__button} />

      {/* Burbujas */}
      {[...Array(8)].map((_, index) => (
        <img
          key={`bubble-${index}`}
          src="assets/images/Burbuja_de_aire.webp"
          className={css.bubble}
          style={{
            animationDelay: 2 + Math.random() * 10 + 's',
            left: Math.random() * 100 + '%',
            transform: `scale(${Math.min(Math.random(), 0.4)})`
          }}
          alt=""
        />
      ))}
      {children}
    </div>
  );
};
