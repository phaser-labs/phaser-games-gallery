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
export const WHITE_BALL_START_X = 380;
export const WHITE_BALL_START_Y = 516;
export const BALL1_START_X = 660;
export const BALL1_START_Y = 516;


// ── TRONERAS ─────────────────────────────────────────────────
export interface Pocket {
  x: number;
  y: number;
  r: number;
}

export const POCKETS: Pocket[] = [
  { x: 185, y: 270, r: 28 }, // top-left
  { x: 660, y: 260, r: 25 }, // top-center
  { x: 1135, y: 274, r: 28 }, // top-right
  { x: 185, y: 760, r: 28 }, // bot-left
  { x: 658, y: 770, r: 26 }, // bot-center
  { x: 1135, y: 760, r: 28 } // bot-right
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
const WALL_TOP_L1 = 235;
const WALL_TOP_R1 = 635;
const WALL_TOP_L2 = 685;
const WALL_TOP_R2 = 1090;
const WALL_BOT_L1 = 230;
const WALL_BOT_R1 = 632;
const WALL_BOT_L2 = 685;
const WALL_BOT_R2 = 1085;
const WALL_LEFT_T = 320;
const WALL_LEFT_B = 720;
const WALL_RIGHT_T = 320;
const WALL_RIGHT_B = 720;

export const WALL_SEGMENTS: Segment[] = [
  { x1: WALL_TOP_L1, y1: 290, x2: WALL_TOP_R1, y2: 290 },
  { x1: WALL_TOP_L2, y1: 290, x2: WALL_TOP_R2, y2: 290 },
  { x1: WALL_BOT_L1, y1: 745, x2: WALL_BOT_R1, y2: 745 },
  { x1: WALL_BOT_L2, y1: 745, x2: WALL_BOT_R2, y2: 745 },
  { x1: 205, y1: WALL_LEFT_T, x2: 205, y2: WALL_LEFT_B },
  { x1: 1120, y1: WALL_RIGHT_T, x2: 1120, y2: WALL_RIGHT_B }
];

export const FUNNEL_SEGMENTS: Segment[] = [
  // top-left
  { x1: 250, y1: 290, x2: 210, y2: 260 },
  { x1: 205, y1: 330, x2: 180, y2: 299 },
  // top-center
  { x1: 630, y1: 290, x2: 650, y2: 250 },
  { x1: 694, y1: 290, x2: 669, y2: 250 },
  // top-right
  { x1: 1080, y1: 290, x2: 1130, y2: 250 },
  { x1: 1120, y1: 330, x2: 1150, y2: 280 },
  // bot-left
  { x1: 250, y1: 740, x2: 180, y2: 790 },
  { x1: 205, y1: 690, x2: 180, y2: 735 },
  // bot-center
  { x1: 630, y1: 745, x2: 645, y2: 800 },
  { x1: 690, y1: 745, x2: 680, y2: 800 },
  // bot-right
  { x1: 1080, y1: 745, x2: 1130, y2: 780 },
  { x1: 1120, y1: 711, x2: 1140, y2: 737 }
];

export const ALL_SEGMENTS: Segment[] = [...WALL_SEGMENTS, ...FUNNEL_SEGMENTS];
