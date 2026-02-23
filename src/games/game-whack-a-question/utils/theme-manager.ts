import { ThemeType, WORLD_THEMES } from "../types/types";

// Estado global del tema
class ThemeManager {
  private currentTheme: ThemeType;
  private listeners: ((theme: ThemeType) => void)[] = [];

  constructor() {
    // Tema por defecto (Pradera)
    this.currentTheme = WORLD_THEMES[0];
  }

  // Obtener el tema actual
  getCurrentTheme(): ThemeType {
    return this.currentTheme;
  }

  // Cambiar el tema
  setTheme(themeId: number): void {
    const newTheme = WORLD_THEMES.find(theme => theme.id === themeId);
    if (newTheme) {
      this.currentTheme = newTheme;
      this.notifyListeners();
      this.applyThemeToDOM();
    }
  }

  // Suscribirse a cambios de tema
  subscribe(callback: (theme: ThemeType) => void): () => void {
    this.listeners.push(callback);
    // Retornar función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notificar a todos los listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  // Aplicar colores del tema al DOM (CSS variables)
  private applyThemeToDOM(): void {
    const root = document.documentElement;
    const colors = this.currentTheme.colors;
    
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-bg-button', colors.bgButton);
    root.style.setProperty('--theme-text-button', colors.textButton);
    root.style.setProperty('--theme-gradient-modal-feedbacks', colors.gradientModalFeedbacks);
    root.style.setProperty('--theme-border-modal-feedbacks', colors.borderModalFeedbacks);
    root.style.setProperty('--theme-gradient-modal-instructions', colors.gradientModalInstructions);
    root.style.setProperty('--theme-border-modal-instruction-content', colors.borderModalInstructionContent);
  }

  // Resetear al tema por defecto
  reset(): void {
    this.currentTheme = WORLD_THEMES[0]; // Pradera como tema por defecto
    this.notifyListeners();
    this.applyThemeToDOM();
  }

  // Obtener todos los temas disponibles
  getAllThemes(): ThemeType[] {
    return WORLD_THEMES;
  }

  // Inicializar el tema (aplicar estilos iniciales)
  initialize(): void {
    this.applyThemeToDOM();
  }
}

// Instancia singleton
export const themeManager = new ThemeManager();

// Función helper para obtener las imágenes del tema actual
export const getThemeImages = (): { name: string; path: string }[] => {
  return themeManager.getCurrentTheme().assets.images;
};

// Función helper para obtener los spritesheets del tema actual
export const getThemeSpritesheets = (): { name: string; path: string }[] => {
  return themeManager.getCurrentTheme().assets.spritesheets;
};

// Función helper para obtener el tilemap del tema actual
export const getThemeTileMap = (): { name: string; path: string }[] => {
  return themeManager.getCurrentTheme().assets.tileMap;
};

// Función helper para obtener los sonidos del tema actual
export const getThemeAmbienceSounds = (): { name: string; path: string }[] => {
  return themeManager.getCurrentTheme().assets.ambiencesSounds;
};

// Función helper para obtener los colores del tema actual
export const getCurrentThemeColors = () => {
  return themeManager.getCurrentTheme().colors;
};

// Función helper para obtener el nombre del tema actual
export const getCurrentThemeName = (): string => {
  return themeManager.getCurrentTheme().name;
};

// Función helper para obtener una imagen específica por nombre del tema actual
export const getImageByName = (imageName: string): string => {
  const currentTheme = themeManager.getCurrentTheme();
  const images = currentTheme.assets.images;
  
  const image = images.find(img => img.name === imageName);
  
  if (!image) {
    console.warn(`Image '${imageName}' not found for theme '${currentTheme.name}'`);
    return images[0]?.path || '';
  }
  
  return image.path;
};

// Función helper para obtener un spritesheet específico por nombre del tema actual
export const getSpritesheetByName = (spritesheetName: string): string => {
  const currentTheme = themeManager.getCurrentTheme();
  const spritesheets = currentTheme.assets.spritesheets;
  
  const spritesheet = spritesheets.find(sprite => sprite.name === spritesheetName);
  
  if (!spritesheet) {
    console.warn(`Spritesheet '${spritesheetName}' not found for theme '${currentTheme.name}'`);
    return spritesheets[0]?.path || '';
  }
  
  return spritesheet.path;
};
