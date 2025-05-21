import { useHashLocation } from 'wouter/use-hash-location';
import { Icon } from '@core/components/icon';

import { useOvaContext } from '@/context/ova-context';

import { useA11y } from '../a11y-overlay/hooks/useA11y';
import { ConfigA11yProperty } from '../a11y-overlay/types/types';

import { MenuOptions } from './types/types';
import { HOME_PATH, i18n } from './consts';
import { useHeaderContext } from './header-context';

import css from './header.module.css';

export const MenuA11y = () => {
  const { lang } = useOvaContext();
  const { expanded, handleExpanded } = useHeaderContext();
  const { config, setConfig } = useA11y();
  const [location] = useHashLocation();

  const toggleAudioA11y = () => {
    setConfig(ConfigA11yProperty.Audio);
  };

  return (
    <ul
      className={`${css['menu-a11y']} u-px-.5 `}
      data-home={location === HOME_PATH}
      data-expanded={expanded.help || expanded.menu}>
      <li>
        <button
          tabIndex={5}
          aria-pressed={config.audio}
          aria-label={config.audio ? i18n[lang].audioActive : i18n[lang].audioPause}
          className={`${css['menu-a11y__button']} js-button-audio-a11y`}
          onClick={toggleAudioA11y}>
          <Icon name={config.audio ? 'pause' : 'play'} />{' '}
          <span>{config.audio ? i18n[lang].audioActive : i18n[lang].audioPause}</span>
        </button>
      </li>

      <li className={css['list__item']} hidden={location === HOME_PATH}>
        <button
          tabIndex={6}
          aria-label={i18n[lang].a11y}
          aria-pressed={expanded.a11y}
          className={`${css['menu-a11y__button']} js-button-a11y`}
          onClick={() => handleExpanded(MenuOptions.A11Y)}>
          <Icon name="a11y" /> <span>{i18n[lang].a11y}</span>
        </button>
      </li>
    </ul>
  );
};
