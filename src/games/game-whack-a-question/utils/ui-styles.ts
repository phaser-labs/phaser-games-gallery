import { ThemeType } from "../types/types";

/**
 * Aplica el tema seleccionado al DOM mediante variables CSS
 */
export function applyTheme(theme: ThemeType): void {
  const root = document.documentElement;
  const colors = theme.colors;

  // Aplicar variables CSS para el tema
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-secondary', colors.secondary);
  root.style.setProperty('--theme-bg-button', colors.bgButton);
  root.style.setProperty('--theme-text-button', colors.textButton);
  root.style.setProperty('--theme-gradient-modal-feedbacks', colors.gradientModalFeedbacks);
  root.style.setProperty('--theme-border-modal-feedbacks', colors.borderModalFeedbacks);
  root.style.setProperty('--theme-gradient-modal-instructions', colors.gradientModalInstructions);
  root.style.setProperty('--theme-border-modal-instruction-content', colors.borderModalInstructionContent);
  
  // También aplicar a elementos de Phaser si están presentes
  const gameContainer = document.querySelector('.game-whack-a-question_container');
  if (gameContainer) {
    gameContainer.classList.add(`theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}`);
  }
}

/**
 * Remueve las clases de tema aplicadas previamente
 */
export function removeThemeClasses(): void {
  const gameContainer = document.querySelector('.game-whack-a-question_container');
  if (gameContainer) {
    const themeClasses = Array.from(gameContainer.classList).filter(cls => cls.startsWith('theme-'));
    themeClasses.forEach(cls => gameContainer.classList.remove(cls));
  }
}

/**
 * Obtiene los colores del tema actual como objeto
 */
export function getThemeColors(theme: ThemeType) {
  return {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    bgButton: theme.colors.bgButton,
    textButton: theme.colors.textButton,
    gradientModalFeedbacks: theme.colors.gradientModalFeedbacks,
    borderModalFeedbacks: theme.colors.borderModalFeedbacks,
    gradientModalInstructions: theme.colors.gradientModalInstructions,
    borderModalInstructionContent: theme.colors.borderModalInstructionContent
  };
}
