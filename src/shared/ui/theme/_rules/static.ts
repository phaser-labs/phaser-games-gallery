import { Rule } from 'unocss';

export const fontStyles: Rule[] = [
  ['u-font-italic', { 'font-style': 'italic' }],
  ['u-font-not-italic', { 'font-style': 'normal' }],
  ['u-font-italic', { 'font-style': 'italic' }],
  ['u-font-not-italic', { 'font-style': 'normal' }],
  ['u-font-oblique', { 'font-style': 'oblique' }],
  ['u-font-not-oblique', { 'font-style': 'normal' }]
];

export const fontWeight: Rule[] = [
  ['u-font-thin', { 'font-weight': '100' }],
  ['u-font-extralight', { 'font-weight': '200' }],
  ['u-font-light', { 'font-weight': '300' }],
  ['u-font-normal', { 'font-weight': '400' }],
  ['u-font-medium', { 'font-weight': '500' }],
  ['u-font-semibold', { 'font-weight': '600' }],
  ['u-font-bold', { 'font-weight': '700' }],
  ['u-font-extrabold', { 'font-weight': '800' }],
  ['u-font-black', { 'font-weight': '900' }]
];

export const textWraps: Rule[] = [
  ['u-text-wrap', { 'text-wrap': 'wrap' }],
  ['u-text-nowrap', { 'text-wrap': 'nowrap' }],
  ['u-text-balance', { 'text-wrap': 'balance' }],
  ['u-text-pretty', { 'text-wrap': 'pretty' }]
];

export const textTransforms: Rule[] = [
  ['u-text-upper', { 'text-transform': 'uppercase' }],
  ['u-text-lower', { 'text-transform': 'lowercase' }],
  ['u-text-capital', { 'text-transform': 'capitalize' }],
  ['u-text-normal', { 'text-transform': 'none' }]
];

export const textAlignment: Rule[] = [
  ['u-text-left', { 'text-align': 'left' }],
  ['u-text-center', { 'text-align': 'center' }],
  ['u-text-right', { 'text-align': 'right' }],
  ['u-text-justify', { 'text-align': 'justify' }],
  ['u-text-start', { 'text-align': 'start' }],
  ['u-text-end', { 'text-align': 'end' }]
];
