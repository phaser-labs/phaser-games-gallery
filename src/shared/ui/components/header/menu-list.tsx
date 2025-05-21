import { useCallback, useRef } from 'react';
import { useInteractOutside } from 'books-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@core/components/icon';

import { useOvaContext } from '@/context/ova-context';

import { MenuOptions } from './types/types';
import { i18n, KEYCODE } from './consts';
import { useHeaderContext } from './header-context';

import css from './header.module.css';

interface Props extends React.OlHTMLAttributes<HTMLOListElement> {
  children: JSX.Element | JSX.Element[];
  addClass?: string;
  title?: string;
  icon?: string;
  show: boolean;
}

const variants = {
  hidden: { opacity: 0, x: 900 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      ease: 'easeOut',
      duration: 0.25
    }
  },
  exit: {
    opacity: 0,
    x: 900,
    transition: {
      ease: 'easeInOut',
      duration: 0.2
    }
  }
};

export const MenuList: React.FC<Props> = ({ addClass, children, icon, title, show, ...props }) => {
  const { handleExpanded } = useHeaderContext();
  const { lang } = useOvaContext();
  const refWrapperList = useRef<HTMLDivElement>(null!);

  /**
   * Función que se utiliza para filtrar
   * los elementos del DOM que no deben cerrar
   * el <MenuList/> cuando se interactúe fuera de este.
   * @param {HTMLElement} element - Elemento del DOM
   * @returns {boolean}
   */
  const shouldCloseOnInteractOutside = (element: HTMLElement) => {
    // Comprueba que el elemento no sea parte del componente <Tour/>
    if (element.closest('div[id^="js-tour-"]') !== null) return true;

    if (element.tagName !== 'BUTTON' && element.tagName !== 'svg') return false;
    return element.dataset && element.dataset?.type === 'menu-button';
  };

  /**
   * Función que se ejecuta al momento de
   * presionar o tocar fuera del MenuList.
   * @param {MouseEvent} event - Evento mousedown | touchstart
   */
  const onInteractionOutside = (event: MouseEvent) => {
    if (!shouldCloseOnInteractOutside(event.target as HTMLElement)) {
      handleExpanded(MenuOptions.RESET);
      event.stopPropagation();
      event.preventDefault();
    }
  };

  /**
   * Custom hook que ejecuta un método
   * cuando se interactúa fuera del elemento <ref>
   */
  useInteractOutside({ ref: refWrapperList, onInteractionOutside });

  /**
   * Función para cerrar el <MenuList/> cuando el último elemento
   * dentro de este ha perdido el focus.
   * @param {HTMLUListElement} element - Referencia del elemento del <ul> del DOM.
   */
  const handleLastFocusable = (element: HTMLUListElement) => {
    const focusableElements = element.querySelectorAll('a, button');
    const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    lastFocusableElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if ((event.key === 'Tab' || event.keyCode === KEYCODE.TAB) && !event.shiftKey) {
        handleExpanded(MenuOptions.RESET);
      }
    });
  };

  /**
   * Función para cerrar el <MenuList/> cuando
   * se presiona la tecla ESC.
   *
   * @param {React.KeyDownEvent<HTMLListElement>} event - Evento keydown.
   */
  const handleKeyDownForMenuList = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if ((event.keyCode || event.which) === KEYCODE.ESC) {
      handleExpanded(MenuOptions.RESET);
    }
  };

  const getRefElement = useCallback((node: HTMLUListElement) => {
    if (node !== null) {
      handleLastFocusable(node);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={refWrapperList}
          className={`${css['menu-list__wrapper']}`}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit">
          <div className={`${css['menu-list__title']} u-pb-2 u-px-4`}>
            <p>
              {icon && <Icon name={icon} />}
              <span>{title}</span>
            </p>
            <button
              aria-label={i18n[lang].btnCloseMenu}
              className={css['menu-list__close-button']}
              onClick={() => handleExpanded(MenuOptions.RESET)}>
              <Icon name="close" />
            </button>
          </div>
          <ul
            ref={getRefElement}
            onKeyDown={handleKeyDownForMenuList}
            className={`${css['menu-list']} ${addClass ?? ''}`}
            {...props}>
            {children}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
