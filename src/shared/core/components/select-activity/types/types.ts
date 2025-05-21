// Define el tipo Option que representa una opción individual en la actividad
export type Option = {
  id: string;
  answer: string;
  state: 'wrong' | 'success';
};

// Define la interfaz InitialState que representa el estado inicial de la actividad
export interface InitialState {
  validation: boolean;
  button: boolean;
  result: boolean;
  options: Option[];
}

// Define la interfaz para el contexto de actividad de selección
export interface SelectActivityContextType {
  addSelectedValues: (option: Option) => void;
  handleValidation: () => void;
  handleReset: () => void;
  selectedOptions: Option[];
  validation: boolean;
  button: boolean;
  result: boolean;
  addSelectElementsId: (uid: string) => void;
}

// Enumeración para los estados posibles
export enum States {
  SUCCESS = "success",
  WRONG = "wrong",
}

