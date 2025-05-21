import { useEffect, useRef } from 'react';
import type { ModalProps } from 'books-ui';
import { Modal as ModalUI } from 'books-ui';
import { Icon } from '@core/components/icon';
import type { VideoURLs } from '@core/hooks/useInterpreter';
import { useInterpreter } from '@core/hooks/useInterpreter';

import { useOvaContext } from '@/context/ova-context';

import { i18n } from './consts';

import css from './modal.module.css';

export interface ModalCoreProps extends ModalProps {
  isOpen: boolean;
  addClass?: string;
  interpreter?: VideoURLs;
}

export const Modal: React.FC<ModalCoreProps> = ({ addClass, children, isOpen, onClose, interpreter, ...props }) => {
  const { lang } = useOvaContext();
  const [updateVideoSources, restoreLastVideoSources] = useInterpreter();
  const flagOpenModal = useRef(false);

  /**
   * Maneja el cierre del modal.
   * Llama a la función de cierre si está definida y restaura las fuentes de video anteriores.
   */
  const handleCloseModal = () => {
    onClose?.();
    restoreLastVideoSources();
  };

  /**
   * Efecto para actualizar las fuentes de video cuando el intérprete cambia o el modal se abre.
   * Si el intérprete no está definido o el modal no está abierto, no hace nada.
   * De lo contrario, actualiza las fuentes de video con los datos del intérprete.
   */
  useEffect(() => {
    if (interpreter && isOpen && !flagOpenModal.current) {
      flagOpenModal.current = true;
      updateVideoSources({ ...interpreter });
    }

    // Cuando `isOpen` vuelve a false, reinicia el flag
    if (!isOpen && flagOpenModal.current) {
      flagOpenModal.current = false;
    }
  }, [interpreter, isOpen, updateVideoSources]);

  return (
    <ModalUI {...props} isOpen={isOpen} onClose={handleCloseModal}>
      <ModalUI.Overlay addClass={css['modal-overlay']} />
      <ModalUI.Content addClass={`${css['modal']} u-p-3 ${addClass ?? ''}`}>
        <button onClick={handleCloseModal} aria-label={i18n[lang].btnModal} className={`${css['modal-button']}`}>
          <Icon name="close" />
        </button>
        <>{children}</>
      </ModalUI.Content>
    </ModalUI>
  );
};
