import { SceneConfig, WORLD_THEMES } from "../types/types";

class ThemeManager {
  private currentTheme: SceneConfig;
  private listeners: ((theme: SceneConfig) => void)[] = [];

  constructor() {
    this.currentTheme = WORLD_THEMES[0]; // Tema por defecto
  }

  getAllThemes(): SceneConfig[] {
    return WORLD_THEMES;
  }

  // Obtener tema actual
  getCurrentTheme(): SceneConfig {
    return this.currentTheme;
  }

  // Cambiar tema
  setTheme(themeId: number): void {
    const theme = WORLD_THEMES.find(t => t.id === themeId);
    if (!theme) return;

    this.currentTheme = theme;
    this.notify();
  }

  // Suscribirse a cambios
  subscribe(callback: (theme: SceneConfig) => void): () => void {
    this.listeners.push(callback);

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.currentTheme));
  }

  // Obtener imagen por nombre
  getImage(name: string): string | undefined {
    return this.currentTheme.assets.images.find(img => img.name === name)?.path;
  }

  // Obtener todas las imágenes
  getImages() {
    return this.currentTheme.assets.images;
  }

  // Obtener tilemap
  getTilemap() {
    return this.currentTheme.assets.tilemap;
  }

  // Reset
  reset() {
    this.currentTheme = WORLD_THEMES[0];
    this.notify();
  }
}

// Singleton
export const themeManager = new ThemeManager();

export const getAllThemes = () => themeManager.getAllThemes();

export const getCurrentThemeName = () =>
  themeManager.getCurrentTheme().name;

export const getCurrentThemeImages = () =>
  themeManager.getImages();

export const getCurrentTilemap = () =>
  themeManager.getTilemap();

export const getBackgroundImage = (name: string) =>
  themeManager.getImage(name);