import { useEffect,useReducer, useRef } from 'react';

import type { InitialState, Input } from './type/types';
import { InputActivityProvider } from './input-activity-context';
import { InputButton } from './input-button';
import { InputElement } from './input-element';


const INITIAL_STATE = Object.freeze({
    validation: false,
    button: true,
    result: false,
    inputs: []
});

interface Props {
    children: JSX.Element | JSX.Element[];
    onResult?: ({ result, inputs }: { result: boolean; inputs: Input[] }) => void;
    minSelected?: number;
}

type SubComponents = {
    Button: typeof InputButton;
    Input: typeof InputElement;
};

const Inputs: React.FC<Props> & SubComponents = ({ children, onResult }) => {
    const [activity, updateActivity] = useReducer(
        (prev: InitialState, next: Partial<InitialState>) => ({ ...prev, ...next }),
        INITIAL_STATE
    );

    const inputElementsId = useRef<string[]>([]);

    const addInputValues = (input: Input) => {
        const updatedInputs = activity.inputs.map(i => (i.id === input.id ? input : i));

        if (!updatedInputs.find(i => i.id === input.id)) {
            updatedInputs.push(input);
        }

        // Verificar si todos los inputs tienen una respuesta no vacía
        const allFilled = updatedInputs.every(input => input.userAnswer.length > 0);

        // Actualiza el estado para habilitar o deshabilitar el botón
        updateActivity({ inputs: updatedInputs, button: allFilled });
    };


    const addInputElementsId = (uid: string): void => {
        if (!inputElementsId.current.includes(uid)) {
            inputElementsId.current = [...inputElementsId.current, uid];
        }
    };


    /**
     * Se usa para la validación de toda la actividad,
     * está se encarga de comprobrar que el número de opciones
     * seleccionadas se igual al total de las correctas.
     */
    const handleValidation = () => {
        updateActivity({ validation: true, button: true });

        const allCorrect = activity.inputs.every(input =>
            input.correctAnswer.includes(input.userAnswer)
        );
        
        if (onResult) {
            onResult({ result: allCorrect, inputs: activity.inputs });
        }

        updateActivity({ validation: true, result: allCorrect });
    }

    /**
    * Reinicia la actividad a su estado inicial.
    */
    const handleReset = () => {
        inputElementsId.current = [];
        // Reseteamos las respuestas de los inputs
        updateActivity({
            validation: false,
            button: true,
            result: false,
            inputs: activity.inputs.map(input => ({
                ...input,
                userAnswer: '' // Limpiamos las respuestas del usuario
            }))
        });
    };

    /**
     * Usado para observar los cambios en la propiedad options del estado Activity.
     * esto con el fin del que si el total de opciones seleccionadas es igual al total de preguntas,
     * entonces active el botón que inicia la comprobación.
     */
    useEffect(() => {
        if (!activity.inputs.length) return;

        const allFilled = activity.inputs.length === inputElementsId.current.length;

        if (allFilled  && !activity.validation) {
            updateActivity({ button: false });
        }
    }, [activity.inputs, activity.validation]);

    return(
        <InputActivityProvider
            value={{
                addInputValues,
                handleValidation,
                handleReset,
                addInputElementsId,
                button: activity.button,
                result: activity.result,
                validation: activity.validation,
            }}>
            {children}
        </InputActivityProvider>
    );

};

Inputs.Button = InputButton;
Inputs.Input = InputElement;

export { Inputs };