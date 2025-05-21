import { EVENTS } from '../consts/events';
import type { VideoURLs } from '../hooks/useInterpreter';

/**
 * Función para despachar un evento personalizado para cambiar las fuentes de video del intérprete.
 * @param {Object} param0 - Objeto que contiene las nuevas URLs de accesibilidad y de contenido.
 * @param {string} [param0.a11yURL] - URL del video de accesibilidad.
 * @param {string} [param0.contentURL] - URL del video de contenido.
 */
export const eventChangeInterpreterVideo = ({ a11yURL, contentURL }: VideoURLs) => {
  // Crear un evento personalizado con los nuevos videos como detalle
  const event = new CustomEvent(EVENTS.CHANGEINTERPRETEVIDEOSOURCES, {
    detail: { accesibilityURL: a11yURL, contentURL }
  });

  // Despachar el evento a nivel del documento
  document.dispatchEvent(event);
};
