import { Modal } from '@shared/ui/components';

import { usePhraseAndImageContext } from './game-phrase-context';

interface Props {
  children: React.ReactElement;
}

export const PhraseAndImageModal: React.FC<Props> = ({ children }) => {
  const { openModal } = usePhraseAndImageContext();

  return (
    <Modal isOpen={openModal} onClose={() => openModal} finalFocusRef="card_0">
      {children}
    </Modal>
  );
};
