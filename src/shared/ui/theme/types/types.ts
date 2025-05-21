import type { Arrayable } from 'unocss';

export interface Theme {
  color?: string;
  fontColor?: Record<string, string>;
  backgroundColor?: string;
  textAlignment?: Record<string, string>;
  textTransforms?: Record<string, string>;
  fontWeight?: Record<string, string>;
  preflightRoot?: Arrayable<string>;
  preflightBase?: Record<string, string | number>;
}
