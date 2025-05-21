import type { AccordionProps } from 'books-ui';
import { Accordion as AccordionUI } from 'books-ui';

import { AccordionButton } from './accordion-button';
import { AccordionItem } from './accordion-item';
import { AccordionPanel } from './accordion-panel';

type SubComponents = {
  Button: typeof AccordionButton;
  Item: typeof AccordionItem;
  Panel: typeof AccordionPanel;
};

const Accordion: React.FC<AccordionProps> & SubComponents = ({ children, ...props }) => (
  <AccordionUI {...props}>{children}</AccordionUI>
);

Accordion.Button = AccordionButton;
Accordion.Item = AccordionItem;
Accordion.Panel = AccordionPanel;

export { Accordion };
