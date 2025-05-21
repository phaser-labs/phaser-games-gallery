import { Children, cloneElement } from 'react';
import { useDragAndDropContext } from 'books-ui';
import { focusMainElement } from '@core/utils/focusMain';

import { useDndActivityContext } from './dnd-context';

interface Props {
  type?: 'reset';
  children: React.ReactElement;
}

export const DndButton: React.FC<Props> = ({ type, children }) => {
  const { handleValidation, handleReset, button, validation, result } = useDndActivityContext();
  const { handleResetDnd } = useDragAndDropContext();

  const handleResetDndActivity = () => {
    handleReset();
    handleResetDnd();
    focusMainElement();
  }

  return Children.map(children, (child) =>
    cloneElement(child, {
      ...child.props,
      disabled: type !== 'reset' ? button : validation ? result : true,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        if (child.props.onClick) {
          child.props.onClick(event);
        }
       ( type === 'reset' ? handleResetDndActivity : handleValidation)();
      }
    })
  );
};
