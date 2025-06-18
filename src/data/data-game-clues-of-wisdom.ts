import { LevelStructure } from '../games/game-clues-of-wisdom/utils/types';

/* 
Este ejemplo de datos es para completar la frase con palabras específicas. (Words con isTarget: true)

La forma de jugar es armar toda la frase. Las palabras deben estar en el orden correcto.

El orden de las palabras en el Text sí importa.
Por lo que ya tienen que estar en el orden correcto para que el juego funcione bien.

Cada palabra dentro del array de words (tanto del modo completar frase como del modo armar frase) va a tener un orden por index.
*/

export const level1Data: LevelStructure[] = [{
  id: 'level1_forest',
  words: [
    { text: 'El', isTarget: false },
    { text: 'zorro', isTarget: true },
    { text: 'marrón', isTarget: false },
    { text: 'saltó', isTarget: true },
    { text: 'sobre', isTarget: false },
    { text: 'el', isTarget: false },
    { text: 'perro', isTarget: true },
    { text: 'perezoso.', isTarget: false }
  ],
  promptText: 'El ____ marrón ____ sobre el ____ perezoso.',
  feedback: {
    sentenceCompleteAudio: 'sfx_level_complete',
    sentenceCompleteText: '¡Frase completada!'
  }
},
  {
    id: "beach_message_bottle",
    words: [
        { text: "Una", isTarget: false },
        { text: "botella", isTarget: false },
        { text: "trajo", isTarget: false },
        { text: "un", isTarget: false },
        { text: "mensaje", isTarget: false },
        { text: "secreto.", isTarget: false },
    ],
    promptText: "Descifra el mensaje de la botella.",
    feedback: {
        sentenceCompleteText: "¡Mensaje revelado!"
    }
  }
];

