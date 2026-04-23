import GameManager, { useGameManagerStore } from '../core/GameManager';

import css from '../styles/space-typer.module.css'
export function HUD() {
  const gameManager = GameManager.getInstance();
  const score = useGameManagerStore((state) => state.score);
  const lives = useGameManagerStore((state) => state.lives);
  const gameState = useGameManagerStore((state) => state.gameState);
  const isBossActive = useGameManagerStore((state) => state.isBossActive);

  const handleRestart = (): void => {
    gameManager.reset();
  };

  if (gameState === 'quieto') {
    return null;
  }
  

  return (
    <div className={`${css.hud} ${css.hudEnter}`} aria-live="polite">
      {!isBossActive && (
        <section className={css.hud__panel}>
          <div className={css.hud__brand}>
            <span className={css.hud__eyebrow}>Medidor de desempeño</span>
          </div>

          <div className={css.hud__stats}>
            <div className={css.hud__stat}>
              <span>Puntos</span>
              <strong>{score}</strong>
            </div>

            <div className={css.hud__stat}>
              <span>Vidas</span>
              <strong>{lives}</strong>
            </div>

          </div>
        </section>
      )}

      {gameState === 'gameOver' && (
        <section className={css.hud__panel_alert} style={{ position: 'relative', top: '-84px' }}>
          <div className={css.modalGlitch} aria-hidden="true">
            <p className={css.hud__alert_title}>Game Over</p>
            <p className={css.hud__alert_copy}>Puntaje final: {score}</p>
          </div>
          <p className={css.hud__alert_title}>Game Over</p>
          <p className={css.hud__alert_copy}>Puntaje final: {score}</p>
          <button type="button" className={css.hud__button_alert} onClick={handleRestart}>
            Reiniciar misión
          </button>
        </section>
      )}

      {gameState === 'gameWin' && (
        <section className={css.hud__panel_alert} style={{ position: 'relative', border: '1px solid #00ff00', top: '-84px', background: 'linear-gradient(180deg, #1a2f19f2), #061908e6)' }}>
          <p className={css.hud__alert_title} style={{ color: '#00ff00', textShadow: '0 0 10px #00ff00' }}>¡Misión Cumplida!</p>
          <p className={css.hud__alert_copy}>Puntaje final: {score}</p>
          <button type="button" className={css.hud__button_win} onClick={handleRestart}>
            Jugar de nuevo
          </button>
        </section>
      )}

      {(!isBossActive || gameState === 'gameOver' || gameState === 'gameWin') && (
        <p className={css.hud__hint}>
          {gameState === 'jugando' && !isBossActive ? 'Escribe la siguiente letra de la palabra del alien más cercano.' : ''}
        </p>
      )}
    </div>
  );
}
