// Define el tipo Option que representa una opción individual en la actividad
export type Input = {
  id: string;
  correctAnswer: string[];
  userAnswer: string;
  name: string;
};

// Define la interfaz InitialState que representa el estado inicial de la actividad
export interface InitialState {
  validation: boolean;
  button: boolean;
  result: boolean;
  inputs: Input[];
}

// Define la interfaz para el contexto de actividad
export interface InputActivityContextType {
  addInputValues: (option: Input) => void;
  handleValidation: () => void;
  handleReset: () => void;
  validation: boolean;
  button: boolean;
  result: boolean;
  addInputElementsId: (uid: string) => void;
}

// Enumeración para los estados posibles
export enum States {
  SUCCESS = 'success',
  WRONG = 'wrong'
}
