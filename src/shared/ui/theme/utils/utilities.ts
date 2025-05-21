import type { CSSEntries } from 'unocss';

import { directionMap } from './mapping';

/**
 * Genera las entradas CSS para el margin en función de la dirección y el número proporcionados.
 *
 * @param params - Array que contiene [_, dirección, número]
 * @returns Una entrada CSS para el margin o undefined
 */
export const marginSpacing = ([, direction, number]: string[]): CSSEntries | undefined => {
  if (!number) return undefined;

  // Si el número es 'auto', devuelve el margin correspondiente
  if (number === 'auto') {
    return [[`margin${directionMap[direction]}`, 'auto']];
  }

  // Convertir el número a un valor numérico
  const value = +number;

  // Calcular el valor del margin en rem
  const remValue = `${value * 0.5}rem`;

  // Calcular el valor del margin en vh
  const vhValue = value <= 2 ? '1vh' : `${value - 1}vh`;

  // Devolver la entrada CSS para el margin con min
  return [[`margin${directionMap[direction]}`, `min(${remValue}, ${vhValue})`]];
};

/**
 * Genera las entradas CSS para el padding en función de la dirección y el número proporcionados.
 *
 * @param params - Array que contiene [_, dirección, número]
 * @returns Una entrada CSS para el padding o undefined
 */
export const paddingSpacing = ([, direction, number]: string[]): CSSEntries | undefined => {
  if (!number) return undefined;

  // Si el número es 'auto', devuelve el padding correspondiente
  if (number === 'auto') {
    return [[`padding${directionMap[direction]}`, 'auto']];
  }

  // Convertir el número a un valor numérico
  const value = +number;

  // Calcular el valor inicial del padding en rem
  const remStart = value <= 2 ? 0.5 : Math.floor((value - 1) / 2) * 0.5 + 0.5;

  // Calcular el valor final del padding en rem
  const remEnd = value % 2 === 0 ? value / 2 : (value - 1) / 2 + 0.5;

  // Devolver la entrada CSS para el padding con clamp
  return [[`padding${directionMap[direction]}`, `clamp(${remStart}rem, ${value}%, ${remEnd}rem)`]];
};

// 'u-p-20'.match(/^u-p([xylrtb]?)-(.+)$/)
