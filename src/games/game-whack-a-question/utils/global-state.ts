import type { ThemeType,WhackQuestion } from '../types/types';

export const globalState = {
  questions: [] as WhackQuestion[],
  theme: null as ThemeType | null,
};

export function loadQuestions(questions: WhackQuestion[]) {
  globalState.questions = questions;
}

export function setTheme(theme: ThemeType) {
  globalState.theme = theme;
}
