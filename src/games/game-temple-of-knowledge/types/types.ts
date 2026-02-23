export type Option = { id: string; text: string; correct: boolean };

export type Question = { id: number; text: string; options: Option[] };

export interface GameResult {
  isCorrect: boolean;
  questionIndex: number;
  selectedAnswer?: string;
  correctAnswer: string;
  question: Question;
}

export type GameOverData = {
  win?: boolean;
  hpLeft?: number;
  maxLives?: number;
  enemiesDefeated?: number;
  questionsAnswered?: number;
  totalQuestions?: number;
  attempts?: number;
};

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
}

export const WORLD_THEMES: ThemeType[] = [
  {
    id: 1,
    name: "Castillo",
    colors: {
      // tu primary arcano
      primary: "#6C4FFB",      // --arcane-primary
      secondary: "#6E64B5",    // --arcane-glow

      bgButton: "#de9d42",
      boxShadowButton: "#884b2b",
      hoverButton: '#e9bf6e',
      textButton: '#233555',

      // fondos UI (panel + dark)
      background: "#0B0F1D",   // base más oscura para el canvas/UI
      text: "#dbdbdb",         // --ui-text

      // gradiente botones (morado -> glow)
      gradient: "linear-gradient(135deg, #6C4FFB 0%, #6E64B5 100%)",

      // scrollbar (azul profundo -> morado)
      scrolltrack: "#233555",      // --arcane-dark
      scrollthumb: "#232855",      // --ui-panel
      scrollthumbHover: "#3A3F7A", // hover un poco más brillante
    },
    assets: {
      images: [
        { name: "bg", path: "images/background/game_background_3.png" },
      ],
      cardImages: [
        'images/poisons/card_3.png',
      ]
    },
  },
  {
    id: 2,
    name: "Bosque nocturno",
    colors: {
      // acento musgo/dorado (pastos/luces)
      primary: "#62470B",
      secondary: "#897548",

      bgButton: "#62470B",
      boxShadowButton: "#341201",
      hoverButton: '#9e700d',
      textButton: '#dddddd',

      background: "#090501",

      gradient: "linear-gradient(135deg, #897548 0%, #62470B 100%)",

      // texto crema para que se sienta “orgánico”
      text: "#dbdbdb",

      // scrollbar cálido (marrones/grises)
      scrolltrack: "#423A33",
      scrollthumb: "#625C56",
      scrollthumbHover: "#807B76",
    },
    assets: {
      images: [
        { name: "bg", path: "images/background/game_background_1.png" },
      ],
      cardImages: [
        'images/poisons/card_1.png',
      ]
    },
  },
  {
    id: 3,
    name: "Cueva",
    colors: {
      // acento verde/teal frío (ambiente cueva)
      primary: "#1D4132",
      secondary: "#567065",

      bgButton: "#0d7d4e",
      boxShadowButton: "#00321d",
      hoverButton: '#076940',
      textButton: '#dddddd',

      background: "#0F070D",

      gradient: "linear-gradient(135deg, #567065 0%, #1D4132 100%)",

      text: "#dbdbdb",

      // scrollbar frío (gris azulado)
      scrolltrack: "#475259",
      scrollthumb: "#3e515b",
      scrollthumbHover: "#848B8F",
    },
    assets: {
      images: [
        { name: "bg", path: "images/background/game_background_2.png" },
      ],
      cardImages: [
        'images/poisons/card_2.png',
      ]
    },
  }
];


// export const QUESTIONS: Question[] = [
//   {
//     id: 1,
//     text: "¿Cuál es la unidad de fuerza?",
//     options: [
//       { id: "A", text: "Newton", correct: true },
//       { id: "B", text: "Joule", correct: false },
//       { id: "C", text: "KiloNewton", correct: false },
//       { id: "D", text: "Pound", correct: false },
//     ],
//   },
// ];