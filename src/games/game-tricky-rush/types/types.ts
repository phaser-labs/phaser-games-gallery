export interface EndGameData {
  player: number;
  block: Material;
  lives: number;
  totalChallenges: number;
}

export interface TypeWord {
  words: string[];
  sentence?: string;
}

export interface GameResult {
  isCorrect: boolean;
  sentenceId: string;
  userAnswer: string;
  correctAnswer: string;
}

// types from tetris

export type Cell = { x: number; y: number };
export type PieceType = "O" | "I" | "S" | "Z" | "J" | "L" | "T";
export type PiecePenaltyType = "D" | "C" | "F";
export type Material = "normal" | "glass" | "stone";

export type TetrisConfig = {
  tile: number;
  worldMinCol: number;
  worldMaxCol: number;
  houseTopByCol: Array<number | null>;
  mapHeight: number;
};

export interface ActivePiece {
  type: PieceType;
  rot: number;
  col: number;
  row: number;
  material?: Material;
  isPenalty?: boolean;
}

// types from themes

export interface SceneConfig {
  id: number;
  name: string;
  assets: {
    images: {
      name: string;
      path: string;
    }[];
    tilemap: {
      name: string;
      path: string;
    };
    miniture: string;
  };
}

export const WORLD_THEMES: SceneConfig[] = [
  {
    id: 1,
    name: 'Oceano',
    assets: {
      images: [
        { name: 'background_1', path: 'maps/map1/background_1.png' },
        { name: 'tileset', path: 'maps/map1/tileset.png' }
      ],
      tilemap: {
        name: 'bgMap',
        path: 'maps/map1/background_1.json'
      },
      miniture: 'maps/map1/background.png'
    }
  },
  {
    id: 2,
    name: 'Bosque',
    assets: {
      images: [
        { name: 'background_2', path: 'maps/map2/background_2.png' },
        { name: 'tileset', path: 'maps/map2/tileset.png' }
      ],
      tilemap: {
        name: 'bgMap',
        path: 'maps/map2/background_2.json'
      },
      miniture: 'maps/map2/background.png'
    }
  },
  {
    id: 3,
    name: 'Desierto',
    assets: {
      images: [
        { name: 'sky_background', path: 'maps/map3/sky_background.png' },
        { name: 'desert_layer', path: 'maps/map3/desert_layer.png' },
        { name: 'tileset', path: 'maps/map3/tileset.png' }
      ],
      tilemap: {
        name: 'bgMap',
        path: 'maps/map3/background_3.json'
      },
      miniture: 'maps/map3/background.png'
    }
  },
  {
    id: 4,
    name: 'Montañas',
    assets: {
      images: [
        { name: 'mountains_background', path: 'maps/map4/mountains_background.png' },
        { name: 'tileset', path: 'maps/map4/tileset.png' }
      ],
      tilemap: {
        name: 'bgMap',
        path: 'maps/map4/background_4.json'
      },
      miniture: 'maps/map4/background.png'
    }
  },
  {
    id: 5,
    name: 'Ciudad',
    assets: {
      images: [
        { name: 'background_3', path: 'maps/map5/background_3.png' },
        { name: 'sky_background', path: 'maps/map5/sky_background.png' },
        { name: 'building', path: 'maps/map5/building.png' },
        { name: 'tileset', path: 'maps/map5/tileset.png' }
      ],
      tilemap: {
        name: 'bgMap',
        path: 'maps/map5/background_5.json'
      },
      miniture: 'maps/map5/background.png'
    }
  }
]

