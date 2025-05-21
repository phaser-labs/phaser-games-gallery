import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { Tooltip, useMedia, usePanelContext as usePanel } from 'books-ui';
import { useInterpreter } from '@core/hooks/useInterpreter';
import { eventUpdateTitle } from '@core/utils/eventUpdateTitle';

import { useOvaContext } from '@/context/ova-context';

import { usePaginationRange } from './hooks/usePaginationRange';
import type { InterpreterSource } from './types/types';
import { i18n } from './consts';
import { usePanelCoreContext } from './panel-context';

import css from './panel.module.css';

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar el keyCode de las teclas left y right.
 */
const KEYCODE = Object.freeze({
  LEFT: 37,
  RIGHT: 39
});

export const PanelProgress = () => {
  const { lang } = useOvaContext();
  const { titles, interpreter } = usePanelCoreContext();
  const { validation, handleToggle, sectionsId, isOpen } = usePanel();
  const [updateVideoSources] = useInterpreter();

  const LAST_SECTION_INDEX = sectionsId.length - 1;
  const FIRST_SECTION_INDEX = 0;

  const refButtonList = useRef<HTMLUListElement>(null);
  const currentSection = useMemo(() => sectionsId.findIndex((uid) => uid === isOpen), [isOpen, sectionsId]);
  const sections = usePaginationRange({ count: sectionsId.length, currentPage: currentSection + 1 });

  const disabledTooltip = useMedia<boolean>(['(min-width: 768px)'], [false], true);

  /**
   * Objeto que almacena el valor de la sección a la cual el botón
   * tiene que redirigir dependiendo el tipo de este.
   */
  const BUTTON_TYPE = useMemo(() => {
    const previous = currentSection - 1;
    const next = currentSection + 1;

    return {
      previous: previous >= 0 ? previous : 0, // Asegurarse de que no sea negativo
      next: next < sectionsId.length ? next : sectionsId.length - 1 // Asegurarse de que no sea mayor que el máximo índice
    };
  }, [currentSection, sectionsId]);

  /**
   * Función utilizada en el evento KeyDown del botón,
   * permite decidir el focus del siguiente elemento
   * utilizando las teclas ArrowLeft o ArrowRight.
   *
   * @param {Event} event - Evento disparado por KeyDown
   */
  const handleKeyTrap = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!refButtonList.current) return;

    const sectionsElement: HTMLButtonElement[] = Array.from(
      refButtonList.current.querySelectorAll('button[role="tab"]')
    );

    if (sectionsElement.length === 0) return;

    // Obtenemos la primera sección.
    const FIRST_SECTION = sectionsElement[0];
    // Obtenemos la última sección.
    const LAST_SECTION = sectionsElement[sectionsElement.length - 1];

    // Si la tecla pulsada ArrowLeft
    if ((event.keyCode || event.which) === KEYCODE.LEFT) {
      if (event.target === FIRST_SECTION) {
        LAST_SECTION.focus();
      } else {
        const prevFocusButton = sectionsElement.indexOf(event.target as HTMLButtonElement) - 1;
        // Agregamos el focus al botón anterior
        sectionsElement[prevFocusButton].focus();
      }
    } else if ((event.keyCode || event.which) === KEYCODE.RIGHT) {
      // Si la tecla pulsada es ArrowRight
      if (event.target === LAST_SECTION) {
        FIRST_SECTION.focus();
      } else {
        const nextFocusButton = sectionsElement.indexOf(event.target as HTMLButtonElement) + 1;
        // Agregamos el focus al siguiente botón
        sectionsElement[nextFocusButton].focus();
      }
    }
  };

  /**
   * Maneja el evento onClick para mostrar la sección correspondiente.
   *
   * @param {string} section - Identificador de la sección que se desea mostrar.
   */
  const handleClick = (section: string) => {
    // Manejar el cambio de sección
    handleToggle(section);
    handleInterpreterSectionChange(section);
    handleSectionTitleChange(section);
  };

  /**
   * Maneja la actualización de los videos del intérprete según la sección seleccionada.
   *
   * @param section - La sección seleccionada.
   */
  const handleInterpreterSectionChange = (sectionId: string) => {
    if (interpreter.length === 0) return;

    // Encontrar las fuentes de video del intérprete correspondientes a la sección actual
    const currentInterpreterVideoSources = interpreter.find(({ uid }) => uid === sectionId) as InterpreterSource;

    if (currentInterpreterVideoSources) {
      const { a11yURL, contentURL } = currentInterpreterVideoSources;
      updateVideoSources({ mode: 'fixed', a11yURL, contentURL });
    }
  };

  /**
   * Encuentra el índice de la sección actual en el array sectionsId
   * y devuelve el título correspondiente si existe.
   *
   * @param sectionId - La sección seleccionada.
   * @returns El título de la sección o null si no se encuentra.
   */
  const getSectionTitle = (sectionId: string): string | null => {
    const currentSectionIndex = sectionsId.findIndex((uid) => uid === sectionId);
    if (currentSectionIndex !== -1) {
      const currentSectionTitle = titles[currentSectionIndex];
      return currentSectionTitle ?? null;
    }
    return null;
  };

  /**
   * Maneja la actualización del título según la sección seleccionada.
   *
   * @param sectionId - La sección seleccionada.
   */
  const handleSectionTitleChange = (sectionId: string) => {
    if (titles.length === 0) return;

    const currentSectionTitle = getSectionTitle(sectionId);
    if (currentSectionTitle) eventUpdateTitle(currentSectionTitle);
  };

  useEffect(() => {
    handleInterpreterSectionChange(isOpen!);
  }, [interpreter]);

  return (
    <div className={`${css['progress']} u-wrapper u-mt-.5 u-pb-3`}>
      <h2 id="panel-progress-navigation" className="u-sr-only">
        {i18n[lang].role}
      </h2>
      <p className="u-sr-only" aria-atomic="true" aria-live="polite">
        {i18n[lang].a11y} {currentSection + 1} {i18n[lang].sectionBy} {sectionsId.length}
      </p>
      <p aria-hidden="true">
        {i18n[lang].section} {currentSection + 1} de {sectionsId.length}
      </p>
      <ul
        ref={refButtonList}
        className={css['progress__list']}
        role="tablist"
        aria-labelledby="panel-progress-navigation"
        aria-orientation="horizontal">
        <li role="presentation">
          <button
            onClick={() => handleClick(sectionsId[BUTTON_TYPE.previous])}
            className={`${css['progress__button']} ${css['progress__button--prev']}`}
            aria-label={i18n[lang].ariaPrev}
            disabled={currentSection <= FIRST_SECTION_INDEX}>
            {i18n[lang].previous}
          </button>
        </li>
        {sections.map((uid) => (
          <PanelProgressItem
            key={`section-${uid}`}
            uid={sectionsId[uid - 1]}
            section={uid}
            beforeToActive={uid - 1 < currentSection + 1}
            isSelected={validation(sectionsId[uid - 1])}
            handleNavigation={handleClick}
            handleKeyDown={handleKeyTrap}
            disabledTooltip={disabledTooltip}
          />
        ))}
        <li role="presentation">
          <button
            onClick={() => handleClick(sectionsId[BUTTON_TYPE.next])}
            className={`${css['progress__button']} ${css['progress__button--next']}`}
            aria-label={i18n[lang].ariaNext}
            disabled={currentSection >= (LAST_SECTION_INDEX || 0)}>
            {i18n[lang].next}
          </button>
        </li>
      </ul>
    </div>
  );
};

