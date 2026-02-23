import type Phaser from 'phaser';

import { ThemeType } from '../types/types';

export const COLORS = {
  panelBg: 0xffffff,
  panelBorder: 0xb5a79a,
  textPrimary: '#121212'
};

export const DIMENSIONS = {
  questionBox: {
    width: 620,
    height: 110,
    radius: 16,
    border: 3
  }
};

export const TEXT_STYLES: Record<string, Phaser.Types.GameObjects.Text.TextStyle> = {
  question: {
    fontFamily: 'Arial',
    fontSize: '1rem',
    color: COLORS.textPrimary,
    align: 'center',
    wordWrap: { width: 860, useAdvancedWrap: true }
  }
};

// Card styles

export const CARD_COLORS = {
  cardBg: 0x6d5648,        // marrón del ejemplo
  cardBorder: 0x3b2b23,
  headerBg: 0xffffff,      // franja clara superior
  headerBorder: 0x3b2b23,
  textPrimary: '#ffffff',
  textSecondary: '#e7dfd7',
  titleText: '#ffffff'
};

export const CARD_DIM = {
  w: 120,
  h: 140,
  radius: 6,
  border: 3,
  headerH: 60,
  padding: 20,
  iconSize: 34,
  diagonalCut: 22
};

export const CARD_TEXT = {
  title: {
    fontFamily: 'Arial',
    fontSize: '0.8rem',
    color: CARD_COLORS.titleText,
  }
};

export const HEADER = {
  bg: 0xffffff,
  border: 0x3b2b23,
  poisonBg: 0x6d5648, // opcional
};

export const BADGE = {
  bg: 0x6d5648,
  border: 0x3b2b23,
  text: '#ffffff',
  w: 30,
  h: 30,
  radius: 2,
  fontSize: '1rem'
};

// --------------------------------
// Función para aplicar el tema 
// --------------------------------

export function applyTheme(theme: ThemeType) {
  const root = document.documentElement;
  const c = theme.colors;

  // Variables que YA usas o quieres usar en CSS
  root.style.setProperty("--arcane-primary", c.primary);
  root.style.setProperty("--arcane-glow", c.secondary);

  root.style.setProperty("--bg-button", c.bgButton);
  root.style.setProperty("--box-shadow-button", c.boxShadowButton);
  root.style.setProperty("--hover-button", c.hoverButton);
  root.style.setProperty("--text-button", c.textButton);

  // si no tienes arcane-dark en ThemeType, usa scrolltrack como "dark"
  root.style.setProperty("--arcane-dark", c.scrolltrack);

  root.style.setProperty("--ui-text", c.text);
  root.style.setProperty("--ui-panel", c.scrollthumb);

  root.style.setProperty("--ui-bg", c.background);
  root.style.setProperty("--ui-gradient", c.gradient);

  root.style.setProperty("--scroll-track", c.scrolltrack);
  root.style.setProperty("--scroll-thumb", c.scrollthumb);
  root.style.setProperty("--scroll-thumb-hover", c.scrollthumbHover);
}


