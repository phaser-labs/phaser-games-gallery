import { fontSizeBase } from '../_rules/font';
import type { Theme } from '../types/types';

import { colorsBase } from './colors';

export const preflightBase = {
  ...fontSizeBase,
  ...colorsBase
} satisfies Theme['preflightBase'];

export const preflightRoot = ':root' satisfies Theme['preflightRoot'];
