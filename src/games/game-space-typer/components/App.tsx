import { SpaceTyperGame } from '../SpaceTyper';

import { HUD } from './HUD';

import css from '../styles/space-typer.module.css';

export function SpaceTyperApp() {
  return (
    <main className={css.app_shell}>
      <div className={css.app_shell__background} aria-hidden="true">
        <span className={`${css.orb} ${css['orb--a']}`} />
        <span className={`${css.orb} ${css['orb--b']}`} />
        <span className={`${css.orb} ${css['orb--c']}`} />
      </div>

      <section className={css['game-frame']}>
        <header className={css['game-frame__header']}>
          <div>
            <p className={css['game-frame__eyebrow']}>Desafio de escritura</p>
            <h1 className={css['game-frame__title']}>Space Typer</h1>
          </div>

          <p className={css['game-frame__subtitle']}>
          Escribe las palabras de cada alien para destruirlos antes de que lleguen a la Tierra.
          </p>
        </header>

        <div className={css['game-frame__stage']} style={{ position: 'relative' }}>
          <SpaceTyperGame />
          <HUD />
        </div>  
      </section>
    </main>
  );
}

export default SpaceTyperApp;