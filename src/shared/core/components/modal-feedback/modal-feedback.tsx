import { Audio } from 'books-ui';
import { Modal } from '@ui/components/modal';
import type { ModalCoreProps } from '@ui/components/modal/modal';

import { useOvaContext } from '@/context/ova-context';

import { loadCSS } from '../../utils/loadCSS';

import { i18n } from './consts';

const css = await loadCSS({
  ui: 'modal-feedback/modal-feedback.module.css',
  local: 'modal-feedback/modal-feedback.module.css',
})
interface Props extends ModalCoreProps {
  addClass?: string;
  type?: 'wrong' | 'success';
  label?: string;
  audio?: string;
}

export const ModalFeedback: React.FC<Props> = ({ type = 'success', label, addClass, audio, children, ...props }) => {
  const { lang } = useOvaContext();
  const imageURL = `assets/base/${type}.webp`;

  return (
    <Modal {...props} addClass={`${css['modal']} u-py-6 ${addClass ?? ''}`}>
      <div className={`u-flow ${css['modal__wrapper']}`} data-type={type}>
        <img className={css['modal__image']} src={imageURL} alt="" />
        <div className={`u-flow ${css['modal__response-wrapper']}`}>
          <p className={css['modal__title']} data-title>
            {label || i18n[lang][type]}
          </p>
          {audio ? <Audio data-audio src={audio} addClass={css['modal__audio']} /> : null}
          {children}
        </div>
      </div>
    </Modal>
  );
};
