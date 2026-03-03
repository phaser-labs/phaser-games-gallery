import { getFullAccessibilityGames, getReducedAccessibilityGames } from '@/utils/filterByAccesibility';

import { CardGame } from '../components/cardGame';

export const Home = () => {
  const dataFullGames = getFullAccessibilityGames();
  const dataReducedGames = getReducedAccessibilityGames();
  return (
    <>
      <div className="header">
        <h1>Phaser Games 2025-2026</h1>
      </div>

      <div className="container">
        <section id="juegos con accesibilidad completa">
          <div className="container-games">
            {dataFullGames.map((game) => {
              return <CardGame key={game.name} name={game.name} image={game.image} url={game.url} />;
            })}
          </div>
        </section>

        <div className="divider"></div>

        <section id="juegos con accesibilidad reducida">
          <h2 className="txt-title">Accesibilidad reducida</h2>
          <p className="txt-description">
            <span className="icon-alert" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-circle-alert-icon lucide-circle-alert">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
            </span>
            Sección de juegos con accesibilidad reducida, es decir, juegos que no cumplen con los requisitos propuestos
            por la WCAG.
          </p>
          <div className="container-games">
            {dataReducedGames.map((game) => {
              return <CardGame key={game.name} name={game.name} image={game.image} url={game.url} />;
            })}
          </div>
        </section>
      </div>
    </>
  );
};
