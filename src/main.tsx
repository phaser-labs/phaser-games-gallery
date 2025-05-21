import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@router/router';

import 'books-ui/styles';

import 'virtual:uno.css';
import '@core/styles/index.css';
import '@ui/styles/index.css';
import '@styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
