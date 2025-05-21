import { createContext } from 'books-ui';

import type { HeaderContextType } from './types/types';

export const [HeaderProvider, useHeaderContext] = createContext<HeaderContextType>({
  name: 'HeaderContext'
});
