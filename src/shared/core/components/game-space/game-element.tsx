import { useId, useRef, useState } from 'react';
import { Row } from 'books-ui';

import { FullScreenAlert, FullScreenButton, MathContainer, ModalFeedback } from '@/shared/core/components';
import { Button } from '@/shared/ui/components';

import { useA11yAttribute } from '../../hooks/useA11yAttribute';
import { useReduceMotion } from '../../hooks/useReduceMotion';

import { UNIVERSE01, UNIVERSE02 } from './data/data';
import { Modal as ModalType, Option as optionType } from './types/types';
import { SpaceButton } from './game-button';
import { useGameSpaceContext } from './game-space-context';

import css from './game-space.module.css';

// Define los tipos de modales disponibles
const MODALS = {
  TRUE: 'modal-correct-activity',
  FALSE: 'modal-wrong-activity'
};

interface OptionProps {
  addClass?: string;
  options: optionType[];
  modal: ModalType;
  question: string | JSX.Element;
  title: string;
  alt: string;
  universeType?: number;
}

export const RadioSpace: React.FC<OptionProps> = ({
  options,
  question,
  universeType = 2,
  addClass,
  title,
  alt,
  modal,
  ...props
}) => {
  const { selectedId, addOptionElementsId, validation } = useGameSpaceContext();
  const [isOpen, setIsOpen] = useState<string | null>(null);

  const { stopAnimations } = useA11yAttribute(); // Obtener el estado de la propiedad de accesibilidad 'stopAnimations'
  const cancelAnimation = useReduceMotion(); // Obtener el estado de la propiedad de reducir la animación
  const reactId = useId();

  const uid = reactId; // ID del componente
  const universeData = universeType === 1 ? UNIVERSE01 : UNIVERSE02; // Obtener los datos del universo
  const background = universeData.find((item) => item.background)?.background; // Encontrar el fondo correspondiente

  const refAsteroid = useRef<HTMLImageElement>(null);

  /**
   * Maneja el movimiento del asteroide basado en la posición del mouse.
   * @param {React.MouseEvent} e - El evento del mouse.
   */
  const handleAsteroidMove: React.MouseEventHandler = (e) => {
    if (!cancelAnimation && !stopAnimations) {
      const offsetY = (window.innerHeight / 2 - e.nativeEvent.clientY) / 50;

      if (refAsteroid.current) refAsteroid.current.style.bottom = `${Math.min(Math.max(-50, offsetY), 50)}px`;
    } else {
      if (refAsteroid.current) refAsteroid.current.style.bottom = ' 0';
    }
  };

  /**
   * Maneja el cambio de opción en el input de tipo radio.
   * @param {React.ChangeEvent<HTMLInputElement>} event - El evento de cambio.
   */
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addOptionElementsId(event.target.id);
  };

  /**
   * Maneja la validación de la opción seleccionada.
   */
  const handleValidation = () => {
    const selectedOption = options.find((option) => option.id === selectedId);
    setIsOpen(selectedOption?.state === 'success' ? MODALS.TRUE : MODALS.FALSE);
  };

  /**
   * Obtiene la clase CSS para un botón según su estado y si está seleccionado.
   * @returns {string} La clase CSS correspondiente
   */
  const getSelectedOptionClass = () => {
    if (!validation) return '';
    const selectedOption = options.find((option) => option.id === selectedId);
    return selectedOption?.state === 'success' ? css['correct'] : css['incorrect'];
  };

  // Cierre del modal
  const closeModal = () => setIsOpen(null);

  // Genera un id único para el elemento de pantalla completa basado en react Id.
  const uniqueElementId = `game-space-${uid}`;

  return (
    <>
      <div className={` u-flow ${addClass ?? ''}`} {...props} role="group">
        <FullScreenAlert />
        <div
          className={`${css['space-container']}`}
          style={{ backgroundImage: `url(${background})` }}
          onMouseMove={handleAsteroidMove}
          id={uniqueElementId}>
          {universeData.map((item, index) => {
            const [key, value] = Object.entries(item)[0];
            if (key === 'background') return null;
            return <img key={index} src={value} alt={key} className={`${css[key]}`} />;
          })}
          <img
            src="assets/svgs/asteroid.svg"
            alt="Asteroide"
            className={` ${css['image_depth']}`}
            ref={refAsteroid}
            aria-hidden="true"
          />
          <img src="assets/svgs/Astronauta.svg" alt="Astronauta" className={` ${css['astronaut']}`} />
          <FullScreenButton elementId={uniqueElementId} addClass={css.fullScreen__button} />
          <div className={`${css['wrapper-container']}`}>
            <div className={`${css['question']}`} role="heading" aria-level={2}>
              <img src="assets/svgs/icon.svg" className={css['icon']} aria-hidden="true" />
              <h2>{question}</h2>
              <img src="assets/svgs/icon.svg" className={`${css['icon']} ${css['icon-reverse']}`} aria-hidden="true" />
            </div>
            {options.map((option) => (
              <label
                key={option.id}
                className={`${css['option']} ${selectedId === option.id ? css['selected'] : ''} ${selectedId === option.id ? getSelectedOptionClass() : ''}`}
                htmlFor={option.id}>
                <input
                  type="radio"
                  name={`radio-group-${uid}`}
                  id={option.id}
                  checked={selectedId === option.id}
                  disabled={validation}
                  onChange={handleOptionChange}
                  aria-checked={selectedId === option.id}
                />
                <span dangerouslySetInnerHTML={{ __html: option.name }} />
                {option.formula && <MathContainer className="u-fs-400">{`${option.formula}`}</MathContainer>}
              </label>
            ))}
          </div>
        </div>
        <p className="u-text-center">
          <strong>{title}</strong>&nbsp;{alt}
        </p>
        <Row justifyContent="center" alignItems="center">
          <SpaceButton>
            <Button label="Comprobar" onClick={handleValidation} />
          </SpaceButton>

          <SpaceButton type="reset">
            <Button label="Reintentar" addClass="js-modal-wrong" />
          </SpaceButton>
        </Row>
      </div>
      <ModalFeedback
        type="success"
        isOpen={isOpen === MODALS.TRUE}
        onClose={closeModal}
        finalFocusRef="#main"
        audio={modal.audio_success}
        interpreter={{
          contentURL: modal.contentURL_success
        }}>
        <p>{modal.text_success}</p>
      </ModalFeedback>

      <ModalFeedback
        type="wrong"
        isOpen={isOpen === MODALS.FALSE}
        onClose={closeModal}
        finalFocusRef=".js-modal-wrong"
        audio={modal.audio_wrong}
        interpreter={{
          contentURL: modal.contentURL_wrong
        }}>
        <p>{modal.text_wrong}</p>
      </ModalFeedback>
    </>
  );
};
