import { BASIC_VALUES, CONTRAST } from '../consts';

export type ContrastType =
  | 'high-contrast'
  | 'grayscale'
  | 'invert-colors'
  | 'yellow-on-black'
  | 'red-on-white'
  | 'green-on-blue'
  | 'yellow-on-blue'
  | 'white-on-black'
  | 'no-contrast';

export type BasicValuesType = (typeof BASIC_VALUES)[keyof typeof BASIC_VALUES];

export type ConfigA11y = {
  fontSize: BasicValuesType;
  contrast: ContrastType;
  lineHeight: BasicValuesType;
  letterSpacing: BasicValuesType;
  darkMode: boolean;
  keyboardShortcuts: boolean;
  stopAnimations: boolean;
  audio: boolean;
};

export type ContrastValues = (typeof CONTRAST)[keyof typeof CONTRAST];

export enum ConfigA11yProperty {
  FontSize = 'fontSize',
  Contrast = 'contrast',
  LineHeight = 'lineHeight',
  LetterSpacing = 'letterSpacing',
  DarkMode = 'darkMode',
  StopAnimations = 'stopAnimations',
  Audio = 'audio',
  KeyboardShortcuts = 'keyboardShortcuts'
}

export interface useModalType {
  ref: React.RefObject<HTMLDivElement>;
  isOpen: boolean;
  onClose: () => void;
}
