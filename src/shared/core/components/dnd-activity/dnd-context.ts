import { createContext } from 'books-ui';

import type { DndActivityContextType} from './types/types';

export const [DndActivityProvider, useDndActivityContext] = createContext<DndActivityContextType>({
  name: 'DndActivityContext'
});
