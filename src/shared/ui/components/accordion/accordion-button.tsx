import type { AccordionButtonProps } from 'books-ui';
import { Accordion as AccordionUI } from 'books-ui';

import css from './accordion.module.css';

export const AccordionButton: React.FC<AccordionButtonProps> = ({ addClass, children, ...props }) => (
  <AccordionUI.Button addClass={`${css['accordion-button']} ${addClass ?? ''} `} {...props}>
    {children}
  </AccordionUI.Button>
);
