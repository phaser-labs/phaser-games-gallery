import { useEffect, useMemo } from 'react';
import { usePanelContext as usePanel } from 'books-ui';
import { useAnimate } from 'framer-motion';

import { usePanelCoreContext } from '../panel-context';

/**
 * Hook personalizado para gestionar la visibilidad y animación de una sección del panel.
 * Maneja la adición de un título de sección y la animación de la sección basada en su estado de visibilidad.
 * 
 * @param {string} [titulo] - El título de la sección a agregar.
 * @returns {RefObject} scope - La referencia al elemento de la sección.
 */
export const useSectionManager = (title?: string) => {
  const { addSectionTitle } = usePanelCoreContext();
  const { isOpen } = usePanel();
  const [scope, animate] = useAnimate();

  // Memorizar el cálculo para determinar si la sección está visible
  const isInView = useMemo(() => {
    const uid = scope.current?.dataset.value;
    return uid === isOpen;
  }, [isOpen, scope]);

  useEffect(() => {
    if (title) {
      addSectionTitle(title);
    }
  }, [title, addSectionTitle]);

  useEffect(() => {
    if (isInView) {
      animate(scope.current, { y: 0, opacity: 1 }, { duration: 0.4, ease: 'easeIn', type: 'spring', stiffness: 100 });
    } else {
      animate(scope.current, { y: 40, opacity: 0 }, { duration: 0.4, ease: 'easeIn', type: 'spring', stiffness: 100 });
    }
  }, [isInView, animate, scope]);

  return scope;
};
