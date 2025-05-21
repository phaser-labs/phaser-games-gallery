import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { VideoURLs } from '@core/hooks/useInterpreter';
import { useInterpreter } from '@core/hooks/useInterpreter';

import { PageTitle } from '../page-title';

import css from './content.module.css';

interface Props {
  addClass?: string;
  children: React.ReactNode;
  interpreter?: VideoURLs;
}

export const Content: React.FC<Props> = ({ addClass, children, interpreter, ...props }) => {
  const [updateVideoSources] = useInterpreter();

  useEffect(() => {
    if (!interpreter) return;
    updateVideoSources({ mode: 'fixed', ...interpreter });
  }, [interpreter, updateVideoSources]);

  return (
    <motion.section
      className={`${css['content']} ${addClass ?? ''}`}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeIn', type: 'spring', stiffness: 100 }}
      {...props}>
      <PageTitle />
      {children}
    </motion.section>
  );
};
