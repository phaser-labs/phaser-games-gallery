import { EVENTS } from '../consts/events';

/**
 * Función para actualizar el título de la página.
 *
 * @param title - El nuevo título que se va a establecer.
 */
export const eventUpdateTitle = (title: string) => {
  // Crear un evento personalizado con el nuevo título como detalle
  const event = new CustomEvent(EVENTS.OVATITLEUPDATE, {
    detail: { title }
  });

  // Despachar el evento a nivel del documento
  document.dispatchEvent(event);
};
