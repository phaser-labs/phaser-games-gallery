import { useEffect, useId, useState } from 'react';
import { Audio } from 'books-ui';
import { AnimatePresence, motion } from 'framer-motion';

import { useOvaContext } from '@/context/ova-context';

import { loadCSS } from '../../utils/loadCSS';

import { i18n } from './utils/consts';
import { useTableTrueFalseContext } from './table-true-false-context';

const css = await loadCSS({
  ui: 'table-true-false/table-true-false.module.css',
  local: 'table-true-false/table-true-false.module.css'
});


interface Props {
  id: string;
  success: {
    feedback: string;
    audio: string;
    interpreter?: string;
  };
  wrong: {
    feedback: string;
    audio: string;
    interpreter?: string;
  };

  addClass?: string;
}

export const Feedback: React.FC<Props> = ({ id, success, wrong, addClass }) => {
  const { lang } = useOvaContext();
  const { searchOptionResultById, validation } = useTableTrueFalseContext();

  const uid = useId();
  const [showInterpreter, setShowInterpreter] = useState<boolean>(false);

  const result = searchOptionResultById(id);

  useEffect(() => {
    const handleInterpreterVisibility = ({ detail }: CustomEvent<{ hidden: boolean }>) => {
      setShowInterpreter(detail.hidden);
    };

    document.addEventListener('changeInterpreteVideoVisibility', handleInterpreterVisibility as EventListener);

    return () => {
      document.removeEventListener('changeInterpreteVideoVisibility', handleInterpreterVisibility as EventListener);
    };
  }, []);

  return (
    <AnimatePresence initial={false}>
      {validation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          data-result={result}
          className={`${css['feedback']} u-mt-2 u-mb-3 ${addClass ?? ''}`}
          aria-live="polite"
          aria-labelledby={uid}
          role="status">
          <div className="u-flow">
            <p className={css['feedback__title']}>{i18n[lang][result ? 'success' : 'wrong']}</p>
            <p id={uid} dangerouslySetInnerHTML={{ __html: result ? success.feedback : wrong.feedback }}></p>
            <Audio src={result ? success.audio : wrong.audio} />
          </div>
          {showInterpreter && (
            <video
              className={css['feedback__video-interpreter']}
              controls
              muted
              controlsList="nofullscreen nodownload noremoteplayback noplaybackrate foobar"
              src={`assets/videos/interprete/${result ? success.interpreter : wrong.interpreter}`}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
