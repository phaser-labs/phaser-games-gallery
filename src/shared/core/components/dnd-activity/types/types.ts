// Define la interfaz InitialState que representa el estado inicial de la actividad
export interface InitialState {
  validation: boolean;
  button: boolean;
  result: boolean;
}

export interface DndActivityContextType extends InitialState {
  handleValidation: () => void;
  handleReset: () => void;
}

export type DndTypes = 'draggable' | 'droppable' | 'general-draggable';

export interface DndClasses {
  style: string;
  dragging?: string;
  over?: string;
}
