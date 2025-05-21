import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'books-ui';

import 'books-ui/styles';

import PhaserGame from './main/main';
import { Question } from './utils/types';

import './styles/GameMaze.css';

interface GameMazeProps {
  questions: Question[];
  gameId?: string;
}

const GameMaze = ({ questions, gameId }: GameMazeProps) => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;

  const containerId = `game-container-${gameId}`;

  const [showOverlay, setShowOverlay] = useState(true); // Mostrar/ocultar overlay
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswerText, setCorrectAnswerText] = useState('');
  const [modalType, setModalType] = useState<'success' | 'wrong' | null>(null);

  const currentQuestion = questions[currentIndex];

  const closeModal = () => {
    setModalType(null);
  };

  useEffect(() => {
    if (!gameContainer.current) return;

    const game = new PhaserGame({ containerId, gameEvents });

    const showModal = (data: { type: 'success' | 'wrong' }) => {
      setModalType(data.type);
    };

    gameEvents.on('feedback-modal', showModal);
    gameEvents.on('preloadComplete', () => setShowOverlay(true));
    gameEvents.on('startGame', () => setShowOverlay(false));
    gameEvents.on('restartGame', () => setCurrentIndex(0));
    gameEvents.on('correctAnswer', () => {
      const nextIndex = currentIndex + 1;

      if (nextIndex >= questions.length) {
        gameEvents.emit('showEndScene');
      } else {
        setCurrentIndex(nextIndex);
      }
    });

    return () => {
      game.destroy(true);
      gameEvents.removeAllListeners();
      gameEvents.off('feedback-modal', showModal);
    };
  }, [questions.length, currentIndex, containerId, gameId, gameEvents]);

  const handleStartGame = () => {
    const currentLetter = questions[currentIndex].correctAnswer;
    gameEvents.emit('startGame', currentLetter);
    setCorrectAnswerText(currentQuestion.options[currentLetter]);
  };

  return (
    <div className="gameMaze__container">
      {showOverlay && (
        <div className="gameMaze__question">
          <p className="u-font-bold u-font-italic u-text-center u-mb-2">
            A continuación, encontrarás una pregunta con varias opciones de respuesta. Para participar, presiona el
            botón "Jugar" y accede al juego, donde se mostrarán las opciones disponibles. ¡Elige sabiamente para ganar!
          </p>
          <p>
            <strong className="u-subtitle">Pregunta {currentIndex + 1}.</strong>
          </p>
          <p>{currentQuestion.question}</p>
          <ul className="u-flow">
            <li>
              <strong className="u-subtitle">a. </strong>
              {currentQuestion.options.a}
            </li>
            <li>
              <strong className="u-subtitle">b. </strong>
              {currentQuestion.options.b}
            </li>
            <li>
              <strong className="u-subtitle">c. </strong>
              {currentQuestion.options.c}
            </li>
            <li>
              <strong className="u-subtitle">d. </strong>
              {currentQuestion.options.d}
            </li>
          </ul>
          <Button onClick={handleStartGame} aria-label="Jugar">
            Jugar
          </Button>
          {/* <button onClick={handleStartGame} aria-label="Jugar">
            Jugar
          </button> */}
        </div>
      )}

      <div ref={gameContainer} id={containerId} />

      <Modal isOpen={modalType === 'success'} onClose={closeModal} finalFocusRef={'.gameMaze__question'}>
        <Modal.Overlay />
        <Modal.Content addClass="feedbackModal">
          <Modal.CloseButton />
          <div className="feedbackModalContent">
            <h2>¡Correcto!</h2>
            <p>{correctAnswerText}</p>
          </div>
        </Modal.Content>
      </Modal>

      <Modal isOpen={modalType === 'wrong'} onClose={closeModal} finalFocusRef={'.gameMaze__question'}>
        <Modal.Overlay />
        <Modal.Content addClass="feedbackModal">
          <Modal.CloseButton />
          <div className="feedbackModalContent">
            <h2>¡Incorrecto!</h2>
            <p>Vuelve a intentarlo las veces que sean necesarias, ánimo!</p>
          </div>
        </Modal.Content>
      </Modal>
    </div>
  );
};

export default GameMaze;
