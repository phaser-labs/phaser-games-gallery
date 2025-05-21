import { Question } from '@/games/game-simple-arquery/utils/types';


/**
 * Question Type:
 * @property {string} question - Texto de la pregunta.
 * @property { { a: string; b: string; c: string; d?: string } | { a: string; b: string; c: string; d?: string } } options - Opciones de la pregunta.
 * @property {'a' | 'b' | 'c' | 'd'} correctAnswer - La respuesta correcta.
 * @property {{
 *   successAudio: string;
 *   wrongAudio: string;
 *   correctText: string;
 *   incorrectText: string;
 * }} feedback - Feedback de la pregunta.
 */


export const questionsDataArquery: Question[] = [
  {
    question:
      '1. ¿Cuáles son los componentes focales del <i>marketing</i> mix y cuál es el orden correcto de análisis?',
    options: {
      a: `
      - Producto
      - Plaza
      - Precio
      - Marketing`,
      b: `
      - Producto
      - Precio
      - Plaza
      - Promoción`,
      c: `
      - Promoción
      - Precio
      - Plaza`,
      d: `
      - Plaza
      - Promoción
      - Producto
      - Precio`
    },
    correctAnswer: 'b',
    feedback: {
        successAudio: "assets/audios/aud_ova-46_sld-16_1_correcto.mp3",
        wrongAudio: "assets/audios/aud_ova-46_sld-16_1_correcto.mp3",
        correctText: `
          Excelente. Respondiste adecuadamente. <br />
          Seleccionaste las 4P del <i>marketing mix</i>.
        `,
        incorrectText: `
        
        Fallaste. Inténtalo nuevamente.
          Revisa la siguiente información:
          <a class="feedbackLink" href="https://blog.hubspot.es/marketing/marketing-mix" aria-labelledby="bibliography-link-1" target="_blank" rel="noreferrer">
          https://blog.hubspot.es/marketing/marketing-mix
          </a>
        ` 
      }
  },
  {
    question: '2. ¿Cuáles serían algunos de los requerimientos que puede cubrir el marketing mix?',
    options: {
      a: `El lanzamiento de un producto nuevo.`,
      b: `Cambiar la imagen de una marca.`,
      c: `Impactar un nuevo nicho de mercado.`,
      d: `Todas las anteriores.`
    },
    correctAnswer: 'd',
    feedback: {
        successAudio: "assets/audios/aud_ova-46_sld-16_2_correcto.mp3",
        wrongAudio: "assets/audios/aud_ova-46_sld-16_2_correcto.mp3",
        correctText: `
        
         Excelente. Respondiste adecuadamente.
        `,
        incorrectText: `
         
          Fallaste. Inténtalo nuevamente.
          Revisa la siguiente información:
          <a class="feedbackLink" href="https://blog.hubspot.es/marketing/marketing-mix" aria-labelledby="bibliography-link-1" target="_blank" rel="noreferrer">
          https://blog.hubspot.es/marketing/marketing-mix
          </a>
        
        ` 
      }
  },
  {
    question: '3. Para el análisis de la variable de producto es importante tener en cuenta:',
    options: {
      a: `Reconocer qué problema resuelve el producto o servicio.`,
      b: `Identificar el público objetivo.`,
      c: `Identificar qué diferencial tiene el producto versus el que ofrece la competencia.`,
      d: `Todas las anteriores.`
    },
    correctAnswer: 'd',
    feedback: {
        successAudio: "assets/audios/aud_ova-46_sld-16_3_correcto.mp3",
        wrongAudio: "assets/audios/aud_ova-46_sld-16_3_correcto.mp3",
        correctText: `
          Excelente. Respondiste adecuadamente.`,
        incorrectText: `
        
          Fallaste. Inténtalo nuevamente.
          Revisa la siguiente información:
         <a class="feedbackLink" href="https://blog.hubspot.es/marketing/marketing-mix" aria-labelledby="bibliography-link-1" target="_blank" rel="noreferrer">
          https://blog.hubspot.es/marketing/marketing-mix
          </a>
        
        ` 
      }
  },
  {
    question: '4. En la variable de precio se puede decir que es un influenciador en la toma de decisión de compra.',
    options: {
      a: `Sí.`,
      b: `No.`,
      c: `Ocasionalmente.`
    },
    correctAnswer: 'a',
    feedback: {
        successAudio: "assets/audios/aud_ova-46_sld-16_4_correcto.mp3",
        wrongAudio: "assets/audios/aud_ova-46_sld-16_4_correcto.mp3",
        correctText: `
        
          Excelente. Respondiste adecuadamente.
        `,
        incorrectText: `
        
          Fallaste. Inténtalo nuevamente.
          Revisa la siguiente información:
          <a class="feedbackLink" href="https://blog.hubspot.es/marketing/marketing-mix" aria-labelledby="bibliography-link-1" target="_blank" rel="noreferrer">
          https://blog.hubspot.es/marketing/marketing-mix
          </a>
        
        ` 
      }
  }
];
