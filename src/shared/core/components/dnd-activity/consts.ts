import type { Announcements } from '@dnd-kit/core';

import { loadCSS } from '../../utils/loadCSS';

import { DndClasses, DndTypes } from './types/types';

const css = await loadCSS({
  ui: 'dnd-activity/dnd.module.css',
  local: 'dnd-activity/dnd.module.css'
});


export const INITIAL_STATE = Object.freeze({
  validation: false,
  button: true,
  result: false
});

export const DND_CLASSES: Record<DndTypes, DndClasses> = {
  draggable: { style: css['drag'], dragging: css['drag--dragging'] },
  droppable: { style: css['drop'], over: css['drop--over'] },
  'general-draggable': { style: css['general-drag'] }
};

// Constantes para las etiquetas de navegación en múltiples idiomas
export const i18n = {
  es: {
    screenReaderInstruction:
      'Si usas un lector de pantalla, desactiva el mouse virtual (insert+Z). Para seleccionar un elemento arrastrable, presiona la barra espaciadora o la tecla Enter. Mientras mantienes seleccionado, usa las teclas de flecha para mover el elemento en cualquier dirección deseada. Presiona nuevamente la barra espaciadora o la tecla Enter para soltar el elemento en su nueva posición, o presiona Escape para cancelar.'
  },
  en: {
    screenReaderInstruction:
      'If you use a screen reader, disable the virtual mouse. To pick up a draggable item, press the spacebar or the Enter key. While dragging, use the arrow keys to move the item in any desired direction. Press the spacebar or the Enter key again to drop the item in its new position, or press Escape to cancel.'
  }
};

export const defaultAnnouncements: Announcements = {
  onDragStart({ active }) {
    return `Se ha seleccionado la opción ${active.data.current?.label}.`;
  },
  onDragOver({ active, over }) {
    if (over) {
      return `la opción ${active.data.current?.label} se movió sobre la ${over.data.current?.label} opción desplegable.`;
    }

    return `la opción ${active.data.current?.label} ya no está sobre una opción desplegable.`;
  },
  onDragEnd({ active, over }) {
    if (over) {
      return `la opción ${active.data.current?.label} se soltó sobre la ${over.data.current?.label} opción desplegable.`;
    }

    return `la opción ${active.data.current?.label} se eliminó.`;
  },
  onDragCancel({ active }) {
    return `Se cancelo la selección. la opción ${active.data.current?.label} se eliminó.`;
  }
};
