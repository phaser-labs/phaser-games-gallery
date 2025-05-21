import { colors } from '../utils/mapping';

export const colorsBase = Object.fromEntries(
  Object.entries(colors).map(([key, value]) => [`--clr-${key.replace(/_/g, '-')}`, value])
);