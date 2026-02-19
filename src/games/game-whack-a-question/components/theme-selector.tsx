import { FC, useEffect, useState } from 'react';

import { ThemeType } from '../types/types';
import { themeManager } from '../utils/theme-manager';

import css from './styles.module.css';

interface ThemeSelectorProps {
  onThemeChange?: (theme: ThemeType) => void;
  gameEvents?: Phaser.Events.EventEmitter;
}

export const ThemeSelector: FC<ThemeSelectorProps> = ({ onThemeChange, gameEvents }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(themeManager.getCurrentTheme());
  const availableThemes = themeManager.getAllThemes();

  useEffect(() => {
    // Suscribirse a cambios de tema
    const unsubscribe = themeManager.subscribe((theme: ThemeType) => {
      setCurrentTheme(theme);
      if (onThemeChange) {
        onThemeChange(theme);
      }
    });

    return unsubscribe;
  }, [onThemeChange]);

  const handleThemeSelect = (theme: ThemeType) => {
    themeManager.setTheme(theme.id);
    onThemeChange?.(theme);   
    
    // Notificar a Phaser sobre el cambio de tema
    if (gameEvents) {
      gameEvents.emit('themeChanged', themeManager.getCurrentTheme());
    }
  };

  return (
    <div className={css['theme-selector']}>
      <div className="theme-selector-header">
        <span className="theme-icon">🎨</span>
        <span className="theme-label">Selecciona un tema:</span>
      </div>
      <div className={css['theme-buttons-container']} data-testid="theme-buttons-container">
        {availableThemes.map((theme) => (
          <button
            key={theme.id}
            className={`${css['theme-button']} ${currentTheme.id === theme.id ? `${css.active}` : ''}`}
            onClick={() => handleThemeSelect(theme)}
            style={{
              '--theme-primary': theme.colors.primary,
              '--theme-secondary': theme.colors.secondary
            } as React.CSSProperties}
            aria-label={`Seleccionar tema ${theme.name}`}
          >
            <div className={css['theme-preview']}>
              <div 
                className={css['theme-color-preview']}
                style={{ backgroundColor: theme.colors.primary }}
              ></div>
              <div 
                className={css['theme-color-preview']}
                style={{ backgroundColor: theme.colors.secondary }}
              ></div>
            </div>
            <span className={css['theme-name']}>{theme.name}</span>
            {currentTheme.id === theme.id && (
              <span className={css['theme-check']} aria-hidden="true" data-testid="theme-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
