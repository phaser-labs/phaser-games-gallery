export type Options = {
  id: number;
  question: string;
  answers: {
    id: number;
    text: string;
    correct: boolean;
  }[];
};
