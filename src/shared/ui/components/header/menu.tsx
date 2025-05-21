import { useLayoutEffect, useState } from 'react';
import { Tour } from 'books-ui';
import { Link } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { Icon } from '@core/components/icon';

import { useOvaContext } from '@/context/ova-context';

import { useA11y } from '../a11y-overlay/hooks/useA11y';
import { Modal } from '../modal';

import { MenuOptions } from './types/types';
import { HOME_PATH, i18n, i18nTour, MODAL, SPANISH_LANGUAGE } from './consts';
import { useHeaderContext } from './header-context';
import { MenuButton } from './menu-button';
import { MenuCover } from './menu-cover';
import { MenuLink } from './menu-link';
import { MenuList } from './menu-list';

import css from './header.module.css';

export const Menu = () => {
  const { lang, titles, routes } = useOvaContext();
  const { expanded, handleExpanded } = useHeaderContext();
  const { updateHTMLAttributesFromLocalStorage } = useA11y();
  const [location] = useHashLocation();

  // Usado para controlar la apertura y cierre
  // del componente  <Modal/>
  const [modal, setOpenModal] = useState<string | null>(null);

  /**
   * Función para abrir los modales.
   * @param {string} modal
   */
  const toggleModal = (modal?: string) => {
    setOpenModal(modal || null);
  };

  useLayoutEffect(() => {
    /**
     * Obtiene las opciones de accesiblidad que
     * están en el localStorage y las aplica en el elemento HTML.
     */
    updateHTMLAttributesFromLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {location !== HOME_PATH ? (
        <nav role="navigation" aria-label={i18n[lang].nav} className={css['menu']}>
          <HamburguerButton />
          <ul className={`${css['list']} ${css['list--menu']}`}>
            <li className={css['list__item']}>
              <Link to="/" tabIndex={2} className={`${css['menu__button']} js-link-home`}>
                {i18n[lang].home}
              </Link>
            </li>
            <li className={css['list__item']}>
              <MenuButton
                tabIndex={3}
                aria-expanded={expanded.menu}
                addClass="js-button-menu"
                onClick={() => handleExpanded(MenuOptions.MENU)}>
                <span>{i18n[lang].menu}</span>
                <Icon name="chevron-down" />
              </MenuButton>

              <MenuList
                show={expanded.menu}
                title={i18n[lang].menu}
                icon="menu"
                addClass={css['menu-list--hover-green']}>
                {titles.map((title, index) => (
                  <li key={index}>
                    <MenuLink href={routes[index]} title={title} itemNumber={index + 1} />
                  </li>
                ))}
              </MenuList>
            </li>
            <li className={css['list__item']}>
              <MenuButton
                tabIndex={4}
                aria-expanded={expanded.help}
                addClass="js-button-help"
                onClick={() => handleExpanded(MenuOptions.HELP)}>
                <span>{i18n[lang].help}</span>
                <Icon name="chevron-down" />
              </MenuButton>

              <MenuList
                show={expanded.help}
                title={i18n[lang].help}
                icon="help"
                addClass={css['menu-list--hover-yellow']}>
                <li>
                  <TourButton />
                </li>
                <li>
                  <button
                    className={`${css['menu-list__button']} js-button-specifications`}
                    onClick={() => toggleModal(MODAL.ESPECIFICATION)}>
                    {i18n[lang].specifications}
                  </button>
                </li>
              </MenuList>
            </li>
          </ul>
        </nav>
      ) : (
        <MenuCover>
          <MenuList
            id={MenuOptions.MENU}
            tabIndex={-1}
            show={expanded.menu}
            title={i18n[lang].menu}
            icon="menu"
            addClass={css['menu-list--hover-green']}>
            {titles.map((title, index) => (
              <li key={index}>
                <MenuLink href={routes[index]} title={title} itemNumber={index + 1} />
              </li>
            ))}
          </MenuList>
          <MenuList
            id={MenuOptions.HELP}
            tabIndex={-1}
            show={expanded.help}
            title={i18n[lang].help}
            icon="help"
            addClass={css['menu-list--hover-yellow']}>
            <li>
              <TourButton />
            </li>
            <li>
              <button
                className={`${css['menu-list__button']} js-button-specifications`}
                onClick={() => toggleModal(MODAL.ESPECIFICATION)}>
                {i18n[lang].specifications}
              </button>
            </li>
          </MenuList>
        </MenuCover>
      )}

      <Modal isOpen={modal === MODAL.ESPECIFICATION} onClose={toggleModal} finalFocusRef=".js-button-specifications">
        <section className={`${css['modal__wrapper']} u-flow u-px-3 u-py-2`}>
          {lang === SPANISH_LANGUAGE ? (
            <>
              <h2 className={css['modal__title']}>ESPECIFICACIONES TÉCNICAS</h2>
              <article>
                <h3>Requisitos técnicos</h3>
                <ul>
                  <li>Conexión estable a internet superior o igual a 3G.</li>
                  <li>Software de asistencia recomendados: NVDA, JAWS, VoiceOver (macOs).</li>
                </ul>
              </article>
              <article>
                <h3>Requerimientos de hardware</h3>
                <ul>
                  <li>Memoria RAM mínima 4GB.</li>
                  <li>Dispositivo con conexión a internet.</li>
                  <li>
                    Monitor monocromático, pantalla plana SVGA, se recomienda una la resolución estándar WXGA o
                    superior.
                  </li>
                  <li>
                    Smarthphone con sistema operativo superior o igual a:
                    <ul>
                      <li>Android 5</li>
                      <li>IOS 12</li>
                    </ul>
                  </li>
                </ul>
              </article>
              <article>
                <h3>Versión de navegadores</h3>
                <ul>
                  <li>Google Chrome: Versión 126</li>
                  <li>Safarí: Versión 17.5</li>
                  <li>Mozilla Firefox: Versión 127</li>
                </ul>
              </article>
            </>
          ) : (
            <>
              <h2 className={css['modal__title']}>TECHNICAL SPECIFICATIONS</h2>
              <article>
                <h3>Technical Requirements</h3>
                <ul>
                  <li>Stable internet connection equal to or greater than 3G.</li>
                  <li>Recommended assistive software: NVDA, JAWS, VoiceOver (macOS).</li>
                </ul>
              </article>
              <article>
                <h3>Hardware Requirements</h3>
                <ul>
                  <li>Minimum 4GB RAM.</li>
                  <li>Device with internet connection.</li>
                  <li>Monochrome monitor, flat screen SVGA, standard WXGA resolution or higher is recommended.</li>
                  <li>
                    Smartphone with operating system equal to or greater than:
                    <ul>
                      <li>Android 5</li>
                      <li>iOS 12</li>
                    </ul>
                  </li>
                </ul>
              </article>
              <article>
                <h3>Browser Versions</h3>
                <ul>
                  <li>Google Chrome: Version 126</li>
                  <li>Safari: Version 17.5</li>
                  <li>Mozilla Firefox: Version 127</li>
                </ul>
              </article>
            </>
          )}
        </section>
      </Modal>
    </>
  );
};

const HamburguerButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <button
      className={css['hamburguer__button']}
      aria-controls="main-menu"
      aria-label="Menú principal"
      aria-expanded={isOpen}
      onClick={handleOpen}>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>
  );
};

