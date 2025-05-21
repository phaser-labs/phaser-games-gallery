import { useEffect, useId, useState } from 'react';
import type { Key } from 'react-stately';
import { Item } from 'react-stately';
import type { SelectProps as SelectPropsUI } from 'books-ui';
import { Select } from 'books-ui';

import { useSelectGroupActivityContext } from './select-group-activity-context';

import css from './select-group.module.css';

type OptionType = {
  id: string;
  option: string;
};

interface Props extends SelectPropsUI {
  id?: string;
  addClass?: string;
  options: OptionType[];
  name: string;
  placeholder?: string;
}

export const SelectElement: React.FC<Props> = ({ id, addClass, options, placeholder = '', name, ...props }) => {
  const reactId = useId();
  const uid = id || reactId;

  const { addSelectedValues, selectedOptions, addSelectElementsId, validation, answers } =
    useSelectGroupActivityContext();
  const [currentSelectedOption, setCurrentSelectedOption] = useState<{ key: Key | null; state: string | null }>({
    key: null,
    state: null
  });

  /**
   * Maneja el evento onSelectionChange.
   * @param selectedOption - Opción seleccionada
   */
  const handleSelectionChange = (selectedOption: Key) => {
    addSelectedValues({ id: uid, answer: selectedOption as string });
    setCurrentSelectedOption({ key: selectedOption, state: null });
  };

  useEffect(() => {
    // Limpia el Select si todas las opciones seleccionadas son removidas
    if (selectedOptions.length === 0 && !!currentSelectedOption.key) {
      setCurrentSelectedOption({ key: null, state: null });
    }
  }, [selectedOptions, currentSelectedOption]);

  useEffect(() => {
    if (!currentSelectedOption.key && !validation) return;

    // Busca la opción correspondiente en las respuestas
    const matchingOption = answers.find(({ option }) => option.includes(currentSelectedOption.key as string));
    if (!matchingOption) return;

    // Actualiza el estado de la opción seleccionada con el estado encontrado
    setCurrentSelectedOption((prev) => ({ ...prev, state: matchingOption.state }));
  }, [answers, validation, currentSelectedOption.key]);

  useEffect(() => {
    addSelectElementsId(uid);
  }, [uid, addSelectElementsId]);

  return (
    <Select
      selectedKey={currentSelectedOption.key}
      addClass={`${css['select']} ${validation ? css[`select--${currentSelectedOption.state}`] : ''} ${addClass ?? ''}`}
      disabledKeys={selectedOptions}
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
