import { useEffect, useState } from 'react';

const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Hook personalizado para detectar si el usuario prefiere reducir la animación
 */
export const useReduceMotion = () => {
  // Estado que almacena si el usuario prefiere reducir la animación
  const [match, setMatch] = useState<boolean>(() => window.matchMedia(REDUCE_MOTION_QUERY).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCE_MOTION_QUERY);

    // Handler para actualizar el estado cuando cambia la preferencia de reducir la animación
    const handler = (event: MediaQueryListEvent) => {
      setMatch(event.matches);
    };

    // Añadir el event listener para detectar cambios en la preferencia de reducir la animación
    mediaQuery.addEventListener('change', handler);

    // Limpiar el event listener al desmontar el componente
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  return match;
};
