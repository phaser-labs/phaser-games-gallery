import type { Rule } from 'unocss';

import { Theme } from '../types/types';

import { fontSize } from './font';
import { margin, padding } from './spacing';
import { fontStyles, fontWeight, textAlignment, textTransforms, textWraps } from './static';

export const rules: Rule<Theme>[] = [
  padding,
  margin,
  fontSize,
  fontStyles,
  fontWeight,
  textWraps,
  textTransforms,
  textAlignment
].flat(1);
