import { useEffect, useReducer, useRef } from 'react';

import type { InitialState, Option } from './types/types';
import { States } from './types/types';
import { SelectActivityProvider } from './select-activity-context';
import { SelectButton } from './select-button';
import { SelectElement } from './select-element';

const INITIAL_STATE = Object.freeze({
  validation: false,
  button: true,
  result: false,
  options: []
});

interface Props {
  children: JSX.Element | JSX.Element[];
  onResult?: ({ result, options }: { result: boolean; options: Option[] }) => void;
  minCorrect?: number;
}

type SubComponents = {
  Select: typeof SelectElement;
  Button: typeof SelectButton;
};

const Selects: React.FC<Props> & SubComponents = ({ children, onResult }) => {
  const [activity, updateActivity] = useReducer(
    (prev: InitialState, next: Partial<InitialState>) => ({ ...prev, ...next }),
    INITIAL_STATE
  );

  // Referencia mutable para almacenar los uid de cada componente <SelectElement/>
  const selectElementsId = useRef<string[]>([]);

  /**
   * Agrega el ID de un componente Select
   * para realizar la validación de la actividad.
   * @param {string} uid - El ID del componente Select.
   */
  const addSelectElementsId = (uid: string): void => {
    if (!selectElementsId.current.includes(uid)) {
      selectElementsId.current = [...selectElementsId.current, uid];
    }
  };

  /**
   * Agrega la opción seleccionadas por parte de los Select.
   * @param {Option} option - La opción seleccionada que se va a agregar.
   */
  const addSelectedValues = ({ id, answer, state }: Option) => {
    const { options } = activity;
    const selectedOptionIndex = options.findIndex((option) => option.id === id);

    // Crear un nuevo array de opciones actualizadas
    const newSelectedOptions =
      selectedOptionIndex >= 0
        ? options.map((opt, index) => (index === selectedOptionIndex ? { ...opt, answer, state } : opt))
        : [...options, { id, answer, state }];

    updateActivity({ options: newSelectedOptions });
  };

  /**
   * Valida la actividad actual y, si es necesario,
   * llama a la función `onResult` con el resultado.
   */
  const handleValidation = () => {
    updateActivity({ validation: true, button: true });

    let result: boolean = false;

    if (selectElementsId.current.length === activity.options.length) {
      result = activity.options.every(({ state }) => state === States.SUCCESS);
    }

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
    updateActivity(INITIAL_STATE);
  };

  /**
   * Usado para observar los cambios en la propiedad options del estado Activity.
   * esto con el fin del que si el total de opciones seleccionadas es igual al total de elementos Select,
   * entonces active el botón que inicia la comprobación.
   */
  useEffect(() => {
    if (!activity.options.length) return;

    if (selectElementsId.current.length === activity.options.length && !activity.validation) {
      updateActivity({ button: false });
    }
  }, [activity.options, activity.validation, selectElementsId]);

  return (
    <SelectActivityProvider
      value={{
        addSelectedValues,
        handleValidation,
        addSelectElementsId,
        handleReset,
        button: activity.button,
        result: activity.result,
        validation: activity.validation,
        selectedOptions: activity.options
      }}>
      {children}
    </SelectActivityProvider>
  );
};

Selects.Select = SelectElement;
Selects.Button = SelectButton;

export { Selects };
