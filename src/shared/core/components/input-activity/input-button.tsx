import { cloneElement } from 'react';

import { useInputActivityContext } from './input-activity-context';

interface Props {
  type?: 'reset';
  children: React.ReactElement;
}

export const InputButton: React.FC<Props> = ({ type, children }) => {
  const { handleValidation, handleReset, button, validation, result } = useInputActivityContext();

  return cloneElement(children, {
    ...children.props,
    disabled: type !== 'reset' ? button : validation ? result : true,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (children.props.onClick) {
        children.props.onClick(event);
      }
      (type === 'reset' ? handleReset : handleValidation)();
    }
  });
};
