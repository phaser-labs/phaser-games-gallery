import { useEffect, useReducer, useRef } from 'react';

import type { InitialState, Option } from './types/types';
import { States } from './types/types';
import { CheckboxActivityProvider } from './checkbox-activity-context';
import { CheckboxButton } from './checkbox-button';
import { CheckboxElement } from './checkbox-element';

const INITIAL_STATE = Object.freeze({
  validation: false,
  button: true,
  result: false,
  options: []
});

interface Props {
  children: JSX.Element | JSX.Element[];
  onResult?: ({ result, options }: { result: boolean; options: Option[] }) => void;
  minSelected?: number;
}

type SubComponents = {
  Checkbox: typeof CheckboxElement;
  Button: typeof CheckboxButton;
};

const Checkboxs: React.FC<Props> & SubComponents = ({ children, onResult, minSelected = 1 }) => {
  const [activity, updateActivity] = useReducer(
    (prev: InitialState, next: Partial<InitialState>) => ({ ...prev, ...next }),
    INITIAL_STATE
  );

  // Referencia mutable para almacenar los uid de cada componente <RadioElement/>
  const checkboxElementsId = useRef<string[]>([]);

  /**
   * Agrega el ID de un componente RadioElement
   * para realizar la validación de la actividad.
   * @param {string} uid - El ID del componente RadioElement.
   */
  const addCheckboxElementsId = (uid: string): void => {
    if (!checkboxElementsId.current.includes(uid)) {
      checkboxElementsId.current = [...checkboxElementsId.current, uid];
    }
  };

  /**
   * Creada para almacenar los radio seleccionados,
   * se crea un nuevo objecto con el id de la pregunta y el valor del radio.
   *
   * @param {String} id - id de la pregunta.
   * @param {Object} value - valor del radio seleccionado.
   */
  const addCheckboxsValues = ({ id, name, state }: Option) => {
    updateActivity({
      options: [...activity.options.filter((option) => option.id !== id), { id, name, state }]
    });
  };

  /**
   * Se usa para la validación de toda la actividad,
   * está se encarga de comprobrar que el número de opciones
   * seleccionadas se igual al total de las correctas.
   */
  const handleValidation = () => {
    updateActivity({ validation: true, button: true });

    const result = activity.options.every(({ state }) => state === States.SUCCESS);
    console.log("🚀 ~ handleValidation ~ result:", result)

    if (onResult) {
      onResult({ result, options: activity.options });
    }

    // Actualiza la actividad con el nuevo resultado
    updateActivity({ result: result });
  };

  /**
   * Reinicia la actividad a su estado inicial.
   */
  const handleReset = () => {
    activity.options.forEach(({ id }) => {
      // Busca el elemento del DOM correspondiente al nombre de opción y tipo de input 'radio'
      const element = document.querySelector(`input[type='checkbox'][id='${id}']`) as HTMLInputElement;

      if (element) {
        // Si se encuentra el elemento, establece su propiedad 'checked' en false para deseleccionarlo
        element.checked = false;
      }
    });
    updateActivity(INITIAL_STATE);
  };

  /**
   * Usado para observar los cambios en la propiedad options del estado Activity.
   * esto con el fin del que si el total de opciones seleccionadas es igual al total de preguntas,
   * entonces active el botón que inicia la comprobación.
   */
  useEffect(() => {
    if (!activity.options.length) return;

    const MITAD = 2;
    const MIN_SELECTED = minSelected || checkboxElementsId.current.length / MITAD;

    if (MIN_SELECTED === activity.options.length && !activity.validation) {
      updateActivity({ button: false });
    }
  }, [activity.options, activity.validation, checkboxElementsId, minSelected]);

  return (
    <CheckboxActivityProvider
      value={{
        addCheckboxsValues,
        handleValidation,
        addCheckboxElementsId,
        handleReset,
        button: activity.button,
        result: activity.result,
        validation: activity.validation
      }}>
      {children}
    </CheckboxActivityProvider>
  );
};

Checkboxs.Checkbox = CheckboxElement;
Checkboxs.Button = CheckboxButton;

export { Checkboxs };
