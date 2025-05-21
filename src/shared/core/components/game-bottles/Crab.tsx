import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { useA11yAttribute } from '../../hooks/useA11yAttribute';
import { useReduceMotion } from '../../hooks/useReduceMotion';

import css from './styles/crab.module.css';

export default function Crab() {
  const tl = useMemo(() => gsap.timeline(), []);
  const cancelAnimation = useReduceMotion();
  const { stopAnimations } = useA11yAttribute();

  const refContainer = useRef<HTMLDivElement>(null);
  const refPatDer = useRef<HTMLImageElement>(null);
  const refPatIzq = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    tl.to(refPatIzq.current, { rotate: 30, duration: 0.5, repeat: -1, yoyo: true }, 0);
    tl.to(refPatDer.current, { rotate: -15, duration: 0.5, repeat: -1, yoyo: true }, 0);
    tl.to(refContainer.current, { x: 300, duration: 8, repeat: -1, yoyo: true, ease: 'power1.inOut' }, 0);
  }, []);

  useEffect(() => {
    tl.restart();
    if (cancelAnimation || stopAnimations) {
      tl.pause();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelAnimation, stopAnimations]);

  return (
    <div className={css.container} ref={refContainer}>
      <img src="assets/images/Cangrejo 1_pat_izq.webp" className={css.pat_izq} ref={refPatIzq} alt="" />
      <img src="assets/images/Cangrejo1_torso.webp" className={css.torso} alt="" />
      <img src="assets/images/Cangrejo 1_pat_der.webp" className={css.pat_der} ref={refPatDer} alt="" />
      <img src="assets/images/Cangrejo 1_tenaza.webp" className={css.tenaza_izq} alt="" />
      <img src="assets/images/Cangrejo 1_tenaza.webp" className={css.tenaza_der} alt="" />
      <img src="assets/images/Cangrejos_sombras.webp" className={css.shadow} alt="" />
    </div>
  );
}
