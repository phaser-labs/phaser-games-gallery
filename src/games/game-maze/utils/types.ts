export interface Question {
  question: string;
  options: { a: string; b: string; c: string; d: string };
  correctAnswer: 'a' | 'b' | 'c' | 'd';
}

// const questions: Question[] = [
//   {
//     question: '¿Cuál de los siguientes es un ejemplo de un activo en contabilidad?',
//     options: {
//       a: 'Una deuda por pagar a un proveedor.',
//       b: 'Una propiedad que posee una empresa.',
//       c: 'El salario de los empleados.',
//       d: 'Un préstamo que se ha solicitado.'
//     },
//     correctAnswer: 'b'
//   }
// ];
