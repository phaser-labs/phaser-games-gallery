import { useEffect, useId } from 'react';
import { Radio } from 'books-ui';

import { loadCSS } from '../../utils/loadCSS';

import type { RadioStates } from './types/types';
import { useRadioActivityContext } from './radio-activity-context';

const css = await loadCSS({
  ui: 'radio-activity/radio-activity.module.css',
  local: 'radio-activity/radio-activity.module.css'
});

const STATES: Partial<Record<RadioStates, 'wrong' | 'right'>> = {
  wrong: 'wrong',
  success: 'right'
};

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  addClass?: string;
  label: string;
  state: RadioStates;
}

export const RadioElement: React.FC<Props> = ({ id, addClass, state, label, name, ...props }) => {
  const reactId = useId();
  const { addRadiosValues, addRadioElementsId, validation } = useRadioActivityContext();

  const uid = id || reactId;
  const radioName = `radio-group-name-${name}`;

  /**
   * Maneja el evento onChange.
   */
  const handleChange = () => {
    addRadiosValues({ id: uid, name: radioName, state });
  };

  useEffect(() => {
    addRadioElementsId(uid);
  }, [uid, addRadioElementsId]);

  return (
    <Radio
      id={uid}
      label={label}
      addClass={`${css['radio']} ${addClass ?? ''}`}
      onChange={handleChange}
      disabled={validation}
      name={radioName}
      {...(validation && { state: STATES[state] })}
      {...props}
    />
  );
};
