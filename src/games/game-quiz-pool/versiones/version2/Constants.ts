// ─────────────────────────────────────────────────────────────
//  SPRITESHEET LAYOUT
//  8 cols (directions) × 4 rows (frames) = 32 total sprites
//  Col:  0=N  1=NE  2=E  3=SE  4=S  5=SW  6=W  7=NW
// ─────────────────────────────────────────────────────────────
export const DIRS = { N: 0, NE: 1, E: 2, SE: 3, S: 4, SW: 5, W: 6, NW: 7 } as const;
export const TOTAL_COLS = 8;
export const TOTAL_FRAMES = 4;
export const FRAME_RATE = 12;
export const FRAME_RATE_MIN = 2;
export const SPEED_MAX = 300;
export const BALL_VISUAL_RADIUS = 19.2;

// ── TACO ─────────────────────────────────────────────────────
export const CUE_TIP_OFFSET = -35;
export const CUE_PULLBACK = 0;
export const CUE_HIT_SPEED = 0;
export const CUE_RETURN_SPEED = 0;
export const CUE_MAX_FORCE = 1000;
export const CUE_DRAG_MAX = 60;

// ── GUÍA DE TRAYECTORIA ──────────────────────────────────────
export const GUIDE_LENGTH = 350; // longitud máxima línea ball1 (px)
export const GUIDE_LINE_W = 2; // grosor de línea
export const GUIDE_ALPHA_MAX = 0.7; // opacidad línea blanca
export const GUIDE_ALPHA_B1 = 0.55; // opacidad línea amarilla

// ── BOLA BLANCA — posición inicial ───────────────────────────
export const WHITE_BALL_START_X = 794;
export const WHITE_BALL_START_Y = 262;
export const BALL1_START_X = 769;
export const BALL1_START_Y = 755;


// ── TRONERAS ─────────────────────────────────────────────────
export interface Pocket {
  x: number;
  y: number;
  r: number;
  index: number;
  letter: string;
  labelX?: number; // posición X del label (si no se define, usa x)
  labelY?: number; // posición Y del label (si no se define, usa y)
}

export const POCKETS: Pocket[] = [
  { x: 578, y: 113, r: 28, index: 0, letter: 'A', labelX: 505, labelY: 103 },
  { x: 1006, y: 112, r: 28, index: 1, letter: 'B', labelX: 1040, labelY: 103 },
  { x: 570, y: 526, r: 28, index: 2, letter: 'C', labelX: 505, labelY: 515 },
  { x: 1010, y: 530, r: 28, index: 3, letter: 'D', labelX: 1040, labelY: 515 },
  { x: 578, y: 941, r: 28, index: 5, letter: 'E', labelX: 505, labelY: 937 },
  { x: 1006, y: 939, r: 28, index: 4, letter: 'F', labelX: 1040, labelY: 937 }
];
export const POCKET_ANIM_MS = 350;

// ── TIPOS ─────────────────────────────────────────────────────
export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export type CueState = 'idle' | 'pullback' | 'strike' | 'return' | 'hidden';

// ── SEGMENTOS DE PARED ───────────────────────────────────────
const WALL_TOP_L1 = 995;
const WALL_TOP_R1 = 995;
const WALL_TOP_L2 = 995;
const WALL_TOP_R2 = 995;
const WALL_BOT_L1 = 587;
const WALL_BOT_R1 = 587;
const WALL_BOT_L2 = 587;
const WALL_BOT_R2 = 587;
const WALL_LEFT_T = 124;
const WALL_LEFT_B = 124;
const WALL_RIGHT_T = 925;
const WALL_RIGHT_B = 925;

export const WALL_SEGMENTS: Segment[] = [
  { x1: WALL_TOP_L1, y1: 150, x2: WALL_TOP_R1, y2: 509 },
  { x1: WALL_TOP_L2, y1: 551, x2: WALL_TOP_R2, y2: 906 },
  { x1: WALL_BOT_L1, y1: 155, x2: WALL_BOT_R1, y2: 500 },
  { x1: WALL_BOT_L2, y1: 548, x2: WALL_BOT_R2, y2: 903 },
  { x1: 617, y1: WALL_LEFT_T, x2: 965, y2: WALL_LEFT_B },
  { x1: 617, y1: WALL_RIGHT_T, x2: 965, y2: WALL_RIGHT_B }
];

export const FUNNEL_SEGMENTS: Segment[] = [
  { x1: 590, y1: 156, x2: 562, y2: 133 },
  { x1: 617, y1: 124, x2: 599, y2: 106 },

  { x1: 962, y1: 125, x2: 982, y2: 105 },
  { x1: 988, y1: 156, x2: 1014, y2: 132 },

  { x1: 589, y1: 501, x2: 567, y2: 507 },
  { x1: 588, y1: 551, x2: 554, y2: 545 },

  { x1: 992, y1: 504, x2: 1014, y2: 501 },
  { x1: 991, y1: 555, x2: 1014, y2: 546 },

  { x1: 587, y1: 893, x2: 561, y2: 917 },
  { x1: 617, y1: 924, x2: 597, y2: 946 },

  { x1: 956, y1: 922, x2: 980, y2: 949 },
  { x1: 992, y1: 901, x2: 1004, y2: 909 }
];

export const ALL_SEGMENTS: Segment[] = [...WALL_SEGMENTS, ...FUNNEL_SEGMENTS];
