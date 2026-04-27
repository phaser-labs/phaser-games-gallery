import type { Question } from './types/types';


export const globalState = {
  questions: [] as Question[],
  lives: 3,
  questionMap: new Map<string, Question[]>(),
  completedHouses: new Set<string>(),
  answeredQuestions: 0
};

export function loadQuestions(questions: Question[]) {
  globalState.questions = questions;
}

export function isHouseCompleted(houseId: string): boolean {
  return globalState.completedHouses.has(houseId);
}

export function getHouseVisitedCount(): number {
  return globalState.completedHouses.size ?? 0;
}

export function getLives(): number {
  return globalState.lives;
}

export function getLivesLost(): number {
  return 3 - globalState.lives;
}

export function getTotalQuestions(): number {
  return globalState.questions.length;
}

export function resetState(): void {
  globalState.lives = 3;
  globalState.answeredQuestions = 0;
  globalState.completedHouses = new Set<string>();
  globalState.questionMap = new Map<string, Question[]>();
}
