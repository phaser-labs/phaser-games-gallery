import { DialogCollection, FeedbackCollection,Questions } from "./types/type";

class GlobalState {
  music?: boolean = true;
  completedLevels: string[] = [];
  targets: {
    id: string;
    sprite: Phaser.Physics.Arcade.Sprite;
    position: { x: number; y: number };
    size?: number;
  }[] = [];
  // Nuevas propiedades para diálogos
  dialogs: DialogCollection = {};
  // Preguntas
  questions: Questions = []; // Usa el tipo Questions (array de Question)
  // Feedbacks
  feedbacks: FeedbackCollection = {};
  // ScoreAA
  score: number = 0;
  potions: number = 0;
  availableArrows: number = 0;
  maxArrows: number = 0;

  // verificador de fin de juego
  gameFinished: boolean = false;

  // Método para reiniciar el estado global al inicio de un nuevo juego
  public resetForNewGame(): void {
    
    this.completedLevels = [];
    this.targets = [];                
    this.score = 0;
    this.potions = 0;
    this.availableArrows = this.maxArrows;
  }
}

// Nuevos métodos para diálogos
export const loadDialogs = (dialogsData: DialogCollection): void => {
  globalState.dialogs = dialogsData;
};

export const loadQuestions = (questionsData: Questions): void => {
  globalState.questions = questionsData;
};

export const loadFeedbacks = (feedbackData: FeedbackCollection): void => {
  globalState.feedbacks = feedbackData;
};

export const globalState = new GlobalState();

