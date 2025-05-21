import { useMemo } from 'react';
import { Pagination, Tooltip, useMedia } from 'books-ui';
import { Link, useLocation } from 'wouter';
import { Icon } from '@core/components/icon';
import { REMOVE_HTML_TAGS_REGEX } from '@core/consts/removeHtmlTagsRegex';
import { focusMainElement } from '@core/utils/focusMain';

import { useOvaContext } from '@/context/ova-context';

import { i18n, ICON_TYPE, PAGINATION_ITEM_TYPE, QUARTER } from './consts';
import type { PaginationItemProps, PaginationItemType, Props } from './types';

import css from './footer.module.css';

export const Footer: React.FC<Props> = ({ currentPage }) => {
  const [, navigate] = useLocation();
  const { routes, lang, titles } = useOvaContext();

  // Calcula el número de elementos límite para la paginación
  const boundaryCount = useMedia<number>(['(min-width: 1536px)'], [Math.floor(routes.length / QUARTER)], 1);

  const disabledTooltip = useMedia<boolean>(['(min-width: 768px)'], [false], true);

  /**
   * Maneja la navegación cuando se cambia la página en la paginación.
   */
  const handleNavigation = (_: React.MouseEvent<HTMLButtonElement>, value: number) => {
    navigate(`/page-${value}`);
  };

  // Limpia el titulo de cualquier etiqueta HTML que tenga.
  const parsedTitles = useMemo(() => titles.map((title) => title.replace(REMOVE_HTML_TAGS_REGEX, '')), [titles]);

  return (
    <footer className={`${css.footer} u-py-1`}>
      <Pagination
        boundaryCount={boundaryCount}
        count={routes.length}
        addClass="js-pagination-element"
        defaultPage={currentPage}
        onChange={handleNavigation}
        renderItem={(item) => (
          <PaginationItem item={item} lang={lang} titles={parsedTitles} disabledTooltip={disabledTooltip} />
        )}
      />
    </footer>
  );
};

const PaginationItem: React.FC<PaginationItemProps> = ({ item, lang, titles, disabledTooltip }) => {
  const { onClick, type, page, disabled } = item;

  // Obtiene el título de la página actual
  const currentTitle = titles[page! - 1];

  /**
   * Maneja el evento de clic en el ítem de paginación.
   *
   * @param event - Evento de clic
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    focusMainElement();
  };

  return type === PAGINATION_ITEM_TYPE.PAGE ? (
    <Tooltip label={currentTitle} hasArrow isDisabled={disabledTooltip} addClass={css['footer__nav-tooltip']}>
      <Link
        to={`/page-${page}`}
        className={css['footer__nav-link']}
        onClick={focusMainElement}
        aria-label={`${i18n[lang].page} ${page}, ${currentTitle}`}
        aria-current={item['aria-current']}>
        {page}
      </Link>
    </Tooltip>
  ) : type === PAGINATION_ITEM_TYPE.NEXT || type === PAGINATION_ITEM_TYPE.PREVIOUS ? (
    <button
      className={`${css['footer__nav-button']} u-px-2 ${type === PAGINATION_ITEM_TYPE.NEXT ? 'js-pagination-link-next' : 'js-pagination-link-previous'}`}
      onClick={handleClick}
      data-type={type}
      data-page={page}
      aria-label={type === PAGINATION_ITEM_TYPE.NEXT ? i18n[lang].nextA11y : i18n[lang].previousA11y}
      disabled={disabled}>
      <Icon addClass={css['footer__nav-button-icon']} name={ICON_TYPE[type as PaginationItemType]} />
      <span>{type === PAGINATION_ITEM_TYPE.NEXT ? i18n[lang].next : i18n[lang].previous}</span>
    </button>
  ) : (
    <span className={css['footer__nav-ellipsis']}>...</span>
  );
};
