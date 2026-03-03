interface dataGameProps {
  name: string;
  image: string;
  url: string;
  accesibility: 'reduced' | 'full';
}

export const dataGames: dataGameProps[] = [
  {
    name: 'Frog Jumping',
    image: 'assets/images/game-frog-jumping.webp',
    url: 'frog-jumping',
    accesibility: 'full'
  },
  {
    name: 'Car Question',
    image: 'assets/images/game-car-question.webp',
    url: 'car-question',
    accesibility: 'full'
  },
  {
    name: 'Maze Game',
    image: 'assets/images/game-maze.webp',
    url: 'maze-game',
    accesibility: 'full'
  },
  {
    name: 'Camino de preguntas',
    image: 'assets/images/camino-preguntas.webp',
    url: 'road-say',
    accesibility: 'full'
  },
  {
    name: 'Desafío del Arquero',
    image: 'assets/images/desafio-arquero.webp',
    url: 'arquery-game',
    accesibility: 'full'
  },
  {
    name: 'Arcanum Archer',
    image: 'assets/images/arcanum-archer.webp',
    url: 'arcanum-archer',
    accesibility: 'full'
  },
  {
    name: 'Juego de Memoria',
    image: 'assets/images/game-memory.webp',
    url: 'memory-card',
    accesibility: 'full'
  },
  {
    name: 'Pistas de Sabiduría',
    image: 'assets/images/game-clues-of-wisdom.webp',
    url: 'clues-of-wisdom',
    accesibility: 'reduced'
  },
  {
    name: 'Ciudad de Sabiduría',
    image: 'assets/images/city-of-wisdom.webp',
    url: 'city-of-wisdom',
    accesibility: 'full'
  },
  {
    name: 'Juego de Reorganizar Frases',
    image: 'assets/images/game-reorganize.webp',
    url: 'game-reorganize',
    accesibility: 'full'
  },
  {
    name: 'Juego de Revelar la imagen',
    image: 'assets/images/game-tap-reveal.webp',
    url: 'game-tap-reveal',
    accesibility: 'full'
  },
  {
    name: 'Whack A Question',
    image: 'assets/images/whack-a-question.webp',
    url: 'whack-a-question',
    accesibility: 'reduced'
  },
  {
    name: 'Quiz Flight',
    image: 'assets/images/quiz-flight.webp',
    url: 'quiz-flight',
    accesibility: 'reduced'
  },
  {
    name: 'El Templo de Conocimiento',
    image: 'assets/images/temple-of.webp',
    url: 'temple-of-knowledge',
    accesibility: 'full'
  },
  {
    name: 'Game Mistery Mode',
    image: 'assets/images/game-mistery.webp',
    url: 'game-mistery-mode',
    accesibility: 'full'
  },
  {
    name: 'Tricky Rush',
    image: 'assets/images/trickyrush.webp',
    url: 'tricky-rush',
    accesibility: 'reduced'
  }
];