interface PanelProgresItemProps {
  uid: string;
  section: number;
  isSelected: boolean;
  beforeToActive: boolean;
  disabledTooltip: boolean;
  handleNavigation: (uid: string) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const PanelProgressItem = forwardRef<HTMLButtonElement, PanelProgresItemProps>(function PanelProgressItem(
  { uid, section, isSelected, beforeToActive, handleKeyDown, handleNavigation, disabledTooltip },
  ref: React.Ref<HTMLButtonElement>
) {
  const { lang } = useOvaContext();
  const { titles } = usePanelCoreContext();
  const { sectionsId } = usePanel();

  const currentTitle = useMemo(() => {
    if (titles.length === 0) {
      return `${document.title} - ${i18n[lang].section} ${section} ${i18n[lang].sectionBy} ${sectionsId.length} `;
    }

    return titles[section - 1];
  }, [titles, section, sectionsId, lang]);

  return (
    <li role="presentation" className={css['progress__item']}>
      <Tooltip
        label={currentTitle}
        placement="bottom"
        hasArrow
        distance={15}
        isDisabled={disabledTooltip}
        addClass={css['footer__nav-tooltip']}>
        <button
          ref={ref}
          role="tab"
          className={`${css['progress__item-button']} ${beforeToActive ? css['progress__item-button--active'] : ''}`}
          tabIndex={isSelected ? 0 : -1}
          aria-selected={isSelected}
          onClick={() => handleNavigation(uid)}
          onKeyDown={handleKeyDown}
          aria-label={`Sección ${section}`}>
          <svg width="0" height="0" viewBox="0 0 100 100">
            <defs>
              <clipPath id="clipPath" clipPathUnits="objectBoundingBox">
                <path d="M 0.2,0.088 Q 0.936,0.392 0.938,0.518 Q 0.934,0.642 0.216,0.908 Q 0.076,0.99 0.074,0.826 L 0.076,0.152 Q 0.072,0.01 0.2,0.088 Z"></path>
              </clipPath>
            </defs>
          </svg>
        </button>
      </Tooltip>
    </li>
  );
});
