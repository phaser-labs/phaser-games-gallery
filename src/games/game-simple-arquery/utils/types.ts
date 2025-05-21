export interface Question {
  question: string;
  options: { a: string; b: string; c: string; d?: string } | { a: string; b: string; c: string; d?: string };
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  feedback: {
      successAudio: string;
      wrongAudio: string;
      correctText: string;
      incorrectText: string;
    }
}