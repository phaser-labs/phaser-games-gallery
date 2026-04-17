import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Audio } from 'books-ui';

import { Advice } from '../types/types';

export function renderAudio(
  container: HTMLDivElement,
  prevRoot: Root | undefined,
  advice: Advice
): Root {
  if (prevRoot) {
    prevRoot.unmount();
  }

  const root = createRoot(container);

  root.render(
    React.createElement(
      React.Fragment,
      null,
      advice.audio?.audioContent
        ? React.createElement(Audio, {
            src: advice.audio.audioContent,
            size: 'small',
          })
        : null,
      advice.audio?.audioAlly
        ? React.createElement(Audio, {
            src: advice.audio.audioAlly,
            size: 'small',
            a11y: true,
          })
        : null
    )
  );

  return root;
}