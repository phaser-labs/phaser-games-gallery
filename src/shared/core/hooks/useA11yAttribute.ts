import { useEffect, useState } from 'react';
import { useA11y } from '@ui/components/a11y-overlay/hooks/useA11y';
import { ConfigA11y } from '@ui/components/a11y-overlay/types/types';

// Atributos de accesibilidad que se van a observar
const A11Y_ATTRIBUTES = [
  'data-dark-mode',
  'data-stop-animations',
  'data-keyboard-shortcuts',
  'data-contrast',
  'data-font-size',
  'data-line-height',
  'data-letter-spacing',
  'data-audio'
];

/**
 * Hook personalizado para gestionar los atributos de accesibilidad
 */
export const useA11yAttribute = () => {
  // Obtener la configuración inicial de accesibilidad
  const { config: INITIAL_STATE } = useA11y();
  const [match, setMatch] = useState<ConfigA11y>(INITIAL_STATE);

  /**
   * Convierte una cadena de texto en formato kebab-case a camelCase
   * @param {string} input - Cadena en formato kebab-case
   * @returns {string} - Cadena en formato camelCase
   */
  const convertToCamelCase = (input: string) => {
    return input
      .replace(/^data-/, '') // Eliminar el prefijo 'data-'
      .replace(/-./g, (match) => match.charAt(1).toUpperCase()); // Convertir a camelCase
  };

  /**
   * Convierte una cadena de texto a un valor booleano si es necesario
   * @param {string} value - Valor a convertir
   * @returns {boolean | string} - Valor booleano o la cadena original
   */
  const convertToBooleanIfNeeded = (value: string | boolean) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  };

  useEffect(() => {
    const HTML = document.querySelector('html') as HTMLElement;
    if (!HTML) return;

    /**
     * Maneja las mutaciones de los atributos observados
     * @param {MutationRecord[]} mutationList - Lista de mutaciones
     */
    const handleMutationAttributes = (mutationList: MutationRecord[]) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'attributes') {
          const property = convertToCamelCase(mutation.attributeName!);
          let propertyValue =
            HTML.getAttribute(mutation.attributeName!) || INITIAL_STATE[property as keyof typeof INITIAL_STATE];

          propertyValue = convertToBooleanIfNeeded(propertyValue);

          setMatch((prev) => ({ ...prev, [property]: propertyValue }));
        }
      }
    };

    const observer = new MutationObserver(handleMutationAttributes);

    // Iniciar la observación de mutaciones en el elemento HTML
    observer.observe(HTML, { attributes: true, attributeFilter: A11Y_ATTRIBUTES });

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return match;
};
