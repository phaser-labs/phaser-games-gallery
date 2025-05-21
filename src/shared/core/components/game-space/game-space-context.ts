import { createContext } from 'books-ui';

import type { GameSpaceContextType } from './types/types';

export const [GameSpaceProvider, useGameSpaceContext] = createContext<GameSpaceContextType>({
  name: 'GameSpaceContext'
});
