/**
 * Interfaz para definir una palabra individual dentro de la frase,
 * indicando si es una de las que el jugador debe encontrar.
 */
export interface WordData {
  text: string;        // El texto de la palabra. Ej: "gato", "corre"
  isTarget: boolean;   // true si esta palabra es un objetivo a encontrar/recolectar.
                       // false si es una palabra fija que ya se muestra.
}

/**
 * Interfaz para definir la configuración de una frase completa,
 * que puede contener múltiples palabras.
 */

export interface LevelStructure { 
  id: number | string; // ID único para este desafío.

  // Array de palabras que componen la frase, en orden.
  // Aquí se define qué palabras son fijas y cuáles son objetivos.
  words: WordData[];

  // Opcional: Texto de ayuda o pista que se muestra al jugador.
  // Ej: "Encuentra las palabras para completar: El ____ veloz ____ sobre la ____."
  promptText?: string;
  feedback?: {
    // Cuando se completa TODA la frase.
    sentenceCompleteAudio?: string;
    sentenceCompleteText?: string;
  };
}


/**
 * const level1Data: SentenceChallengeConfig[] = [{
  id: "level1_forest",
  words: [
    { text: "El", isTarget: false },
    { text: "zorro", isTarget: true, assetKey: "sprite_zorro_word" },
    { text: "marrón", isTarget: false },
    { text: "saltó", isTarget: true, assetKey: "sprite_salto_word" },
    { text: "sobre", isTarget: false },
    { text: "el", isTarget: false },
    { text: "perro", isTarget: true, assetKey: "sprite_perro_word" },
    { text: "perezoso.", isTarget: false },
  ],
  promptText: "El ____ marrón ____ sobre el ____ perezoso.",
  feedback: {
    sentenceCompleteAudio: "sfx_level_complete",
    sentenceCompleteText: "¡Frase completada!",
  }
}];
 * 
 */