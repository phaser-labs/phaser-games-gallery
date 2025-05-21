import { createContext } from 'books-ui';

import type { TrueFalseContextType } from './types/types';

export const [TableTrueFalseProvider, useTableTrueFalseContext] = createContext<TrueFalseContextType>({
  name: 'TableTrueFalseContext'
});