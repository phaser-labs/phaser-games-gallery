import { ArcanumArcher, CarQuestion, FrogJump, GameArquerySimple, GameMazeQuestion, Home, RoadSay } from '@/pages';

import type { PathType } from '../types/types';

export const paths: PathType[] = [
  {
    title: 'Home',
    path: '/',
    component: <Home />
  },
  {
    title: 'Frog Jump',
    path: '/games/frog-jumping',
    component: <FrogJump />
  },
  {
    title: 'Arcanum Archer',
    path: '/games/arcanum-archer',
    component: <ArcanumArcher />
  },
  {
    title: 'Car Question',
    path: '/games/car-question',
    component: <CarQuestion />
  },
  {
    title: 'Game Maze',
    path: '/games/maze-game',
    component: <GameMazeQuestion />
  },
  {
    title: 'Camino del desafio',
    path: '/games/road-say',
    component: <RoadSay />
  },
  {
    title: 'Desafío del Arquero',
    path: '/games/arquery-game',
    component: <GameArquerySimple />
  }
];
