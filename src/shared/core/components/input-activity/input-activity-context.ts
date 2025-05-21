import { createContext } from 'books-ui';

import type { InputActivityContextType } from './type/types';

export const [InputActivityProvider, useInputActivityContext] = createContext<InputActivityContextType>({
  name: 'InputActivityContext'
});