const TourButton = () => {
  const { lang } = useOvaContext();
  const [openTour, setOpenTour] = useState<boolean>(false);

  const handleTour = () => {
    setOpenTour(!openTour);
  };

  const TOUR_STEPS = [
    {
      target: '.js-button-audio-a11y',
      content: i18nTour[lang].a11yAudio
    },
    {
      target: '.js-button-a11y',
      content: i18nTour[lang].a11y
    },
    {
      target: '.js-link-home',
      content: i18nTour[lang].home
    },
    {
      target: '.js-button-menu',
      content: i18nTour[lang].menu
    },
    {
      target: '.js-button-help',
      content: i18nTour[lang].help
    },
    {
      target: '.js-pagination-element',
      content: i18nTour[lang].navigation
    },
    {
      target: '.js-pagination-link-previous',
      content: i18nTour[lang].previous
    },
    {
      target: '.js-pagination-link-next',
      content: i18nTour[lang].next
    }
  ];

  return (
    <>
      <button className={`${css['menu-list__button']} js-button-tour`} onClick={handleTour}>
        Tour
      </button>

      <Tour steps={TOUR_STEPS} isOpen={openTour} onClose={handleTour} finalFocusRef=".js-button-tour">
        <Tour.Layer addClass={css['tour__layer']} />
        <Tour.Modal addClass={css['tour__element']} />
      </Tour>
    </>
  );
};
