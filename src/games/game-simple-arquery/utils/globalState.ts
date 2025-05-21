import { Question } from "./types";

class GlobalState {
  targets: {
    id: string;
    sprite: Phaser.Physics.Arcade.Sprite;
  }[] = [];
  // Preguntas
  questions: Question[] = [];
  correctOption: string = '';

}

export const loadQuestions = (newQuestions: Question[]): void => {
  globalState.questions = newQuestions;
};


export const globalState = new GlobalState();

