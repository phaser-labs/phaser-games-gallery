import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import type { GroupOfOptionList,InitialState, Option, OptionList } from './types/types';
import { States } from './types/types';
import { SelectGroupActivityProvider } from './select-group-activity-context';
import { SelectButton } from './select-group-button';
import { SelectElement } from './select-group-element';

const INITIAL_STATE: InitialState = Object.freeze({
  validation: false,
  button: true,
  result: false,
  options: [],
  answers: []
});

interface Props {
  children: JSX.Element | JSX.Element[];
  onResult?: ({ result, options }: { result: boolean; options: OptionList }) => void;
  minCorrect?: number;
  correctAnswers: [string, string][];
}

type SubComponents = {
  Select: typeof SelectElement;
  Button: typeof SelectButton;
};

const SelectsGroup: React.FC<Props> & SubComponents = ({ children, correctAnswers, onResult }) => {
  const createInitialState = useCallback(() => {
    const COLUMNS = 2;
    const initialState = { ...INITIAL_STATE };
    const optionsArray: GroupOfOptionList = [];

    for (let i = 0; i < correctAnswers.length; i++) {
      optionsArray[i] = [];
      for (let j = 0; j < COLUMNS; j++) {
        optionsArray[i][j] = null;
      }
    }

    initialState.options = optionsArray;
    return initialState;
  }, [correctAnswers]);

  const [activity, updateActivity] = useReducer(
    (prev: InitialState, next: Partial<InitialState>) => ({ ...prev, ...next }),
    createInitialState()
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

  const updateOptionAtPosition = (rowIndex: number, columnIndex: number, newValue: string) => {
    if (!activity.options[rowIndex]) return;

    // Crear una copia de la fila actual
    const updatedRow = [...activity.options[rowIndex]];
    updatedRow[columnIndex] = newValue;

    // Crear una copia del array de opciones y reemplazar la fila actualizada
    const updatedOptions = [...activity.options];
    updatedOptions[rowIndex] = updatedRow;

    return updatedOptions;
  };

  /**
   * Agrega la opción seleccionadas por parte de los Select.
   * @param {Option} option - La opción seleccionada que se va a agregar.
   */
  const addSelectedValues = ({ id, answer }: Option) => {
    const halfElementCount = selectElementsId.current.length / 2;
    const elementIndex = selectElementsId.current.findIndex((value) => value === id);

    if (elementIndex < 0) return;

    const column = elementIndex + 1 > halfElementCount ? 1 : 0; // Determina la columna (0 o 1)
    const row = elementIndex % correctAnswers.length;

    const updatedOptions = updateOptionAtPosition(row, column, answer);
    updateActivity({ options: updatedOptions });
  };

  /**
   * Valida la actividad actual y, si es necesario,
   * llama a la función `onResult` con el resultado.
   */
  const handleValidation = () => {
    updateActivity({ validation: true, button: true });

    const validationStates: States[] = [];
    const answers = []

    for (let optionIndex = 0; optionIndex < activity.options.length; optionIndex++) {
      const selectedOption = activity.options[optionIndex][0]; // Primer elemento de cada opción seleccionada

      for (let correctIndex = 0; correctIndex < correctAnswers.length; correctIndex++) {
        const correctOption = correctAnswers[correctIndex][0]; // Primer elemento de cada opción correcta

        // Comparar las opciones seleccionadas con las correctas
        if (selectedOption === correctOption) {
          const validationState =
            JSON.stringify(activity.options[optionIndex]) === JSON.stringify(correctAnswers[correctIndex])
              ? States.SUCCESS
              : States.WRONG;

          validationStates.push(validationState);
          answers.push(
            { option: activity.options[optionIndex] as [string | string], state: validationState }
          )
        }
      }
    }
    
    const isAllCorrect = validationStates.every((state) => state === States.SUCCESS);

    if (onResult) {
      onResult({ result: isAllCorrect, options: [...activity.options].flat() });
    }

    // Actualizar el estado de la actividad con el resultado final
    updateActivity({ result: isAllCorrect, answers });
  };

  /**
   * Reinicia la actividad a su estado inicial.
   */
  const handleReset = () => {
    const resetState = createInitialState();
    updateActivity(resetState);
  };

  const selectedOptions = useMemo(() => {
    return activity.options.flat().filter(Boolean) as string[];
  }, [activity.options]);

  /**
   * Usado para observar los cambios en la propiedad options del estado Activity.
   * esto con el fin del que si el total de opciones seleccionadas es igual al total de elementos Select,
   * entonces active el botón que inicia la comprobación.
   */
  useEffect(() => {
    if (!selectedOptions.length) return;

    if (selectElementsId.current.length === selectedOptions.length && !activity.validation) {
      updateActivity({ button: false });
    }
  }, [selectedOptions, activity.validation, selectElementsId]);

  return (
    <SelectGroupActivityProvider
      value={{
        addSelectedValues,
        handleValidation,
        addSelectElementsId,
        handleReset,
        button: activity.button,
        result: activity.result,
        validation: activity.validation,
        selectedOptions,
        answers: activity.answers
      }}>
      {children}
    </SelectGroupActivityProvider>
  );
};

SelectsGroup.Select = SelectElement;
SelectsGroup.Button = SelectButton;

export { SelectsGroup };
