import { ArcanumArcher, CarQuestion, CityOfWisdom, CluesOfWisdom, FrogJump, GameArquerySimple, GameMazeQuestion, GameMemoryCard, Home, RoadSay } from '@/pages';

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
  }
];
