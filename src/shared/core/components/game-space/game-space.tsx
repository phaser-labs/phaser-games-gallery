import { FC, useEffect, useReducer } from 'react';

import type { InitialState, Option as OptionType } from './types/types';
import { SpaceButton } from './game-button';
import { RadioSpace } from './game-element';
import { GameSpaceProvider } from './game-space-context';

// Estado inicial de la actividad
const INITIAL_STATE: InitialState = {
    validation: false,
    button: true,
    result: false,
    options: [],
    selectedId: null
};

interface Props {
    children: JSX.Element | JSX.Element[];
    options: OptionType[];
}

type SubComponents = {
    Button: typeof SpaceButton;
    Option: typeof RadioSpace;
};


// Componente principal GameSpace
const GameSpace: FC<Props> & SubComponents = ({ children, options }) => {
    // Combina el estado inicial con las preguntas pasadas como props
    const initialStateWithOptions = { ...INITIAL_STATE, options };

    /**
     * Reducer para manejar el estado de la actividad.
     * @param {InitialState} state - Estado actual.
     * @param {Partial<InitialState>} action - Acción a aplicar.
     * @returns {InitialState} El nuevo estado.
     */
    const reducer = (state: InitialState, action: Partial<InitialState>): InitialState => {
        return { ...state, ...action };
    };

    // Hook useReducer para manejar el estado de la actividad
    const [activity, updateActivity] = useReducer(reducer, initialStateWithOptions);

    /**
     * Agrega o actualiza los valores de una opción.
     * @param {OptionType} option - Opción a actualizar.
     */
    const addOptionValues = (option : OptionType) => {
        const updatedOptions = activity.options.map(opt =>
            opt.id === option.id ? { ...opt, state: option.state } : opt
        );
        updateActivity({ options: updatedOptions });
    };

    /**
     * Maneja la validación de la opción seleccionada.
     */
    const handleValidation = () => {
        updateActivity({ validation: true, button: true }); 

        const selectedOption = activity.options.find(opt => opt.id === activity.selectedId);
        if (selectedOption) {
            const isSuccess = selectedOption.state === 'success';
            updateActivity({ result: isSuccess });
        } else {
            updateActivity({ result: false });
        }
    };

    /**
     * Maneja el reinicio del estado de la actividad.
     */
    const handleReset = () => {
        updateActivity({ ...INITIAL_STATE, options });
    };

    /**
     * Agrega el ID del elemento seleccionado.
     * @param {string | null} id - ID del elemento seleccionado.
     */
    const addOptionElementsId = (id: string | null): void => {
        updateActivity({ selectedId: id });
    };

    // Efecto para habilitar el botón "Comprobar" solo si hay una opción seleccionada
    useEffect(() => {
        if (activity.selectedId!==null && !activity.validation) {
            updateActivity({ button: false });
        }
    }, [activity.validation, activity.selectedId]);

    return(
        <GameSpaceProvider
        value={{ 
            ...activity, 
            addOptionValues,
            handleValidation,
            handleReset,
            addOptionElementsId, 
        }}>
            {children}
        </GameSpaceProvider>

    );
};

GameSpace.Button = SpaceButton;
GameSpace.Option = RadioSpace;

export { GameSpace };