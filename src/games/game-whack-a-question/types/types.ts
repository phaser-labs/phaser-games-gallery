export interface WhackQuestion {
  question: string;
  options: string[]; // Array de opciones
  correctAnswer: number; // Índice de la respuesta correcta (0-based)
};

export interface GameResult {
  isCorrect: boolean;
  questionIndex: number;
  selectedAnswer?: string;
  correctAnswer: string;
  question: string;
};


export interface GameWhackAQuestionProps {
  data: WhackQuestion[];
  onResult?: (result: GameResult) => void;
  gameId?: string;
}


export type MusicSound = Phaser.Sound.BaseSound & {
  mute: boolean;
  volume: number;
};

export interface ThemeType {
  id: number;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    bgButton: string;
    boxShadowButton: string;
    hoverButton: string;
    textButton: string;
    background: string;
    gradient: string;
    text: string;
    scrolltrack: string;
    scrollthumb: string;
    scrollthumbHover: string;
  };
  assets: {
    images: {
      name: string;
      path: string;
    }[];
    cardImages: string[];
  };
};

/* export const WORLD_THEMES: ThemeType[] = [
    {
    
    }
] */