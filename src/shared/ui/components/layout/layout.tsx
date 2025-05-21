import { useCallback, useLayoutEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { useHashLocation } from 'wouter/use-hash-location';
import { REMOVE_HTML_TAGS_REGEX } from '@core/consts/removeHtmlTagsRegex';
import { useA11yAttribute } from '@core/hooks/useA11yAttribute';
import { useReduceMotion } from '@core/hooks/useReduceMotion';

import { useOvaContext } from '@/context/ova-context';

import { Footer } from '../footer';
import { Header } from '../header';
import { Interpreter } from '../interpreter'

const HOME_PATH = '/';
const PATH_REGEX = /\/page-(\d+)/;
interface Props {
  children: JSX.Element[] | JSX.Element;
}

export const Layout: React.FC<Props> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<number>(0);

  const [location] = useHashLocation();
  const { titles, baseTitle } = useOvaContext();

  // Detecta si el usuario prefiere reducir la animación
  const reduceMotion = useReduceMotion();
  // Obtener el estado de la propiedad de accesibilidad 'stopAnimations'
  const { stopAnimations } = useA11yAttribute();

  /**
   * Actualiza el título de la página según la página actual.
   */
  const updatePageTitle = useCallback(() => {
    const currentPageTitle = titles[currentPage - 1];

    if (currentPageTitle) {
      document.title = currentPageTitle.replace(REMOVE_HTML_TAGS_REGEX, '');
    } else {
      document.title = baseTitle.replace(REMOVE_HTML_TAGS_REGEX, '');
    }
  }, [titles, currentPage, baseTitle]);

  /**
   * Actualiza el estado de la página actual basado en la URL.
   * Se ejecuta después de que los cambios de diseño del DOM se han aplicado.
   */
  useLayoutEffect(() => {
    const currentPageNumber = (location.match(PATH_REGEX) || [null, '0'])[1];
    setCurrentPage(+currentPageNumber);
    updatePageTitle();
  }, [location, updatePageTitle]);

  return (
    <MotionConfig reducedMotion={`${stopAnimations || reduceMotion ? 'always' : 'never'}`}>
      <Header />
      <Interpreter />
      <main id="main" data-home={location === HOME_PATH} tabIndex={-1}>
        {children}
      </main>
      {location !== HOME_PATH ? <Footer currentPage={currentPage} /> : null}
    </MotionConfig>
  );
};
