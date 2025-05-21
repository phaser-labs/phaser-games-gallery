
export interface Question {
  id: string;
  question: string;
  options: string[];
  optionsIndex: string[];
  correctIndex: number;
  reward: { // <-- NUEVO CAMPO
    type: string, 
    amount: number, 
    description: string 
  }
};

export type Questions = Question[];

export type Dialog = {
  text: string[];
};

type DialogCategory = {
  [key: string]: Dialog;
};

export type DialogCollection = {
  [category: string]: DialogCategory;
};


export interface FeedbackMessages {
  correct: string; // <-- Ahora es un string
  incorrect: string; // <-- Ahora es un string
}

export interface FeedbackCollection {
  [levelId: string]: FeedbackMessages | undefined;
  default?: FeedbackMessages;
}