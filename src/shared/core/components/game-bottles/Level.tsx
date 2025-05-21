import { useState } from 'react';
import { Audio, Col, Panel, Row } from 'books-ui';

import { Button } from '@/shared/ui/components';

import { FullScreenAlert } from '../fullscreen-alert';
import { Icon } from '../icon';

import { CorrectIcon, WrongIcon } from './icons_/icons';
import { letterProp, spaceProp, TypeWord } from './types/types';
import Bottle from './Bottle';
import { Parallax } from './parallax';

import css from './styles/level.module.css';

interface propsLevel {
  wordData: TypeWord;
  index?: number;
  onResult?(result: boolean): void;
  content?: React.ReactNode;
  title?: string;
  alt?: string;
  audio_success?: string;
  audio_wrong?: string;
}

function initialState(word: string | string[]): letterProp[] {
  const letters = Array.isArray(word) ? word : word.split('').sort(() => Math.random() - 0.5);
  return letters.map(letter => ({
    letter,
    index: crypto.randomUUID(),
    enable: true
  }));
}

export default function Level({
  wordData,
  index,
  onResult,
  title,
  alt,
  audio_success,
  audio_wrong,
  content
}: propsLevel) {
  const [openModal, setOpenModal] = useState<'success' | 'wrong' | null>(null);
  const [letters, setLetters] = useState<letterProp[]>(() => initialState(wordData.wordSequence || wordData.word));
  const [spaces, setSpaces] = useState<spaceProp[]>(() => Array.from({ length: letters.length }, () => null));

  const [selectIndex, setSelectIndex] = useState<number>(0);

  const addLetter = (obj: letterProp) => {
    //evitar re-render si ta esta inhabilitado
    if (!obj.enable) return;
    //inhabilitar la botella seleccionada y habilitar la que ya estaba en el lugar
    const newWords = letters.map((sel) => {
      if (spaces[selectIndex] && sel.index === spaces[selectIndex]?.index) {
        return { ...spaces[selectIndex], enable: true };
      }
      if (sel.index === obj.index) return { ...obj, enable: false };
      return sel;
    });
    setLetters(newWords as letterProp[]);

    //añadir la nueva letra seleccionada
    spaces[selectIndex] = { ...obj };
    setSpaces([...spaces]);

    //avanzar el indice
    setSelectIndex(selectIndex >= spaces.length - 1 ? 0 : selectIndex + 1);
  };

  const removeLetter = () => {
    if (!spaces[selectIndex]) return;

    const updatedWords = letters.map((letter) =>
      letter.index === spaces[selectIndex]?.index ? { ...letter, enable: true } : letter
    );

    // Establece el espacio seleccionado como nulo para eliminar la letra.
    spaces[selectIndex] = null;

    setSpaces([...spaces]);
    setLetters(updatedWords as letterProp[]);
  };

  const checkAnswer = () => {
    const sentenceByUser = spaces
      .map((obj) => obj?.letter || '')
      .join('')
      .toLowerCase();

    const isCorrect = wordData.word.toLowerCase() === sentenceByUser;
    setOpenModal(isCorrect ? 'success' : 'wrong');

    if (onResult) {
      onResult(isCorrect);
    }
  };

  const reset = () => {
    setLetters(letters.map((letter) => ({ ...letter, enable: true })));
    setSpaces(spaces.map(() => null));
    setOpenModal(null);
  };

  const ALREADY_FILL = spaces.find((obj) => obj === null) === undefined ? true : false;
  const PARCIAL_WORD = spaces.map((obj) => (obj ? obj.letter : '')).join('');

  return (
    <>
      <Row alignItems="center" justifyContent="center">
        <Col xs="11" mm="10" md="9" lg="8" hd="7" addClass="u-mb-2 u-flow">
          {wordData?.a11y && <Audio a11y src={wordData.a11y} />}
          {wordData?.content && <Audio src={wordData.content} />}

          {audio_success && openModal === 'success' && <Audio src={audio_success} />}
          {audio_wrong && openModal === 'wrong' && <Audio src={audio_wrong} />}

          {content}
          <FullScreenAlert />
        </Col>
        <Col xs="11" mm="10" lg="9" hd="8" addClass="u-flow u-mb-4">
          <Parallax>
            <>
              {/* Bottellas */}
              {openModal === null && (
                <div className={css.container__bottles}>
                  {letters.map((props) => (
                    <Bottle key={props.index} onClick={() => addLetter(props)} {...props} />
                  ))}
                </div>
              )}

              {/* Palabra */}
              <div className={`${css.container_word} ${css[openModal || '']}`}>
                <p aria-live="assertive" className="u-sr-only">
                  {`palabra armada ${PARCIAL_WORD}`}
                </p>
                {openModal ? openModal === 'wrong' ? <WrongIcon /> : <CorrectIcon /> : null}

                {spaces[selectIndex] && openModal === null && (
                  <button
                    className={css.cancel_button}
                    onClick={removeLetter}
                    aria-label="eliminar palabra seleccionada">
                    <Icon size="small" name="close" />
                  </button>
                )}
                {spaces.map((obj, i) => (
                  <button
                    key={obj?.index || i}
                    disabled={!!openModal}
                    className={selectIndex === i ? css.select : undefined}
                    onClick={() => setSelectIndex(i)}>
                    {obj?.letter || '_'}
                  </button>
                ))}
              </div>
            </>
          </Parallax>

          <p className="u-text-center u-font-italic">
            <strong>{title} </strong>
            {alt}
          </p>

          <div className={css.container_controls}>
            <Button
              label="Comprobar"
              id="button-comprobar"
              disabled={!ALREADY_FILL || openModal !== null}
              onClick={checkAnswer}
            />
            <Button label="Reintentar" disabled={openModal !== 'wrong'} onClick={reset} />
            {openModal === 'success' && index && (
              <Panel.Button section={index}>
                <Button addClass="u-ml-3" label="Continuar" />
              </Panel.Button>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
}
