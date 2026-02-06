
export interface WhackQuestion {
  question: string;
  options: string[]; // Array de opciones
  correctAnswer: number; // Índice de la respuesta correcta (0-based)
} 

  export const dataGameWhackAQuestion: WhackQuestion[] = [
  {
    question: '¿Cuál es la capital de Francia?',
    options: ['Paris', 'Berlin', 'Madrid', 'Roma'],
    correctAnswer: 0,
  },
    {
      question: '¿Cuánto es 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1
    }
];