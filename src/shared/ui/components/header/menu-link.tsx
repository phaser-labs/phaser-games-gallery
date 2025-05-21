import classNames from 'classnames';
import { Link, useRoute } from 'wouter';

import css from './header.module.css';

interface Props {
  href: string;
  title: string;
  itemNumber: number;
}

export const MenuLink: React.FC<Props> = ({ href, title, itemNumber }) => {
  const [isActive] = useRoute(href);

  return (
    <Link
      to={href}
      className={classNames(css['menu-list__button'], {
        [css['menu-list__button--active']]: isActive
      })}
      {...(isActive && { 'aria-current': 'page' })}>
      <span aria-hidden="true">{itemNumber}.</span>
      <span dangerouslySetInnerHTML={{ __html: title }}></span>
    </Link>
  );
};
