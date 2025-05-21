
export type Option = {
    id: string;
    label: string;
    correct: boolean;
};

export interface InitialState {
    validation: boolean;
    button: boolean;
    result: boolean;
    options: Option[];
    selectedIds: Record<string, boolean>;
}

export interface TrueFalseContextType {
    addOptionValues: (id: string, answer: boolean) => void;
    handleValidation: () => void;
    handleReset: () => void;
    searchOptionResultById: (id: string) => boolean;
    validation: boolean;
    button: boolean;
    result: boolean;
    selectedIds: Record<string, boolean>;
}

// Enumeración para los estados posibles
export enum States {
    SUCCESS = 'success',
    WRONG = 'wrong'
}