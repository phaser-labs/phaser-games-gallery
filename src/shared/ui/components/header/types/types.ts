export type MenuExpanded = {
  menu: boolean;
  help: boolean;
  a11y: boolean;
};

export enum MenuOptions {
  MENU = 'menu',
  HELP = 'help',
  A11Y = 'a11y',
  RESET = 'reset'
}

export type PropertyType = keyof MenuExpanded | 'reset';

export interface HeaderContextType {
  expanded: MenuExpanded;
  handleExpanded: (property: PropertyType) => void;
}
