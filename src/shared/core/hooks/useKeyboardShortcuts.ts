import { useEffect } from 'react';

import { keyboardShortcuts } from '../utils/keyboardShortcuts';

/**
 * Hook que agrega y elimina los event listeners de los atajos de teclado
 * @param isActive - Activar/Deshabiltiar
 */
export const useKeyboardShortcuts = (isDisabled: boolean = false) => {
  useEffect(() => {
    if (!isDisabled) {
      document.body.addEventListener('keydown', keyboardShortcuts);
    }
    return () => {
      document.body.removeEventListener('keydown', keyboardShortcuts);
    };
  }, [isDisabled]);
};
