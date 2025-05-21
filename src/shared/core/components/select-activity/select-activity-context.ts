import { createContext } from 'books-ui';

import type { SelectActivityContextType} from './types/types';

export const [SelectActivityProvider, useSelectActivityContext] = createContext<SelectActivityContextType>({
  name: 'SelectActivityContext'
});
