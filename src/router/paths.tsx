import {
  ArcanumArcher,
  CarQuestion,
  CityOfWisdom,
  CluesOfWisdom,
  FrogJump,
  GameArquerySimple,
  GameMazeQuestion,
  GameMemoryCard,
  GameQuizFlight,
  GameReorganize,
  Home,
  MisteryModeGame,
  PoolQuestionPage,
  RoadSay,
  TapRevealGame,
  TempleOfKnowledgePage,
  TrickyRushPage,
  WhackAQuestion
} from '@/pages';

import type { PathType } from '../types/types';

export const paths: PathType[] = [
  {
    title: 'Home',
    path: '/',
    component: <Home />
  },
  {
    title: 'Frog Jump',
    path: '/frog-jumping',
    component: <FrogJump />
  },
  {
    title: 'Arcanum Archer',
    path: '/arcanum-archer',
    component: <ArcanumArcher />
  },
  {
    title: 'Car Question',
    path: '/car-question',
    component: <CarQuestion />
  },
  {
    title: 'Game Maze',
    path: '/maze-game',
    component: <GameMazeQuestion />
  },
  {
    title: 'Camino del desafio',
    path: '/road-say',
    component: <RoadSay />
  },
  {
    title: 'Desafío del Arquero',
    path: '/arquery-game',
    component: <GameArquerySimple />
  },
  {
    title: 'juego de memoria',
    path: '/memory-card',
    component: <GameMemoryCard />
  },
  {
    title: 'Pistas de Sabiduria',
    path: '/clues-of-wisdom',
    component: <CluesOfWisdom />
  },
  {
    title: 'Ciudad de Sabiduria',
    path: '/city-of-wisdom',
    component: <CityOfWisdom />
  },
  {
    title: 'Juego de Reorganizar Frases',
    path: '/game-reorganize',
    component: <GameReorganize />
  },
  {
    title: 'Juego de Revelar la imagen',
    path: '/game-tap-reveal',
    component: <TapRevealGame />
  },
  {
    title: 'Whack A Question',
    path: '/whack-a-question',
    component: <WhackAQuestion />
  },
  {
    title: 'Quiz Flight',
    path: '/quiz-flight',
    component: <GameQuizFlight />
  },
  {
    title: 'Juego de Ataque (Preguntas)',
    path: '/temple-of-knowledge',
    component: <TempleOfKnowledgePage />
  },
  {
    title: 'Game mistery mode',
    path: '/game-mistery-mode',
    component: <MisteryModeGame />
  },
  {
    title: 'Tricky Rush',
    path: '/tricky-rush',
    component: <TrickyRushPage />
  },
  {
    title: 'Pool Question',
    path: '/pool-question',
    component: <PoolQuestionPage />
  }
];
