import { createContext } from 'books-ui';

import type { CheckboxActivityContextType } from './types/types';

export const [CheckboxActivityProvider, useCheckboxActivityContext] = createContext<CheckboxActivityContextType>({
  name: 'CheckboxActivityContext'
});
