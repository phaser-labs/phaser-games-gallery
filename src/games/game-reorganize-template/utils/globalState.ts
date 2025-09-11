import type { SentenceType } from "./types";

class GlobalState {
  targets: {
    id: string;
    sprite: Phaser.Physics.Arcade.Sprite;
  }[] = [];
  // Preguntas/Oraciones --- Se cambió de "questions" a "sentences" para reflejar el nuevo contexto del juego.
  // sentences: SentenceType[] = [];
  questions: SentenceType[] = [];

}

export const loadQuestions = (newQuestions: SentenceType[]): void => {
  globalState.questions = newQuestions;
  
};


export const globalState = new GlobalState();

