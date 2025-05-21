import { focusMainElement } from '@core/utils/focusMain';

import { useOvaContext } from '@/context/ova-context';

import { i18n, KEYCODE } from './consts';

import css from './header.module.css';

export const SkipToMain = () => {
  const { lang } = useOvaContext();

  const handleNullSpaceKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.keyCode === KEYCODE.SPACE) {
      event.preventDefault();
    }
  };

  return (
    <button
      role="link"
      tabIndex={1}
      className={css['skip-link']}
      onKeyUp={handleNullSpaceKey}
      onClick={focusMainElement}>
      {i18n[lang].skipToMain}
    </button>
  );
};
