import { dataGames } from '@/data/data-games';

import { CardGame } from '../components/cardGame';

export const Home = () => {
  return (
    <>
      <div className="header">
        <h1>Phaser Games 2025</h1>
      </div>
      <div className="container">
      {dataGames.map((game) => {
        return (
          <CardGame
            key={game.name}
            name={game.name}
            image={game.image}
            url={game.url}
          />
        );
      })}
      </div>
    </>
  );
};
