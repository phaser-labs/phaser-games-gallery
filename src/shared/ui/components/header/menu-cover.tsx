import { Icon } from '@core/components/icon';

import { useOvaContext } from '@/context/ova-context';

import { MenuOptions, PropertyType } from './types/types';
import { i18n } from './consts';
import { useHeaderContext } from './header-context';

import css from './header.module.css';


interface Props { 
  children: JSX.Element | JSX.Element[];
}

export const MenuCover: React.FC<Props> = ({ children }) => {
  const { lang } = useOvaContext();
  const { expanded, handleExpanded } = useHeaderContext();

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => { 
    const buttonElement = event.target as HTMLButtonElement;
  
    // Obtener el valor de `aria-controls`
    const controlledElementId = buttonElement.getAttribute('aria-controls');
    if (!controlledElementId) return;
  
    // Actualizar el estado expandido
    handleExpanded(controlledElementId as PropertyType);
  
    // Enfocar el elemento después de un breve retraso
    setTimeout(() => {
      focusElementById(controlledElementId);
    }, 100);
  };
  
  const focusElementById = (id: string) => {
    const targetElement = document.getElementById(id) as HTMLUListElement;
    if (!targetElement) return;
  
    targetElement.focus();
  };

  return (
    <>
      <nav role="navigation" aria-label={i18n[lang].nav} className={css['menu-cover']}>
        <ul className={css['menu-cover__list']}>
          <li>
            <button
              className={`${css['menu-cover__list-button']}  js-button-menu`}
              aria-label={i18n[lang].menu}
              aria-expanded={expanded.menu}
              aria-controls={MenuOptions.MENU}
              onClick={handleClick}>
              <Icon name="menu" />
              <span>{i18n[lang].menu}</span>
            </button>
          </li>
          <li>
            <button
              className={`${css['menu-cover__list-button']}  js-button-help`}
              aria-label={i18n[lang].help}
              aria-expanded={expanded.help}
              aria-controls={MenuOptions.HELP}
              onClick={handleClick}>
              <Icon name="help" />
              <span>{i18n[lang].help}</span>
            </button>
          </li>
          <li>
            <button
              className={`${css['menu-cover__list-button']}  js-button-a11y`}
              aria-label={i18n[lang].a11y}
              aria-pressed={expanded.a11y}
              onClick={() => handleExpanded(MenuOptions.A11Y)}>
              <Icon name="a11y" />
              <span>{i18n[lang].a11y}</span>
            </button>
          </li>
        </ul>
      </nav>
      {children}
    </>
  );
};
