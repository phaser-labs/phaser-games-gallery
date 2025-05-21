import { useReducer } from 'react';

import { CardElement } from './card-element.tsx';
import { PhraseAndImageProvider } from './game-phrase-context.ts';
import { ImageElement } from './image-element.tsx';
import { PhraseAndImageModal } from './pharase-and-image-modal.tsx';
import { PhraseAndImageButton } from './phrase-and-image-button.tsx';

type Card = { url: string; alt: string; state: boolean | null };

interface Props {
  children?: JSX.Element | JSX.Element[];
  handleReset: (index: number | null) => void;
  handleSelectImageEx: (index: number, card: Card) => void;
  numCorrects: number;
  onResult?: (result: boolean) => void;
}

type SubComponents = {
  Card: typeof CardElement;
  Button: typeof PhraseAndImageButton;
  selectImage: typeof ImageElement;
  Modal: typeof PhraseAndImageModal;
};

type ActiveButton = {
  index: number | null;
  join: number | null;
};

type State = {
  openModal: boolean;
  activeButton: ActiveButton;
  validation: boolean;
  button: boolean;
  result: boolean;
  cardsCorrect: boolean[];
};

const initialState: State = {
  openModal: false,
  activeButton: { index: null, join: null },
  validation: false,
  button: false,
  result: false,
  cardsCorrect: []
};

const PhraseAndImage: React.FC<Props> & SubComponents = ({
  children,
  handleReset,
  handleSelectImageEx,
  onResult,
  numCorrects
}) => {
  const [activity, updateActivity] = useReducer(
    (prev: typeof initialState, next: Partial<State>) => ({ ...prev, ...next }),
    initialState
  );

  const handleOpenModal = (id: number, join: number) => {
    updateActivity({ openModal: true, activeButton: { index: id, join: join } });
  };

  const handleSelectImage = (imageUrl: string, join: number, alt: string): void => {
    if (activity.activeButton.index !== null) {
      const card = {
        url: imageUrl,
        state: join === activity.activeButton.join,
        alt: alt
      };
      console.log(card);

      handleSelectImageEx(activity.activeButton.index, card);

      updateActivity({ openModal: false });
    }
    updateActivity({ cardsCorrect: [...activity.cardsCorrect, join === activity.activeButton.join] });
  };

  const handleValidation = () => {
    const trueStateCards = activity.cardsCorrect.filter((card: boolean) => card === true);
    updateActivity({ validation: true, button: true });

    const result = trueStateCards.length === numCorrects;
    if (onResult) {
      onResult(result);
    }

    // Actualiza la actividad con el nuevo resultado
    updateActivity({ result: result });
  };

  const handleResetActivity = () => {
    updateActivity(initialState);
    handleReset(activity.activeButton.index);
  };

  return (
    <PhraseAndImageProvider
      value={{
        handleValidation,
        handleReset: handleResetActivity,
        handleSelectImage,
        handleOpenModal,
        openModal: activity.openModal,
        button: activity.button,
        result: activity.result,
        validation: activity.validation
      }}>
      {children}
    </PhraseAndImageProvider>
  );
};
PhraseAndImage.Card = CardElement;
PhraseAndImage.Button = PhraseAndImageButton;
PhraseAndImage.Button = PhraseAndImageButton;
PhraseAndImage.Modal = PhraseAndImageModal;
PhraseAndImage.selectImage = ImageElement;
export { PhraseAndImage };
