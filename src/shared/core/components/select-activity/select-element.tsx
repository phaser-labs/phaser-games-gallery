import { useEffect, useId, useMemo, useState } from 'react';
import type { Key } from 'react-stately';
import { Item } from 'react-stately';
import type { SelectProps as SelectPropsUI } from 'books-ui';
import { Select } from 'books-ui';

import { loadCSS } from '../../utils/loadCSS';

import { States } from './types/types';
import { useSelectActivityContext } from './select-activity-context';

const css = await loadCSS({
  ui: 'select-activity/select.module.css',
  local: 'select-activity/select.module.css'
});

type OptionType = {
  id: string;
  option: string;
};

interface Props extends SelectPropsUI {
  id?: string;
  addClass?: string;
  correctAnswer: string | string[];
  options: OptionType[];
  name: string;
  placeholder?: string;
}

export const SelectElement: React.FC<Props> = ({
  id,
  correctAnswer,
  addClass,
  options,
  placeholder = '',
  name,
  ...props
}) => {
  const reactId = useId();
  const uid = id || reactId;

  const { addSelectedValues, selectedOptions, addSelectElementsId, validation } = useSelectActivityContext();
  const [currentSelectedOption, setCurrentSelectedOption] = useState<{ key: Key | null; state: string | null }>({
    key: null,
    state: null
  });

  /**
   * Maneja el evento onSelectionChange.
   * @param selectedOption - Opción seleccionada
   */
  const handleSelectionChange = (selectedOption: Key) => {
    // Asegurar que `correctAnswer` siempre sea un array
    const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

    const selectionState = correctAnswers.includes(selectedOption as string) ? States.SUCCESS : States.WRONG;

    addSelectedValues({ id: uid, answer: selectedOption as string, state: selectionState });
    setCurrentSelectedOption({ key: selectedOption, state: selectionState });
  };

  /**
   * Genera la lista de opciones seleccionadas
   * para deshabilitarlas.
   */
  const disabledKeys = useMemo(() => {
    if (selectedOptions.length === 0) return [];
    return selectedOptions.map(({ answer }) => answer);
  }, [selectedOptions]);

  useEffect(() => {
    // Limpia el Select si todas las opciones seleccionadas son removidas
    if (selectedOptions.length === 0 && !!currentSelectedOption.key) {
      setCurrentSelectedOption({ key: null, state: null });
    }
  }, [selectedOptions, currentSelectedOption]);

  useEffect(() => {
    addSelectElementsId(uid);
  }, [uid, addSelectElementsId]);

  return (
    <Select
      selectedKey={currentSelectedOption.key}
      addClass={`${css['select']} ${validation ? css[`select--${currentSelectedOption.state}`] : ''} ${addClass ?? ''}`}
      disabledKeys={disabledKeys}
      isDisabled={validation}
      onSelectionChange={handleSelectionChange}
      placeholder={placeholder}
      name={name}
      {...props}>
      {options.map(({ id, option }) => (
        <Item key={id}>
          <span id={name} dangerouslySetInnerHTML={{ __html: option }}></span>
        </Item>
      ))}
    </Select>
  );
};
