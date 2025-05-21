import { useOvaContext } from '@/context/ova-context';

import { Icon } from '../icon';

import { i18n } from './consts';

import css from './fullscreen-alert.module.css';

interface Props {
  addClass?: string;
}

export const FullScreenAlert: React.FC<Props> = ({ addClass, ...props }) => {
  const { lang } = useOvaContext();

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`${css['alert']} ${addClass ?? ''}`}
      {...props}>
      <Icon addClass={css['alert__icon']} name="info" />
      <p>{i18n[lang].label}</p>
    </div>
  );
};
