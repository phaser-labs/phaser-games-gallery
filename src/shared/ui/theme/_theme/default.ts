import type { Theme } from '../types/types';

import { preflightBase, preflightRoot } from './preflight';

export const theme = {
  preflightRoot,
  preflightBase
} satisfies Theme;
