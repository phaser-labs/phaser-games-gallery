import { fontSizeValues } from '../utils/mapping';

import { Rule } from 'unocss';

export const fontSizeBase = {
  '--fs-200': fontSizeValues['200'],
  '--fs-300': fontSizeValues['300'],
  '--fs-400': fontSizeValues['400'],
  '--fs-500': fontSizeValues['500'],
  '--fs-600': fontSizeValues['600'],
  '--fs-700': fontSizeValues['700'],
  '--fs-800': fontSizeValues['800']
};

export const fontSize: Rule[] = [
  [
    /^u-fs-(\d+)$/,
    ([, size]) => {
      if (fontSizeValues[size]) {
        return { 'font-size': `${fontSizeValues[size]}` };
      }
    }
  ]
];
