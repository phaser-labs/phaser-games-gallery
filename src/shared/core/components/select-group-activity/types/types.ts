// Define el tipo Option que representa una opción individual en la actividad
export type Option = {
  id: string;
  answer: string;
};

export type Answer = {
  option: [string | string];
  state: 'wrong' | 'success';
};

export type OptionList = (null | string)[]

export type GroupOfOptionList = OptionList[];

// Define la interfaz InitialState que representa el estado inicial de la actividad
export interface InitialState {
  validation: boolean;
  button: boolean;
  result: boolean;
  options: GroupOfOptionList;
  answers: Answer[];
}

// Define la interfaz para el contexto de actividad de selección
export interface SelectGroupActivityContextType {
  addSelectedValues: (option: Option) => void;
  handleValidation: () => void;
  handleReset: () => void;
  selectedOptions: string[];
  validation: boolean;
  button: boolean;
  result: boolean;
  addSelectElementsId: (uid: string) => void;
  answers: Answer[];
}

// Enumeración para los estados posibles
export enum States {
  SUCCESS = 'success',
  WRONG = 'wrong'
}
