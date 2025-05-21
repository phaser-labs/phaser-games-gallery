import type { AccordionItemProps } from 'books-ui';
import { Accordion as AccordionUI } from 'books-ui';

import css from './accordion.module.css';

export const AccordionItem: React.FC<AccordionItemProps> = ({ addClass, children, ...props }) => (
  <AccordionUI.Item addClass={`${css['accordion-item']} ${addClass ?? ''} `} {...props}>
    {children}
  </AccordionUI.Item>
);
