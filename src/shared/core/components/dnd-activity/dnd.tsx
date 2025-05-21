import React, { Children, cloneElement, isValidElement, useReducer } from 'react';
import type { DragAndDropProps } from 'books-ui';
import { DragAndDrop } from 'books-ui';

import { useOvaContext } from '@/context/ova-context';

import { loadCSS } from '../../utils/loadCSS';

import type { DndTypes, InitialState } from './types/types';
import { defaultAnnouncements, DND_CLASSES, i18n, INITIAL_STATE } from './consts';
import { DndButton } from './dnd-buttons';
import { DndActivityProvider } from './dnd-context';

const css = await loadCSS({
  ui: 'dnd-activity/dnd.module.css',
  local: 'dnd-activity/dnd.module.css'
});

interface Props extends DragAndDropProps {
  onResult?: ({ result }: { result: boolean }) => void;
  minCorrectDrags: number;
}

type SubComponents = {
  Button: typeof DndButton;
};

const DndActivity: React.FC<Props> & SubComponents = ({
  id,
  children,
  minCorrectDrags,
  announcements = defaultAnnouncements,
  onResult,
  ...props
}) => {
  const { lang } = useOvaContext();
  const [activity, updatedActivity] = useReducer(
    (prev: InitialState, next: Partial<InitialState>) => ({ ...prev, ...next }),
    INITIAL_STATE
  );

  /**
   * Función que se encarga de validar
   * el valor proporcionado por el componente DragAndDrop.
   *
   * @param {string[]} value - ID del drag
   */
  const handleNewDrag = ({ validate: drags, active }: { validate: string[]; active: boolean }) => {
    const newListDrags = [...drags];
    const TOTAL_DRAGS_TO_THROW_CORRECT_MODAL = minCorrectDrags;

    if (active && activity.button) {
      updatedActivity({ button: !activity.button });
    }

    if (newListDrags.length === TOTAL_DRAGS_TO_THROW_CORRECT_MODAL) {
      updatedActivity({ result: true });
    }
  };

  /**
   * Valida la actividad actual y, si es necesario,
   * llama a la función `onResult` con el resultado.
   */
  const handleValidation = () => {
    const newActivityState = {
      validation: !activity.validation,
      button: !activity.button
    };

    if (onResult) {
      onResult({ result: activity.result });
    }

    if (!activity.result) {
      newActivityState.button = !activity.button;
    }

    // Actualiza la actividad con el nuevo resultado
    updatedActivity(newActivityState);
  };

  /**
   * Reinicia la actividad a su estado inicial.
   */
  const handleReset = () => {
    updatedActivity(INITIAL_STATE);
  };

  /**
   * Recorre todos los hijos del componente en busca de los
   * componentes del 'DragAndDrop' para aplicarle estilos a estos.
   *
   * @param {React.ReactNode} children
   * @returns React.ReactNode
   */
  const styleChildren = (children: React.ReactNode): React.ReactNode => {
    return Children.map(children, (child) => {
      if (!isValidElement(child)) return child;

      let styledChild = child;

      // Verificar si el elemento tiene la propiedad __TYPE
      if (child.props.__TYPE) {
        const { __TYPE, ...restProps } = child.props;

        // Verificar si existe una clase DND correspondiente para el tipo
        if (DND_CLASSES[__TYPE as DndTypes]) {
          const { style, dragging, over } = DND_CLASSES[__TYPE as DndTypes];

          // Clonar el elemento y agregar clases y propiedades adicionales
          styledChild = cloneElement(child, {
            ...restProps,
            addClass: `  ${style} ${child.props.addClass ?? ''}`,
            ...(dragging && { dragging }),
            ...(over && { over })
          });
        }
      }

      // Recursivamente estilizar los hijos del elemento si existen
      if (child.props.children) {
        styledChild = cloneElement(styledChild, {
          ...styledChild.props,
          children: styleChildren(styledChild.props.children)
        });
      }

      return styledChild;
    });
  };

  return (
    <DndActivityProvider value={{ handleValidation, handleReset, ...activity }}>
      <DragAndDrop
        id={id}
        validate={activity.validation}
        onValidate={handleNewDrag}
        announcements={announcements}
        screenReaderInstructions={i18n[lang].screenReaderInstruction}
        {...props}>
        <div className={css['wrapper']}>{styleChildren(children)}</div>
      </DragAndDrop>
    </DndActivityProvider>
  );
};

DndActivity.Button = DndButton;

export { DndActivity };
