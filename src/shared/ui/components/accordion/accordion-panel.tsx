import type { AccordionPanelProps } from 'books-ui';
import { Accordion as AccordionUI } from 'books-ui';

import css from './accordion.module.css';

export const AccordionPanel: React.FC<AccordionPanelProps> = ({ addClass, children, ...props }) => (
  <AccordionUI.Panel addClass={`${css['accordion-panel']} ${addClass ?? ''} `} {...props}>
    {children}
  </AccordionUI.Panel>
);
