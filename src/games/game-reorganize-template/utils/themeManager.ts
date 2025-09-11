import type { WorldType } from './types';
import { WORLD_THEMES } from './types';

// Estado global del tema
class ThemeManager {
  private currentTheme: WorldType;
  private listeners: ((theme: WorldType) => void)[] = [];

  constructor() {
    // Tema por defecto (Cocina)
    this.currentTheme = WORLD_THEMES[0];
  }

  // Obtener el tema actual
  getCurrentTheme(): WorldType {
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
  subscribe(callback: (theme: WorldType) => void): () => void {
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
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--clr-primary', colors.primary);
    root.style.setProperty('--clr-secondary', colors.secondary);
    root.style.setProperty('--clr-bg-primary', colors.gradient);
    root.style.setProperty('--scrollbar-instructions-track', colors.scrolltrack);
    root.style.setProperty('--scrollbar-instructions-thumb', colors.scrollthumb);
    root.style.setProperty('--scrollbar-instructions-thumb-hover', colors.scrollthumbHover);
  }

  // Resetear al tema por defecto
  reset(): void {
    this.currentTheme = WORLD_THEMES[0]; // Cocina como tema por defecto
    this.notifyListeners();
    this.applyThemeToDOM();
  }

  // Obtener todos los temas disponibles
  getAllThemes(): WorldType[] {
    return WORLD_THEMES;
  }

  // Inicializar el tema (aplicar estilos iniciales)
  initialize(): void {
    this.applyThemeToDOM();
  }
}

// Instancia singleton
export const themeManager = new ThemeManager();

// Función helper para obtener las imágenes de tarjetas del tema actual
export const getCurrentWordCardImages = (): string[] => {
  return themeManager.getCurrentTheme().assets.wordCardImages;
};

// Función helper para obtener los colores del tema actual
export const getCurrentThemeColors = () => {
  return themeManager.getCurrentTheme().colors;
};

// Función helper para obtener el nombre del tema actual
export const getCurrentThemeName = (): string => {
  return themeManager.getCurrentTheme().name;
};

//Funcion helper para obtener los sonidos del tema actual
export const getCurrentThemeSounds = () => {
  return themeManager.getCurrentTheme().assets.sounds;
};

// Función helper para obtener fondos específicos por nombre del tema actual
export const getBackgroundImage = (backgroundName: string): string => {
  const currentTheme = themeManager.getCurrentTheme();
  const backgroundImages = currentTheme.assets.images;
  
  // Buscar la imagen de fondo por nombre
  const backgroundImage = backgroundImages.find(img => img.name === backgroundName);
  
  if (!backgroundImage) {
    console.warn(`Background image '${backgroundName}' not found for theme '${currentTheme.name}'`);
    // Retornar la primera imagen como fallback
    return backgroundImages[0]?.path || '';
  }
  
  return backgroundImage.path;
};

// Función helper para obtener todas las imágenes de fondo del tema actual
export const getBackgroundImages = (): { name: string; path: string }[] => {
  return themeManager.getCurrentTheme().assets.images;
};


