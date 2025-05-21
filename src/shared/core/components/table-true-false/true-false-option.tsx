import { useId } from 'react';

import { loadCSS } from '../../utils/loadCSS';

import { useTableTrueFalseContext } from './table-true-false-context';

const css = await loadCSS({
  ui: 'table-true-false/table-true-false.module.css',
  local: 'table-true-false/table-true-false.module.css'
});

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  addClass?: string;
  label: string;
  correct: boolean;
}

export const TrueFalseOption: React.FC<Props> = ({ id, addClass, correct, label, ...props }) => {
  const reactId = useId();
  const uid = id || reactId;

  const { addOptionValues, validation, selectedIds } = useTableTrueFalseContext();

  /**
   * Devuelve el nombre de la clase para el botón verdadero o falso basado en la respuesta seleccionada
   * y el estado de validación de la actividad.
   * @param {boolean} answer - la respuesta seleccionada.
   * @returns {string} la clase del botón.
   */
  const getClassname = (answer: boolean) => {
    let className = css.button;

    if (validation) {
      if (selectedIds[id] === answer) {
        className += correct === answer ? ` ${css.correct}` : ` ${css.incorrect}`;
      }
    }

    return className.trim();
  };

  return (
    <div className={`${css.optionContainer} ${addClass ?? ''}`}>
      <div className={`${css.question} u-flow`}>
        <p className={`${css.list} u-text-justify`}>
          <span>{id}.</span>
          {label}
        </p>
      </div>
      <div className={css.buttons} role="radiogroup" aria-labelledby={`question-${uid}`}>
        <div className={`${validation ? css.disabled : ''}`}>
          <input
            type="radio"
            id={`${uid}-true`}
            name={`option-${id}`}
            className={css.radioButton}
            disabled={validation}
            checked={selectedIds[id] === true}
            onChange={() => addOptionValues(id, true)}
            {...props}
          />
          <label htmlFor={`${uid}-true`} className={getClassname(true)}>
            Verdadero
          </label>
        </div>
        <div className={`${validation ? css.disabled : ''}`}>
          <input
            type="radio"
            id={`${uid}-false`}
            name={`option-${id}`}
            className={css.radioButton}
            checked={selectedIds[id] === false}
            onChange={() => addOptionValues(id, false)}
            {...props}
          />
          <label htmlFor={`${uid}-false`} className={getClassname(false)}>
            Falso
          </label>
        </div>
      </div>
    </div>
  );
};
