
/**
 * Tipo que define los idiomas soportados.
 * 'en' para inglés y 'es' para español.
 */
export type Language = 'en' | 'es';

/**
 * Tipo que define la estructura del contexto de la OVA (Objeto Virtual de Aprendizaje).
 */
export type OvaContextType = {
  routes: string[];
  titles: string[];
  lang: Language;
  baseTitle: string;
};

/**
 * Tipo para las rutas de la OVA.
 * Cada ruta tiene un título y un componente asociado.
 */
export type PathType = {
  title: string;
  path: string;
  component: JSX.Element; 
};