/**
 * Punto de entrada principal para el juego Whac-A-Question
 * 
 * Exporta todo lo necesario para usar el componente en proyectos externos
 */

// Componente principal
export { GameWhackAQuestion } from './game-whack-a-question';

// Componentes adicionales
export { ThemeSelector } from './components';

// Tipos e interfaces
export type { GameResult, WhackQuestion, ThemeType } from './types/types';

// Utilidades de tema
export { 
  themeManager, 
  getThemeImages, 
  getThemeSpritesheets, 
  getThemeTileMap, 
  getThemeAmbienceSounds,
  getCurrentThemeColors,
  getCurrentThemeName,
  getImageByName,
  getSpritesheetByName
} from './utils';

// Estado global
export { globalState, loadQuestions, setTheme } from './utils/global-state';