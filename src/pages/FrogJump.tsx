import { useEffect, useState } from 'react';
import { Audio, Col, Row } from 'books-ui';

import { BtnBack } from '@/components/btnBack';
import FrogJumping from '@/games/game-jump-frog/FrogJumping';
import { ModalFeedback } from '@/shared/core/components';

import 'books-ui/styles';

import { dataGameFrog } from '../data/data-game-frog';



const MODALS = {
  SUCCESS: 'modal-correct-activity',
  WRONG: 'modal-wrong-activity'
};

export const FrogJump = () => {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const [currentQuestion, setcurrentQuestion] = useState(1);
  // const [result, setResult] = useState<boolean | null>(null);
  useEffect(() => {
    const handleCurrentQuestion = (event: Event) => {
      const customEvent = event as CustomEvent;
      setcurrentQuestion(customEvent.detail);

      // Puedes actualizar estados, puntaje, mostrar feedback, etc.
    };
    const handleCurrentResult = (event: Event) => {
      const customEvent = event as CustomEvent;
      handleOpenModal(customEvent.detail);
      // setResult();
    };
    window.addEventListener('informationQuestion', handleCurrentQuestion);
    window.addEventListener('informationResult', handleCurrentResult);

    return () => {
      window.removeEventListener('informationQuestion', handleCurrentQuestion);
      window.removeEventListener('informationResult', handleCurrentResult);
    };
  });

  // Controlamos los modales de la actividad.

  /**
   * Función que se encarga de validar
   * el valor proporcionado por Selects.
   * @param {object[]} result
   */
  const handleOpenModal = (result?: boolean) => {
    setTimeout(() => {
      const activityResult = result === true ? `SUCCESS` : result === false ? `WRONG` : null;
      setIsOpen(MODALS[activityResult as keyof typeof MODALS]);
    }, 3500);
  };

  const closeModal = () => {
    setIsOpen(null);
  };

  

  return (
    <>
      <div className="header">
        <BtnBack />
        <h1>Frog Jump</h1>
      </div>
      <div className={'container'}>
        <Row justifyContent="center" alignItems="center">
          <Col xs="12">
            <div>
              <Row justifyContent="center" alignItems="center">
                <Col xs="12" hd="8">
                  <Audio
                    addClass="u-mb-2"
                    key={currentQuestion}
                    src={`assets/audios/aud_ova-26_sld-17_${currentQuestion}.mp3`}
                  />
                  <FrogJumping dataGameFrog={dataGameFrog}></FrogJumping>
                </Col>
              </Row>
            </div>
           
      <ModalFeedback
        type="success"
        isOpen={MODALS.SUCCESS === isOpen}
        onClose={closeModal}
        finalFocusRef="#main">
        <p>Correcto!</p>
      </ModalFeedback>
      <ModalFeedback
        type="wrong"
     isOpen={MODALS.WRONG === isOpen}
        onClose={closeModal}
        finalFocusRef="#main">
        <p>Incorrecto</p>
      </ModalFeedback>

          </Col>
        </Row>
      </div>
    </>
  );
};
