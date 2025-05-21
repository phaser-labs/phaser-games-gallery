export interface question_game {
  paragraphParts: Array<partBlank | partText>;
  mockAnswers: string[];
  audio_description?: string;
  audio_content?: string;
}

export interface partText {
  type: 'text';
  content: string;
}

export interface partBlank {
  type: 'space';
  content: string;
  index: number;
}
