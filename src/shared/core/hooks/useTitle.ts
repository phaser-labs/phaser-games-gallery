import { useEffect } from 'react';

import { eventUpdateTitle } from '../utils/eventUpdateTitle';

/**
 * Hook personalizada para actualizar el título de la página.
 *
 * @param title - El nuevo título que se va a establecer.
 */
export const useTitle = (title?: string) => {
  useEffect(() => {
    // Actualiza el título cuando cambia el valor de `title`
    if (title) {
      eventUpdateTitle(title);
    }
  }, [title]);
};
