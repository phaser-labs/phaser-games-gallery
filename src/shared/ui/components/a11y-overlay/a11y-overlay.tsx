import { useId, useRef } from 'react';
import { Accordion, Filter, Kbd } from 'books-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@core/components/icon';
import { useKeyboardShortcuts } from '@core/hooks/useKeyboardShortcuts';

import { useOvaContext } from '@/context/ova-context';

import { useA11y } from './hooks/useA11y';
import { useModal } from './hooks/useModal';
import type { BasicValuesType, ContrastValues } from './types/types';
import { ConfigA11yProperty } from './types/types';
import { A11yButtton } from './a11y-button';
import { A11yCard } from './a11y-card';
import { BASIC_VALUES, CONTRAST, i18n } from './consts';

import css from './a11y-overlay.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const variants = {
  hidden: { opacity: 0, x: -600 },
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
    x: -600,
    transition: {
      ease: 'easeInOut',
      duration: 0.2
    }
  }
};

export const A11yOverlay: React.FC<Props> = ({ isOpen, onClose }) => {
  const { lang } = useOvaContext();
  const refModal = useRef<HTMLDivElement>(null);
  const uid = useId();

  const { config, setConfig } = useA11y();
  const { handleKeyDown } = useModal({ ref: refModal, isOpen, onClose });

  /**
   * Maneja los keyboardShortcuts de l página.
   */
  useKeyboardShortcuts(config.keyboardShortcuts);

  /**
   *  Función para establecer los diferentes contrastes.
   * @param ContrastValues value
   */
  const setContrast = (value: ContrastValues) => () => {
    setConfig(ConfigA11yProperty.Contrast, value);
  };

  /**
   *  Función para establecer los tamaños de fuentes.
   * @param BasicValuesType value
   */
  const setFontSize = (value: BasicValuesType) => () => {
    setConfig(ConfigA11yProperty.FontSize, value);
  };

  /**
   *  Función para establecer los tamaños de linea.
   * @param BasicValuesType value
   */
  const setLineHeight = (value: BasicValuesType) => () => {
    setConfig(ConfigA11yProperty.LineHeight, value);
  };

  /**
   *  Función para establecer el espaciado de letras.
   * @param BasicValuesType value
   */
  const setLetterSpacing = (value: BasicValuesType) => () => {
    setConfig(ConfigA11yProperty.LetterSpacing, value);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            ref={refModal}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            onKeyDown={handleKeyDown}
            aria-labelledby={`a11y-overlay-${uid}`}
            className={css['modal']}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit">
            <div className={css['modal__header']}>
              <h2 id={`a11y-overlay-${uid}`} className={`u-sr-only ${css['sr-only-title']}`}>
                {i18n[lang].titleA11y}
              </h2>
              <h2 aria-labelledby={`a11y-overlay-${uid}`} aria-hidden="true" className={css['modal__title']}>
                {i18n[lang].title}
                <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>A</Kbd>
              </h2>

              <button aria-label={i18n[lang].btnModal} className={css['modal__button']} onClick={onClose}>
                <Icon name="close" />
              </button>
            </div>

            <div className={css['modal__main']}>
              <A11yButtton
                label={i18n[lang].darkMode}
                icon="dark-mode"
                isPressed={config.darkMode}
                onClick={() => setConfig(ConfigA11yProperty.DarkMode)}
              />
              <A11yButtton
                label={i18n[lang].stopAnimations}
                icon="stop-animations"
                isPressed={config.stopAnimations}
                onClick={() => setConfig(ConfigA11yProperty.StopAnimations)}
              />
              <Accordion allowMultiple>
                <Accordion.Item addClass={css['accordion']}>
                  <Accordion.Button
                    addClass={css['accordion__button']}
                    expandedIcon={<Icon name="square-expand" />}
                    closedIcon={<Icon name="square-close-expanded" />}>
                    {i18n[lang].KBSC}
                  </Accordion.Button>

                  <Accordion.Panel addClass={css['accordion__panel']}>
                    <A11yCard icon="keyboard" title={i18n[lang].KBSCTitle} main={i18n[lang].KBSCMain} />

                    <ul className={`${css['shortcuts']} u-flow`}>
                      <li className={css['shortcuts__card']}>
                        <div className={css['shortcuts__card-content']}>
                          <p>{i18n[lang].KBSCNextPage}</p>
                          <p>
                            <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>D</Kbd>
                          </p>
                        </div>
                      </li>

                      <li className={css['shortcuts__card']}>
                        <div className={css['shortcuts__card-content']}>
                          <p>{i18n[lang].KBSCPrevPage}</p>
                          <p>
                            <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>S</Kbd>
                          </p>
                        </div>
                      </li>

                      <li className={css['shortcuts__card']}>
                        <div className={css['shortcuts__card-content']}>
                          <p>{i18n[lang].KBSCHome}</p>
                          <p>
                            <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>C</Kbd>
                          </p>
                        </div>
                      </li>

                      <li className={css['shortcuts__card']}>
                        <div className={css['shortcuts__card-content']}>
                          <p>{i18n[lang].KBSCA11y}</p>
                          <p>
                            <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>A</Kbd>
                          </p>
                        </div>
                      </li>

                      <li className={css['shortcuts__card']}>
                        <div className={css['shortcuts__card-content']}>
                          <p>{i18n[lang].KBSCHelp}</p>
                          <p>
                            <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>H</Kbd>
                          </p>
                        </div>
                      </li>
                    </ul>

                    <A11yButtton
                      label={i18n[lang].KBSCBtn}
                      icon="keyboard"
                      isPressed={config.keyboardShortcuts}
                      onClick={() => setConfig(ConfigA11yProperty.KeyboardShortcuts)}
                    />
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item addClass={css['accordion']}>
                  <Accordion.Button
                    addClass={css['accordion__button']}
                    expandedIcon={<Icon name="square-expand" />}
                    closedIcon={<Icon name="square-close-expanded" />}>
                    {i18n[lang].contrast}
                  </Accordion.Button>

                  <Accordion.Panel addClass={css['accordion__panel']}>
                    <A11yCard icon="contrast" title={i18n[lang].contrastTitle} main={i18n[lang].contrastMain} />
                    <ul className={css['button-list']}>
                      <li>
                        <A11yButtton
                          label={i18n[lang].grayScale}
                          icon="monochrome"
                          isPressed={config.contrast === CONTRAST.grayScale}
                          onClick={setContrast(CONTRAST.grayScale)}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].highContrast}
                          icon="high-contrast"
                          isPressed={config.contrast === CONTRAST.highContrast}
                          onClick={setContrast(CONTRAST.highContrast)}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].invertColors}
                          icon="invert-colors"
                          isPressed={config.contrast === CONTRAST.invertColors}
                          onClick={setContrast(CONTRAST.invertColors)}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].yellowOnBlack}
                          icon="filter"
                          isPressed={config.contrast === CONTRAST.yellowOnBlack}
                          onClick={setContrast(CONTRAST.yellowOnBlack)}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].whiteOnRed}
                          icon="filter"
                          isPressed={config.contrast === CONTRAST.whiteOnRed}
                          onClick={setContrast(CONTRAST.whiteOnRed)}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].greenOnBlue}
                          icon="filter"
                          isPressed={config.contrast === CONTRAST.greenOnBlue}
                          onClick={setContrast(CONTRAST.greenOnBlue)}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].yellowOnBlue}
                          icon="filter"
                          isPressed={config.contrast === CONTRAST.yellowOnBlue}
                          onClick={setContrast(CONTRAST.yellowOnBlue)}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].whiteOnBlack}
                          icon="filter"
                          isPressed={config.contrast === CONTRAST.whiteOnBlack}
                          onClick={setContrast(CONTRAST.whiteOnBlack)}
                        />
                      </li>
                    </ul>
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item addClass={css['accordion']}>
                  <Accordion.Button
                    addClass={css['accordion__button']}
                    expandedIcon={<Icon name="square-expand" />}
                    closedIcon={<Icon name="square-close-expanded" />}>
                    {i18n[lang].fontSize}
                  </Accordion.Button>
                  <Accordion.Panel addClass={css['accordion__panel']}>
                    <A11yCard icon="font-size" title={i18n[lang].fontSizeTitle} main={i18n[lang].fontSizeMain} />
                    <ul className={css['button-list']}>
                      <li>
                        <A11yButtton
                          label={i18n[lang].fontSizeSmall}
                          icon="font-perfect"
                          isPressed={config.fontSize === BASIC_VALUES['1']}
                          onClick={setFontSize(BASIC_VALUES['1'])}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].fontSizeMid}
                          icon="font-increase"
                          isPressed={config.fontSize === BASIC_VALUES['2']}
                          onClick={setFontSize(BASIC_VALUES['2'])}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].fontSizeBig}
                          icon="font-big"
                          isPressed={config.fontSize === BASIC_VALUES['3']}
                          onClick={setFontSize(BASIC_VALUES['3'])}
                        />
                      </li>
                    </ul>
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item addClass={css['accordion']}>
                  <Accordion.Button
                    addClass={css['accordion__button']}
                    expandedIcon={<Icon name="square-expand" />}
                    closedIcon={<Icon name="square-close-expanded" />}>
                    {i18n[lang].lineHeight}
                  </Accordion.Button>
                  <Accordion.Panel addClass={css['accordion__panel']}>
                    <A11yCard icon="line-height" title={i18n[lang].lineHeightTitle} main={i18n[lang].lineHeightMain} />
                    <ul className={css['button-list']}>
                      <li>
                        <A11yButtton
                          label={i18n[lang].lineHeightSmall}
                          icon="line-height-15"
                          isPressed={config.lineHeight === BASIC_VALUES['1']}
                          onClick={setLineHeight(BASIC_VALUES['1'])}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].lineHeightMid}
                          icon="line-height-175"
                          isPressed={config.lineHeight === BASIC_VALUES['2']}
                          onClick={setLineHeight(BASIC_VALUES['2'])}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].lineHeightBig}
                          icon="line-height-2"
                          isPressed={config.lineHeight === BASIC_VALUES['3']}
                          onClick={setLineHeight(BASIC_VALUES['3'])}
                        />
                      </li>
                    </ul>
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item addClass={css['accordion']}>
                  <Accordion.Button
                    addClass={css['accordion__button']}
                    expandedIcon={<Icon name="square-expand" />}
                    closedIcon={<Icon name="square-close-expanded" />}>
                    {i18n[lang].letterSpacing}
                  </Accordion.Button>
                  <Accordion.Panel addClass={css['accordion__panel']}>
                    <A11yCard
                      icon="letter-spacing"
                      title={i18n[lang].letterSpacingTitle}
                      main={i18n[lang].letterSpacingMain}
                    />
                    <ul className={css['button-list']}>
                      <li>
                        <A11yButtton
                          label={i18n[lang].letterSpacingSmall}
                          icon="letter-spacing-small"
                          isPressed={config.letterSpacing === BASIC_VALUES['1']}
                          onClick={setLetterSpacing(BASIC_VALUES['1'])}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].letterSpacingMid}
                          icon="letter-spacing-mid"
                          isPressed={config.letterSpacing === BASIC_VALUES['2']}
                          onClick={setLetterSpacing(BASIC_VALUES['2'])}
                        />
                      </li>
                      <li>
                        <A11yButtton
                          label={i18n[lang].letterSpacingBig}
                          icon="letter-spacing-big"
                          isPressed={config.letterSpacing === BASIC_VALUES['3']}
                          onClick={setLetterSpacing(BASIC_VALUES['3'])}
                        />
                      </li>
                    </ul>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <Filter />
    </>
  );
};
