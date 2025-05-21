import { createContext } from 'books-ui';

import type { OvaContextType } from '@/types/types';

export const [OvaProvider, useOvaContext] = createContext<OvaContextType>({
  name: 'OvaContext'
});
