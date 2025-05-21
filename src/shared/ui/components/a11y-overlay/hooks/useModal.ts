import { useEffect, useRef } from 'react';

import type { useModalType } from '../types/types';

const KEYCODE = {
  ESC: 27
};

export const useModal = ({ ref, isOpen, onClose }: useModalType) => {
  /**
   * Referencia utilizada como "flag", para que cuando
   * cambie el estado isOpen.
   */
  const flagUpdatedState = useRef<boolean>(false);
  /**
   * Función para habilitar o deshabilitar la propiedad `inert`
   * en los elementos `main#main` y `footer`.
   * La propiedad `inert` se utiliza para quitar el focus y la interacción
   * de los elementos contenidos en estos elementos.
   *
   * @param {boolean} state - Estado para habilitar o deshabilitar `inert`
   */
  const inertToggle = (state: boolean) => {
    // Busca los elementos `main#main` y `footer` en el DOM
    const rootElements = document.querySelectorAll<HTMLElement>('header#header, main#main, footer');

    // Si no se encuentran los elementos, salir de la función
    if (rootElements.length === 0) return;

    // Habilita o deshabilita la propiedad `inert` según el estado
    rootElements.forEach((element) => {
      if ('inert' in element) {
        element.inert = state;
      }
    });
  };

  /**
   * Efecto encargado de mostrar el componente
   * cuando la propiedad isOpen es true.
   */
  useEffect(() => {
    if (isOpen && ref.current) {
      // Marcamos el estado de actualización como verdadero para rastrear si se ha actualizado.
      flagUpdatedState.current = isOpen;

      // Si el modal está abierto y hay una referencia válida al elemento del modal
      if (ref.current) {
        // Establecemos el enfoque en el elemento del modal para que el usuario pueda interactuar con él.
        ref.current.focus();
      }

      // Aplicamos el estado inert al #root
      inertToggle(isOpen);
      return;
    }

    // Cuando el modal se cierra
    if (flagUpdatedState.current) {
      flagUpdatedState.current = isOpen;

      // Quitamos el estado inert del #root
      inertToggle(isOpen);
    }
  }, [isOpen, ref]);

  /**
   * Cierra el modal al presionar la tecla "ESC".
   * @param {event} event - Evento del teclado
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.keyCode || event.which) === KEYCODE.ESC) {
      onClose();
    }
  };

  return {
    handleKeyDown
  };
};
