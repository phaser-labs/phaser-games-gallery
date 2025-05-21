import { useId } from 'react';

import { loadCSS } from '../../utils/loadCSS';

const css = await loadCSS({
  ui: 'modal-bibliography/modal-bibliography.module.css',
  local: 'modal-bibliography/modal-bibliography.module.css'
});

interface Props {
  authors: string;
  name: string;
  link?: string;
  addClass?: string;
}

export const ModalBibliographyLink: React.FC<Props> = ({ authors, name, link, addClass }) => {
  const uid = useId();

  return (
    <li className={`${css['bibliography-link']} ${addClass ?? ''}`}>
      {authors} <span id={`bibliography-link-${uid}`}>{name}</span>&nbsp;
      {link ? (
        <a href={link} aria-labelledby={`bibliography-link-${uid}`} target="_blank" rel="noreferrer">
          {link}
        </a>
      ) : null}
    </li>
  );
};
