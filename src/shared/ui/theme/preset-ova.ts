import { rules } from './_rules/default';
import { theme } from './_theme/default';
import { preflights } from './preflights';

import { definePreset } from 'unocss';

export const presetOVA = definePreset(() => {
  return {
    name: 'preset-ova',
    theme,
    rules,
    preflights
  };
});
