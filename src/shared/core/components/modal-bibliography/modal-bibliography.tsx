import { Audio } from 'books-ui';
import { Modal } from '@ui/components/modal';
import type { ModalCoreProps } from '@ui/components/modal/modal';

import { useOvaContext } from '@/context/ova-context';

import { loadCSS } from '../../utils/loadCSS';

import { i18n } from './const';
import { ModalBibliographyGeneralLink } from './modal-bibliography-general-link';
import { ModalBibliographyLink } from './modal-bibliography-link';

const css = await loadCSS({
  ui: 'modal-bibliography/modal-bibliography.module.css',
  local: 'modal-bibliography/modal-bibliography.module.css'
});

interface Props extends ModalCoreProps {
  addClass?: string;
  label?: string;
  audio?: string;
  content?: JSX.Element | JSX.Element[];
}

type SubComponents = {
  Link: typeof ModalBibliographyLink;
  LinkGeneral: typeof ModalBibliographyGeneralLink;
};

const ModalBibliography: React.FC<Props> & SubComponents = ({
  addClass,
  label,
  children,
  audio,
  content,
  ...props
}) => {
  const { lang } = useOvaContext();

  return (
    <Modal {...props} addClass={`${css['modal']} u-py-4 ${addClass ?? ''}`}>
      <div className="u-flow">
        <h2 className="u-text-center">{label || i18n[lang].title}</h2>
        {content}
        <ul className="u-list-shape u-flow">{children}</ul>
        {audio ? <Audio src={audio} /> : null}
      </div>
    </Modal>
  );
};

ModalBibliography.Link = ModalBibliographyLink;
ModalBibliography.LinkGeneral = ModalBibliographyGeneralLink;

export { ModalBibliography };
