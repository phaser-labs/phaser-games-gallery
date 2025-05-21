import { createContext } from 'books-ui';

import type { PanelContextType } from './types/types';

export const [PanelCoreProvider, usePanelCoreContext] = createContext<PanelContextType>({
  name: 'PanelCoreContext'
});
