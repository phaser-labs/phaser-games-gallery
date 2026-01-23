import React, { useEffect,useState } from 'react';

import { themeManager } from '../utils/themeManager';
import type { WorldType } from '../utils/types';

import './ThemeSelector.css';

interface ThemeSelectorProps {
  onThemeChange?: (theme: WorldType) => void;
  gameEvents?: Phaser.Events.EventEmitter;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange, gameEvents }) => {
  const [currentTheme, setCurrentTheme] = useState<WorldType>(themeManager.getCurrentTheme());
  const availableThemes = themeManager.getAllThemes();

  useEffect(() => {
    // Suscribirse a cambios de tema
    const unsubscribe = themeManager.subscribe((theme: WorldType) => {
      setCurrentTheme(theme);
      if (onThemeChange) {
        onThemeChange(theme);
      }
    });

    return unsubscribe;
  }, [onThemeChange]);

  const handleThemeSelect = (themeId: number) => {
    themeManager.setTheme(themeId);
    
    // Notificar a Phaser sobre el cambio de tema
    if (gameEvents) {
      gameEvents.emit('themeChanged', themeManager.getCurrentTheme());
    }
  };

  return (
    <div className="theme-selector">
      <div className="theme-selector-header">
        <span className="theme-icon">🎨</span>
        <span className="theme-label">Selecciona un tema:</span>
      </div>
      
      <div className="theme-buttons-container">
        {availableThemes.map((theme) => (
          <button
            key={theme.id}
            className={`theme-button ${currentTheme.id === theme.id ? 'active' : ''}`}
            onClick={() => handleThemeSelect(theme.id)}
            style={{
              '--theme-primary': theme.colors.primary,
              '--theme-secondary': theme.colors.secondary
            } as React.CSSProperties}
            aria-label={`Seleccionar tema ${theme.name}`}
          >
            <div className="theme-preview">
              <div 
                className="theme-color-preview"
                style={{ backgroundColor: theme.colors.primary }}
              ></div>
              <div 
                className="theme-color-preview"
                style={{ backgroundColor: theme.colors.secondary }}
              ></div>
            </div>
            <span className="theme-name">{theme.name}</span>
            {currentTheme.id === theme.id && (
              <span className="theme-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};