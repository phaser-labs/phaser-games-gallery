import { useEffect, useState } from 'react';
import { Audio,Button, Col,Modal, Row } from 'books-ui';

import { BtnBack } from "@/components/btnBack"
import { dataGameRoadDice } from "@/data/data-dame-road-say";
import RoadDice from '@/games/game-road-say/RoadDice';
import { ModalFeedback } from '@/shared/core/components';

import "books-ui/styles";

import { Radios } from '../components/radio-activity';



const MODALS = {
  SUCCESS: 'modal-correct-activity',
  WRONG: 'modal-wrong-activity'
};
const PREGUNTAS ={
  PREGUNTA3: "PREGUNTA3",
  PREGUNTA7: "PREGUNTA7",
  PREGUNTA13: "PREGUNTA13",
  PREGUNTA18: "PREGUNTA18",
  PREGUNTA22: "PREGUNTA22"
}
export const RoadSay = () => {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const [accumulated, setAccumulated] = useState<number>(0);
  const [result, setResult] = useState<boolean |null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);


  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ accumulated: number, resultNull: boolean|null, currentStep: number }>;
      setAccumulated(custom.detail.accumulated);
      setResult(custom.detail.resultNull);
      setCurrentStep(custom.detail.currentStep);
    };
    window.addEventListener('accumulatedChange', handler);
    if(currentStep=== accumulated){
      setTimeout(() => {
        const activityResult = `PREGUNTA${accumulated}`;
        setIsOpen(PREGUNTAS[ activityResult  as keyof typeof PREGUNTAS ]);
      }, 1500)
    }
    return () => {
      window.removeEventListener('accumulatedChange', handler);
    };
  }, [accumulated, currentStep, ]);

  const event = new CustomEvent('updateGameState', {
    detail: { result, isOpen },
  });
  window.dispatchEvent(event);


  const closeModal = () => {
    setIsOpen(null);
  };
 const handleValidate =
    ({ result }: { result: boolean }) => {
      setResult(result);
      const activityResult = result ? `SUCCESS` : `WRONG`;
      console.log(activityResult);
      setIsOpen(MODALS[activityResult as keyof typeof MODALS]);

    };
  return (
   <>
      <div className="header">
        <BtnBack />
        <h1>Camino de preguntas</h1>
      </div>
      <div className={'container'}>
         <Audio a11y src={`assets/audios/ally/aud_des_ova-26_sld-17__1.mp3`} />
        <Row justifyContent="center" alignItems="center">
          <Col xs="12" hd="10">
            <Audio
              addClass="u-mb-2"

              src={`assets/audios/aud_ova-26_sld-17_1.mp3`}
            />
            <p aria-live='polite' className='u-sr-only'> el avatar se encuentra en la casilla numero  {currentStep}</p>
            <RoadDice dataGameRoadDice={dataGameRoadDice}></RoadDice>
          </Col>
        </Row>
     
      {/* modal de feedback */}
      {/* <Modal isOpen={MODALS.SUCCESS === isOpen} onClose={closeModal} finalFocusRef={'.gameMaze__question'}>
        <Modal.Overlay />
        <Modal.Content addClass="feedbackModal">
          <Modal.CloseButton />
          <div className="feedbackModalContent">
            <h2  className='titulo_modal_correcto'>¡Correcto!</h2>
            <Image width="10px" src="assets/images/success.webp" addClass="imageFeedBack" alt="una mujer con señal de ok  y un chulo verde en la parte derecha"/>
            <p>Felicitaciones, la respuesta es correcta.</p>
          </div>
        </Modal.Content>
      </Modal>
      <Modal isOpen={MODALS.WRONG === isOpen} onClose={closeModal} finalFocusRef={'.gameMaze__question'}>
        <Modal.Overlay />
        <Modal.Content addClass="feedbackModal">
           <Modal.CloseButton />
          <div className="feedbackModalContent">
            <h2  className='titulo_modal_incorrecto'>¡Incorrecto!</h2>
            <Image  src="assets/images/wrong.webp" addClass="imageFeedBack" alt="un hombre  con una señal de x y una x  en la parte derecha"/>
             <p>Vuelve a intentarlo, lo puedes lograr.</p>
          </div>
        </Modal.Content>
      </Modal> */}
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
      {/* modales de preguntas */}
      <Modal isOpen={PREGUNTAS.PREGUNTA3 === isOpen} onClose={closeModal} finalFocusRef={'.gameMaze__question'}>
        {/* <Modal.Overlay /> */}
        <div className='overlay'>
          <Modal.Content addClass="feedbackModal">
            {/* <Modal.CloseButton /> */}
            <div className="feedbackModalContent">
                  <strong >Pregunta 1.</strong>
                <p>
                  ¿Cuál es el país más grande del mundo en superficie?
                </p>
                <div className={`u-grid`} style={{ '--grid-gap': '1rem', '--grid-min': '1fr' } as React.CSSProperties}>
                  <Radios onResult={handleValidate}>
                    <Radios.Radio
                      id="1-1"
                      label="a. China"
                      state="wrong"

                    />
                    <Radios.Radio
                      id="1-2"
                      label="b.Estados Unidos"
                      state="wrong"

                    />
                    <Radios.Radio
                      id="1-3"
                      label="c. Rusia"
                      state="success"

                    />
                    <Row justifyContent="center" alignItems="center">
                      <Radios.Button>
                        <Button label="Comprobar" />
                      </Radios.Button>

                    </Row>
                  </Radios>
                </div>
            </div>
          </Modal.Content>
        </div>
      </Modal>
      <Modal isOpen={PREGUNTAS.PREGUNTA7 === isOpen} onClose={closeModal} finalFocusRef={'.gameMaze__question'}>
        <Modal.Overlay />
        <Modal.Content addClass="feedbackModal">
          {/* <Modal.CloseButton /> */}
          <div className="feedbackModalContent">
              <strong >Pregunta 2.</strong>
              <p> ¿Quién pintó la obra “La última cena”? </p>
              <div className={`u-grid`} style={{ '--grid-gap': '1rem', '--grid-min': '1fr' } as React.CSSProperties}>
                <Radios onResult={handleValidate}>
                  <Radios.Radio
                    id="1-1"
                    label="a. Miguel Ángel"
                    state="wrong"

                  />
                  <Radios.Radio
                    id="1-2"
                    label="b. Leonardo da Vinci"
                    state="success"

                  />
                  <Radios.Radio
                    id="1-3"
                    label="c. Rafael"
                    state="wrong"

                  />
                  <Row justifyContent="center" alignItems="center">
                    <Radios.Button>
                      <Button label="Comprobar" />
                    </Radios.Button>
                  </Row>
                </Radios>
              </div>
          </div>
        </Modal.Content>
      </Modal>
      <Modal isOpen={PREGUNTAS.PREGUNTA13 === isOpen} onClose={closeModal} finalFocusRef={'.gameMaze__question'}>
        <Modal.Overlay />
        <Modal.Content addClass="feedbackModal">
          {/* <Modal.CloseButton /> */}
          <div className="feedbackModalContent">
                <strong >Pregunta 3.</strong>
               <p>
                ¿Cuál es el elemento químico representado por el símbolo "O"?
              </p>
              <div className={`u-grid`} style={{ '--grid-gap': '1rem', '--grid-min': '1fr' } as React.CSSProperties}>
                <Radios onResult={handleValidate}>
                  <Radios.Radio
                    id="1-1"
                    label="a.  Oro"
                    state="wrong"

                  />
                  <Radios.Radio
                    id="1-2"
                    label="b. Osmio"
                    state="wrong"

                  />
                  <Radios.Radio
                    id="1-3"
                    label="c. Oxígeno"
                    state="success"

                  />
                  <Row justifyContent="center" alignItems="center">
                    <Radios.Button>
                      <Button label="Comprobar" />
                    </Radios.Button>
                  </Row>
                </Radios>
              </div>
          </div>
        </Modal.Content>
      </Modal>
      <Modal isOpen={PREGUNTAS.PREGUNTA18 === isOpen} onClose={closeModal} finalFocusRef={'.gameMaze__question'}>
        <Modal.Overlay />
        <Modal.Content addClass="feedbackModal">
          {/* <Modal.CloseButton /> */}
          <div className="feedbackModalContent">
                <strong >Pregunta 4.</strong>
               <p>¿En qué continente se encuentra el río Nilo? </p>
              <div className={`u-grid`} style={{ '--grid-gap': '1rem', '--grid-min': '1fr' } as React.CSSProperties}>
                <Radios onResult={handleValidate}>
                  <Radios.Radio
                    id="1-1"
                    label="a. Asia"
                    state="wrong"

                  />
                  <Radios.Radio
                    id="1-2"
                    label="b. África"
                    state="success"

                  />
                  <Radios.Radio
                    id="1-3"
                    label="c. América"
                    state="wrong"

                  />
                  <Row justifyContent="center" alignItems="center">
                    <Radios.Button>
                      <Button label="Comprobar" />
                    </Radios.Button>

                  </Row>
                </Radios>
              </div>
          </div>
        </Modal.Content>
      </Modal>
      <Modal isOpen={PREGUNTAS.PREGUNTA22 === isOpen} onClose={closeModal} finalFocusRef={'.gameMaze__question'}>
        <Modal.Overlay />
        <Modal.Content addClass="feedbackModal">
          {/* <Modal.CloseButton /> */}
          <div className="feedbackModalContent">
                <strong >Pregunta 5.</strong>
               <p> ¿Qué planeta es conocido como “el planeta rojo”? </p>
              <div className={`u-grid`} style={{ '--grid-gap': '1rem', '--grid-min': '1fr' } as React.CSSProperties}>
                <Radios onResult={handleValidate}>
                  <Radios.Radio
                    id="1-1"
                    label="a. Venus"
                    state="wrong"

                  />
                  <Radios.Radio
                    id="1-2"
                    label="b. Marte"
                    state="success"

                  />
                  <Radios.Radio
                    id="1-3"
                    label="c. Júpiter"
                    state="wrong"

                  />
                  <Row justifyContent="center" alignItems="center">
                    <Radios.Button>
                      <Button label="Comprobar" />
                    </Radios.Button>
                  </Row>
                </Radios>
              </div>
          </div>
        </Modal.Content>
      </Modal>
      </div>
    </>
  )
}
