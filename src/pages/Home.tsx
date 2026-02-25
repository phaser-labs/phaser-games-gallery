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
