import { useEffect, useId } from 'react';
import type { SectionProps } from 'books-ui';
import { Panel as PanelUI } from 'books-ui';

import { useSectionManager } from './hooks/useSectionManager';
import { usePanelCoreContext } from './panel-context';

import css from './panel.module.css';

interface Props extends SectionProps {
  title?: string;
  addClass?: string;
  interpreter?: {
    a11yURL?: string;
    contentURL?: string;
  };
}

export const PanelSection: React.FC<Props> = ({ title, addClass, children, interpreter }) => {
  const { addNewVideoSource } = usePanelCoreContext();

  const uid: string = useId();
  const ref = useSectionManager(title);

  useEffect(() => {
    if (!interpreter) return;
    addNewVideoSource({ uid, ...interpreter });
  }, [interpreter, addNewVideoSource, uid]);

  return (
    <PanelUI.Section ref={ref} id={uid} addClass={`${css['panel__section']} u-px-0.5  ${addClass ?? ''}`}>
      {children}
    </PanelUI.Section>
  );
};
