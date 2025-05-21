import { createContext } from 'books-ui';

import type { SelectGroupActivityContextType} from './types/types';

export const [SelectGroupActivityProvider, useSelectGroupActivityContext] = createContext<SelectGroupActivityContextType>({
  name: 'SelectGroupActivityContext'
});
