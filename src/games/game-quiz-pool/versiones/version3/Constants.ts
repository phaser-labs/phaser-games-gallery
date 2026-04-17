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
export const BALL_VISUAL_RADIUS = 20;

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
export const WHITE_BALL_START_X = 653;
export const WHITE_BALL_START_Y = 308;
export const BALL1_START_X = 649;
export const BALL1_START_Y = 593;


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
  { x: 390, y: 242, r: 34, index: 0, letter: 'A', labelX: 342, labelY: 200 }, // top-left
  { x: 915, y: 240, r: 34, index: 1, letter: 'B', labelX: 963, labelY: 200 }, // top-right
  { x: 390, y: 770, r: 34, index: 2, letter: 'C', labelX: 342, labelY: 812 }, // bot-left
  { x: 917, y: 768, r: 34, index: 3, letter: 'D', labelX: 965, labelY: 812 }, // bot-right
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
const WALL_TOP_L1 = 894;
const WALL_TOP_R1 = 894;

const WALL_BOT_L1 = 408;
const WALL_BOT_R1 = 408;

const WALL_LEFT_T = 253;
const WALL_LEFT_B = 252;
const WALL_RIGHT_T = 750;
const WALL_RIGHT_B = 750;

export const WALL_SEGMENTS: Segment[] = [
  //linea de la  pared derecha
  { x1: WALL_TOP_L1, y1: 289, x2: WALL_TOP_R1, y2: 715 },
  //linea de la pared izquierda
  { x1: WALL_BOT_L1, y1: 289, x2: WALL_BOT_R1, y2: 715 },
  // linea de arriba
  { x1: 437, y1: WALL_LEFT_T, x2: 871, y2: WALL_LEFT_B },
  // linea de abajo
  { x1: 437, y1: WALL_RIGHT_T, x2: 871, y2: WALL_RIGHT_B }
];

export const FUNNEL_SEGMENTS: Segment[] = [
  // tubo a
  { x1: 408, y1: 289, x2: 384, y2: 265 },
  { x1: 438, y1: 252, x2: 417, y2: 229 },
  // tubo b
  { x1: 865, y1: 255, x2: 886, y2: 224 },
  { x1: 893, y1: 292, x2: 917, y2: 263 },
  // tubo c
  { x1: 408, y1: 712, x2: 379, y2: 739 },
  { x1: 444, y1: 747, x2: 417, y2: 775 },
  // tubo d
  { x1: 870, y1: 749, x2: 883, y2: 774 },
  { x1: 889, y1: 706, x2: 919, y2: 735 }
];

export const ALL_SEGMENTS: Segment[] = [...WALL_SEGMENTS, ...FUNNEL_SEGMENTS];