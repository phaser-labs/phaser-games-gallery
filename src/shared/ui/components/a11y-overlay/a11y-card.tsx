import React from 'react';
import { Icon } from '@core/components/icon';

import css from './a11y-overlay.module.css';

interface Props {
  icon: string;
  title: string;
  main: string;
}

export const A11yCard: React.FC<Props> = ({ icon, title, main }) => {
  return (
    <article className={css['card']}>
      <Icon name={icon} />
      <section className={css['card__content']}>
        <h3>{title}</h3>
        <p>{main}</p>
      </section>
    </article>
  );
};
