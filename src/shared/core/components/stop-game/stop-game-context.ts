import { createContext } from 'books-ui';

import type { StopGameContextType } from './types/types';

export const [StopGameContextProvider, useStopGame] = createContext<StopGameContextType>({
  name: 'StopGameContext'
});
