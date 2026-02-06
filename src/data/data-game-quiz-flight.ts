import { Options } from '@/games/game-quiz-flight/types/types';

export const initOptions: Options[] = [
  {
    id: 1,
    question: '¿Qué es IoT (Internet de las Cosas)?',
    answers: [
      { id: 1, text: 'Un tipo de nube para almacenamiento', correct: false },
      { id: 2, text: 'Red de dispositivos conectados que intercambian datos', correct: true },
      { id: 3, text: 'Una aplicación de mensajería instantánea', correct: false },
      { id: 4, text: 'Un protocolo de seguridad de Internet', correct: false }
    ]
  },
  {
    id: 2,
    question: '¿Qué es Deep Learning?',
    answers: [
      { id: 1, text: 'Un tipo de base de datos', correct: false },
      { id: 2, text: 'Un algoritmo de compresión de archivos', correct: false },
      { id: 3, text: 'Una técnica de diseño web', correct: false },
      { id: 4, text: 'Aprendizaje profundo usando redes neuronales', correct: true }
    ]
  },
  {
    id: 3,
    question:
      'Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. ',
    answers: [
      { id: 1, text: 'La simulación de procesos inteligentes por máquinas', correct: true },
      { id: 2, text: 'Un tipo de computadora física', correct: false },
      {
        id: 3,
        text: 'Es un hecho establecido hace demasiado tiempo que un lector se distraerá con el contenido del texto de un sitio mientras que mira su diseño.',
        correct: false
      }
    ]
  }
];
