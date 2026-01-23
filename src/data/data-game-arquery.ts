import { Question } from '@/games/game-simple-arquery/utils/types';


/**
 * Question Type:
 * @property {string} question - Texto de la pregunta.
 * @property { { a: string; b: string; c: string; d?: string } | { a: string; b: string; c: string; d?: string } } options - Opciones de la pregunta.
 * @property {'a' | 'b' | 'c' | 'd'} correctAnswer - La respuesta correcta.
 */


export const questionsDataArquery: Question[] = [
  {
    question:
      '1. ¿Cuáles son los componentes focales del <i>marketing</i> mix y cuál es el orden correcto de análisis?',
    options: {
      a: `- Producto - Precio - Promoción - Plaza`,
      b: `- Producto y Precio`,
      c: `- Producto - Precio - Plaza`,
      d: `- Producto - Precio - Plaza - Promoción`
    },
    correctAnswer: 'b'
  },
  {
    question: '2. ¿Cuáles serían algunos de los requerimientos que puede cubrir el marketing mix?',
    options: {
      a: `El lanzamiento de un producto nuevo, lanzamiento de un producto nuevo, lanzamiento de un producto nuevo, lanzamiento de un producto nuevo.`,
      b: `Todas las anteriores.`
    },
    correctAnswer: 'b'
  },
  {
    question: '3. Para el análisis de la variable de producto es importante tener en cuenta:',
    options: {
      a: `Reconocer qué problema resuelve el producto o servicio.`,
      b: `Identificar el público objetivo.`,
      c: `Identificar qué diferencial tiene el producto versus el que ofrece la competencia.`,
      d: `Todas las anteriores.`
    },
    correctAnswer: 'd'
  },
  {
    question: '4. En la variable de precio se puede decir que es un influenciador en la toma de decisión de compra.',
    options: {
      a: `Sí.`,
      b: `No.`,
      c: `Ocasionalmente.`
    },
    correctAnswer: 'a'
  }
];
