/**
 * Mapa de direcciones que traduce abreviaturas de dirección a sus equivalentes en CSS.
 * 
 * Abreviaturas:
 * - 'l': left (inline-start)
 * - 'r': right (inline-end)
 * - 't': top (block-start)
 * - 'b': bottom (block-end)
 * - 'x': horizontal (inline)
 * - 'y': vertical (block)
 * - '': sin dirección específica
 */
export const directionMap: Record<string, string[]> = {
  l: ['-inline-start'],  
  r: ['-inline-end'],    
  t: ['-block-start'],   
  b: ['-block-end'],     
  x: ['-inline'],        
  y: ['-block'],         
  '': ['']               
};

/**
 * Objeto que define valores de tamaño de fuente utilizando una proporción de escala de tipo de 1.200.
 * Los valores se obtuvieron de https://www.fluid-type-scale.com/
 * La función `clamp` se utiliza para mantener los tamaños de fuente fluidos entre diferentes pantallas.
 */
export const fontSizeValues: Record<string, string> = {
  '200': 'clamp(0.8rem, 0.34vi + 0.71rem, 0.99rem)',
  '300': 'clamp(1rem, 0.34vi + 0.91rem, 1.19rem)',
  '400': 'clamp(1.25rem, 0.32vi + 1.17rem, 1.43rem)',
  '500': 'clamp(1.56rem, 0.27vi + 1.5rem, 1.71rem)',
  '600': 'clamp(1.95rem, 0.18vi + 1.91rem, 2.05rem)',
  '700': 'clamp(2.44rem, 0.04vi + 2.43rem, 2.46rem)',
  '800': 'clamp(3.05rem, -0.18vi + 3.1rem, 2.95rem)'
};

/**
 * Objeto que define una paleta de colores para la aplicación.
 * Cada clave representa un nombre descriptivo del color y su valor es el código hexadecimal correspondiente.
 */
export const colors: Record<string, string> = {
  brand: '#313e58',
  accent: '#19578d',
  'accent-light': '#1daf9a',
  'accent-dark': '#515151',
  'text-main': '#333333',
  'text-secondary': '#ffffff',
  background: '#fbfbfb',
  'activity-success': '#1daf9a',
  'activity-wrong': '#d46153',
};
