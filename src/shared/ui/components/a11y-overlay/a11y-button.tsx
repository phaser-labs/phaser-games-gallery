import { Icon } from '@core/components/icon';

import css from './a11y-overlay.module.css';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPressed?: boolean;
  icon: string;
  label: string;
}

export const A11yButtton: React.FC<Props> = ({ isPressed, icon, label, ...props }) => {
  return (
    <button className={css['a11y-button']} aria-pressed={isPressed} aria-label={label} {...props}>
      <Icon addClass={css['a11y-checked']} name="check-circle" />
      <Icon name={icon} />
      <span>{label}</span>
    </button>
  );
};
