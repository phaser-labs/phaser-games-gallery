import GameManager, { useGameManagerStore } from '../core/GameManager';

import css from '../styles/space-typer.module.css'
export function HUD() {
  const gameManager = GameManager.getInstance();
  const score = useGameManagerStore((state) => state.score);
  const lives = useGameManagerStore((state) => state.lives);
  const gameState = useGameManagerStore((state) => state.gameState);

  const handleRestart = (): void => {
    gameManager.reset();
  };

  return (
    <div className={css.hud} aria-live="polite">
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

          <div className={css.hud__stat}>
            <span>Estado</span>
            <strong>{gameState === 'gameOver' ? 'Critico' : gameState}</strong>
          </div>
        </div>
      </section>

      {gameState === 'gameOver' && (
        <section className={css.hud__panel + ' ' + css.hud__panel_alert}>
          <p className={css.hud__alert_title}>Game Over</p>
          <p className={css.hud__alert_copy}>Puntaje final: {score}</p>
          <button type="button" className={css.hud__button} onClick={handleRestart}>
            Reiniciar misión
          </button>
        </section>
      )}

      <p className={css.hud__hint}>Escribe la siguiente letra de la palabra del alien más cercano.</p>
    </div>
  );
}
