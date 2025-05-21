import { ReactNode, useMemo, useState } from 'react';
import { Audio, Col, Panel, Row } from 'books-ui';

import { FullScreenAlert } from '@/shared/core/components';
import { Button } from '@/shared/ui/components';

import { DATA_fishs } from './data/data';
import { question_game } from './types/types';
import { Fish } from './fish';
import { Parallax } from './parallax';

import css from './styles/level.module.css';

const MARGIN_FISH = 0.7;
const PERCENT_SPACE_FISHS = 80;
export interface propsLevel {
  question?: question_game;
  index?: number;
  intro?: boolean;
  onResult?(result: boolean, questionNumber: number): void;
  content?: ReactNode;
  title?: string;
  alt?: string;
  audio_success?: string;
  audio_wrong?: string;
  isSpace?: boolean;
  addClassBtnFish?: string;
  disableFeedbackImage?: boolean;
  questionsCount?: number;
  introStatement? : string | JSX.Element;
  children?: ReactNode;
}

const DEFAULT_QUESTON: question_game = {
  mockAnswers: [],
  paragraphParts: [
    {
      type: 'text',
      content:
        'Seleccione el pez que lleva la palabra correcta para cada  oración. Los peces van nadando y usted debe hacer clic el que lleva la palabra correcta'
    }
  ]
};

function addUniqueIdsToOptions(options: string[]) {
  return options.map((option) => ({
    id: crypto.randomUUID(),
    answer: option
  }));
}

export default function Level({
  question = DEFAULT_QUESTON,
  index,
  intro,
  onResult,
  title,
  alt,
  audio_success,
  audio_wrong,
  content,
  isSpace = true,
  addClassBtnFish,
  disableFeedbackImage,
  introStatement,
  questionsCount
}: propsLevel) {
  const [selectAnswers, setSelectAnswers] = useState<string[]>([]);
  const [openModal, setOpenModal] = useState<'success' | 'wrong' | null>(null);

  const spaceBlank = useMemo(() => {
    return question.paragraphParts.filter((part) => part.type === 'space');
  }, [question.paragraphParts]);

  const answers = useMemo(() => {
    return addUniqueIdsToOptions(question.mockAnswers);
  }, [question.mockAnswers]);

  const addSelectAnswer = (answer: string) => {
    if (spaceBlank.length > selectAnswers.length) {
      selectAnswers.push(answer);
      setSelectAnswers([...selectAnswers]);
    }
  };

  const selectParagraph = (indexPart: number) => {
    return selectAnswers.length === indexPart ? css.selectPart : '';
  };

  const checkAnswers = () => {
    const isCorrect = spaceBlank.every((space, index) => space.content === selectAnswers[index]);
    if (onResult && questionsCount) {
      const questionNumber = index ?? questionsCount;
      onResult(isCorrect, questionNumber);
    }

    setOpenModal(isCorrect ? 'success' : 'wrong');
  };

  return (
    <>
      <Row alignItems="center" justifyContent="center">
        <Col xs="11" mm="10" md="9" lg="8" hd="7" addClass="u-mb-2 u-flow">
          {question.audio_description &&
            (disableFeedbackImage ? (
              <Audio src={question.audio_description} a11y />
            ) : (
              !openModal && <Audio src={question.audio_description} a11y />
            ))}
          {question.audio_content &&
            (disableFeedbackImage ? (
              <Audio src={question.audio_content} />
            ) : (
              !openModal && <Audio src={question.audio_content} />
            ))}

          {!disableFeedbackImage && audio_success && openModal === 'success' && <Audio src={audio_success} />}
          {!disableFeedbackImage && audio_wrong && openModal === 'wrong' && <Audio src={audio_wrong} />}

          {content}
          <FullScreenAlert />
        </Col>
        <Col xs="11" mm="10" lg="9" hd="8" addClass="u-flow u-mb-4">
          {introStatement && <>{introStatement}</>}	
          <Parallax>
            <>
              <div className={css.container__question}>
                <img src="assets/images/Ancla.webp" alt="" />
                <p className="u-font-bold u-text-center">
                  {question.paragraphParts.map((part, index) =>
                    part.type === 'text' ? (
                      <span key={index + part.content}>{part.content}</span>
                    ) : (
                      isSpace && (
                        <span key={index + part.content} className={selectParagraph(part.index)}>
                          {part.index < selectAnswers.length ? ' ' + selectAnswers[part.index] + ' ' : '____'}
                        </span>
                      )
                    )
                  )}
                </p>
                <img src="assets/images/Ancla.webp" alt="" />
              </div>

              {intro && (
                <Panel.Button section={1}>
                  <button className={css.init_button}>INICIO</button>
                </Panel.Button>
              )}

              {answers.map(({ id, answer }, index) => (
                <Fish
                  key={id}
                  answer={answer}
                  isPressed={selectAnswers.includes(answer)}
                  fish={DATA_fishs[index]?.image}
                  margin={(PERCENT_SPACE_FISHS / answers.length) * (index + MARGIN_FISH) + '%'}
                  onClick={addSelectAnswer}
                  isCorrect={openModal === 'success'}
                  addClass={addClassBtnFish}
                  isDisabled={!!openModal}
                />
              ))}

              {!disableFeedbackImage && openModal === 'wrong' && (
                <img
                  src="assets/images/Ova_002_sld_15_Haz_fallado.webp"
                  className={css.modal_depth}
                  alt="has fallado, vuelve a intentar"
                />
              )}

              {!disableFeedbackImage && openModal === 'success' && (
                <img
                  src="assets/images/Ova_002_sld_15_Felicidades.webp"
                  className={css.modal_depth}
                  alt="Felicitaciones, has completado correctamente tu ejercicio."
                />
              )}
            </>
          </Parallax>

          <p className="u-text-center u-font-italic">
            <strong>{title} </strong>
            {alt}
          </p>

          <div className={css.container_controls}>
            <Button
              label="Comprobar"
              disabled={spaceBlank.length !== selectAnswers.length || intro || openModal !== null}
              onClick={checkAnswers}
              id="button-comprobar"
            />
            <Button
              disabled={intro || openModal !== 'wrong'}
              label="Reintentar"
              onClick={() => {
                setSelectAnswers([]);
                setOpenModal(null);
              }}
            />
            {openModal === 'success' && index && (
              <Panel.Button section={index + 1}>
                <Button addClass="u-ml-3" label="Continuar" />
              </Panel.Button>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
}
