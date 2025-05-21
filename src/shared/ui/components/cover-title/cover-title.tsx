import React, { useEffect } from 'react';
import { Audio, useMedia } from 'books-ui';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import type { VideoURLs } from '@core/hooks/useInterpreter';
import { useInterpreter } from '@core/hooks/useInterpreter';
import { focusMainElement } from '@core/utils/focusMain';

import { useOvaContext } from '@/context/ova-context';

import css from './cover-title.module.css';

interface Props {
  addClass?: string;
  title: string;
  url?: string;
  interpreter?: VideoURLs;
  largeCover?: boolean;
  audio?: {
    a11y: string;
    title: string;
  };
}

const i18n = {
  es: {
    label: 'Iniciar'
  },
  en: {
    label: 'Start'
  }
};

export const CoverTitle: React.FC<Props> = ({
  addClass,
  title,
  url = 'assets/base/cover.webp',
  audio,
  largeCover,
  interpreter
}) => {
  const [updateVideoSources] = useInterpreter();
  const { lang } = useOvaContext();

  const currentURL = useMedia(['(max-width: 1080px)'], ['assets/base/cover-mobile.webp'], url);

  useEffect(() => {
    if (!interpreter) return;
    updateVideoSources({ mode: 'fixed', ...interpreter });
  }, [interpreter, updateVideoSources]);

  return (
    <motion.section
      className={`${css['cover-title']} ${addClass ?? ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}>
      <div className={css['background']}></div>
      <div className={css['cover-title__audio']}>{audio ? <Audio a11y src={audio.a11y} /> : null}</div>
      <div className={`${css['cover-title__title']} u-px-9`}>
        {audio ? <Audio src={audio.title} /> : null}
        <h1 dangerouslySetInnerHTML={{ __html: title }}></h1>
        <Link
          to="/page-1"
          className={css['cover-title__link']}
          aria-label={i18n[lang].label}
          onClick={focusMainElement}>
          {i18n[lang].label}
        </Link>
      </div>
      <img
        className={css['cover-title__img']}
        {...(largeCover && { style: { '--header-cover-image-size': 'min(100% - 2rem, 60vh)' } as React.CSSProperties })}
        src={currentURL}
        alt=""
      />
      <div style={{ gridArea: 'menu'}}></div>
    </motion.section>
  );
};
