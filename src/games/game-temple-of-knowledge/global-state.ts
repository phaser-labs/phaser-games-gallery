import type { Question, ThemeType } from './types/types';


export const globalState = {
  questions: [] as Question[],
  theme: null as ThemeType | null,
};

export function loadQuestions(questions: Question[]) {
  globalState.questions = questions;
}

export function setTheme(theme: ThemeType) {
  globalState.theme = theme;
}
