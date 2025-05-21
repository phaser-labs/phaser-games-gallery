import { createContext } from 'books-ui';
interface RadioActivityContextType {
  handleValidation: () => void;
  handleReset: () => void;
  validation: boolean;
  button: boolean;
  result: boolean;
  openModal: boolean;
  handleSelectImage: (imageUrl: string, join: number, alt: string) => void;
  handleOpenModal: (id: number, join: number) => void;
}

export const [PhraseAndImageProvider, usePhraseAndImageContext] = createContext<RadioActivityContextType>({
  name: 'PhraseAndImageContext'
});
