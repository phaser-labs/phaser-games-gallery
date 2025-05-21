import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import css from './styles/bottle.module.css';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  letter: string;
  index: string;
  enable: boolean;
  onResult?: ({ index, letter }: { index: string; letter: string }) => void;
}

const Bottle: React.FC<Props> = ({ letter = 'A', index = 'hasdh767803h', enable = true, onResult, ...props }) => {
  const refBubble1 = useRef<HTMLImageElement>(null);
  const refBubble2 = useRef<HTMLImageElement>(null);
  const refBubble3 = useRef<HTMLImageElement>(null);
  const refCorcho = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    if (!enable && refBubble1.current && refBubble2.current && refBubble3.current && refCorcho.current) {
      gsap.to(refBubble1.current, { x: 30 + Math.random() * 70, y: -50, opacity: 0, duration: Math.random() * 3 });
      gsap.to(refBubble2.current, { x: 30 + Math.random() * 70, y: -50, opacity: 0, duration: Math.random() * 3 });
      gsap.to(refBubble3.current, { x: 30 + Math.random() * 70, y: -50, opacity: 0, duration: Math.random() * 3 });
      gsap.to(refCorcho.current, {
        x: 10 + Math.random() * 70,
        y: -60,
        opacity: 0,
        rotate: 450,
        duration: 1.5,
        onComplete: () => onResult?.({ index, letter })
      });
    }
  }, [enable]);

  return (
    <button
      className={css.container}
      style={{ animationDelay: `${Math.random() * 3}s` }}
      aria-label={`letra ${letter}`}
      disabled={!enable}
      {...props}
      >
      <div className={css.container__responsive}>
        <img src={!enable ? 'assets/images/Botella_sin_corcho.webp' : 'assets/images/Botella.webp'} alt="" />
        {!enable && (
          <>
            <img src="assets/images/Corcho.webp" className={css.corcho} ref={refCorcho} alt="" />
            <img
              src="assets/images/Burbuja_de_aire.webp"
              className={css.bubble}
              style={{ transform: `scale(0.2)` }}
              ref={refBubble1}
              alt=""
            />
            <img
              src="assets/images/Burbuja_de_aire.webp"
              className={css.bubble}
              style={{ transform: `scale(0.2)` }}
              ref={refBubble2}
              alt=""
            />
            <img
              src="assets/images/Burbuja_de_aire.webp"
              className={css.bubble}
              style={{ transform: `scale(0.2)` }}
              ref={refBubble3}
              alt=""
            />
          </>
        )}
        <span className={css.letter} style={{ opacity: !enable ? 0.3 : 1 }}>
          {letter}
        </span>
      </div>
    </button>
  );
};

export default Bottle;
