import React from 'react';

interface Props {
  children?: React.ReactNode;
  title?: string;
}

export const ModalBibliographyGeneralLink: React.FC<Props> = ({ title, children }) => {
  return (
    <article className="u-flow">
      {title && <p className="u-font-bold">{title}</p>}
      {children}
    </article>
  );
};
