export type Question = {
    id: string;
    statement: string;      // Ej: "La fotosíntesis ocurre en la mitocondria"
    correctAnswer: boolean; // true o false
    explanation?: string;
};

export interface AnswerResult {
    isCorrect: boolean;
    questionIndex: number;
    selectedAnswer?: string;
    correctAnswer: string;
    question: Question;
}


// ==============================================================================
// BATTLE
// ==============================================================================

export type BattleState = {
    currentQuestion: Question | null;
    enemy: Enemy | null;

    phase: 'dialogue' | 'attack' | 'answer' | 'result' | 'end';

    playerHP: number;
    enemyHP: number;

    selectedAnswer: boolean | null;
    isCorrect: boolean | null;
};

export type Enemy = {
    id: string;
    name: string;
    sprite: string;

    knowledge: string;
};

export type GameAction =
    | { type: 'START_BATTLE'; enemy: Enemy; question: Question }
    | { type: 'SUBMIT_ANSWER'; answer: boolean }
    | { type: 'SET_RESULT'; result: AnswerResult }
    | { type: 'NEXT_QUESTION'; question: Question }
    | { type: 'END_BATTLE' };