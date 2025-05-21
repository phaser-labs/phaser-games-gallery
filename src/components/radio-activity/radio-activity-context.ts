import { createContext } from 'books-ui';

import type { RadioActivityContextType } from './types/types';

export const [RadioActivityProvider, useRadioActivityContext] = createContext<RadioActivityContextType>({
  name: 'RadioActivityContext'
});
