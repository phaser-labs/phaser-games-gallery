/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button /*, Modal */ } from 'books-ui';
import Phaser from 'phaser';

import { ModalFeedback } from '@/shared/core/components';

import PhaserGame from './main/main';
import { globalState, loadQuestions } from './utils/globalState';
import { Question } from './utils/types';

import './styles/GameArquery.css';

interface GameArqueryProps {
  questions: Question[];
  gameId?: string;
}

// Se define un tipo para la acción pendiente después del modal de éxito
type NextAction = { type: 'nextQuestion'; questionIndex: number } | { type: 'endGame' } | null;

// Helper para la región ARIA Live
const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
};

export const GameArquery = ({ questions: initialQuestions, gameId }: GameArqueryProps) => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;
  const phaserGameInstanceRef = useRef<PhaserGame | null>(null);
  const hasInitializedPhaser = useRef(false);

  const containerId = `game-container-${gameId || 'default'}`;

  const [showOverlay, setShowOverlay] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState({
    successAudio: '',
    wrongAudio: '',
    correctText: '',
    incorrectText: ''
  });
  const [modalType, setModalType] = useState<'success' | 'wrong' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const gameHasBeenExplicitlyStartedRef = useRef(false);
  const pendingNextActionRef = useRef<NextAction>(null); // Usamos ref para no causar re-renders innecesarios.
  const [isGameInitialized, setIsGameInitialized] = useState(false);


    const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      loadQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  // closeModal maneja el avance del juego
  const closeModal = useCallback(() => {
    const previouslyOpenModalType = modalType;
    setModalType(null);

    if (previouslyOpenModalType === 'success' && pendingNextActionRef.current) {
      const action = pendingNextActionRef.current;
      pendingNextActionRef.current = null;
      if (action.type === 'nextQuestion') {
        // Actualiza el estado de React ANTES de avisar a Phaser
        setCurrentIndex(action.questionIndex);
        gameEvents.emit('loadNextQuestion', { questionIndex: action.questionIndex });
      } else if (action.type === 'endGame') {
        setCurrentIndex(globalState.questions.length); 
        gameEvents.emit('showEndScene');
      }
    }
  }, [modalType, gameEvents]);

 useEffect(() => {
    if (!gameContainer.current || hasInitializedPhaser.current) {
        return;
    }
    const game = new PhaserGame({ containerId, gameEvents, initialMuteState: isMuted }); 
    phaserGameInstanceRef.current = game;
    hasInitializedPhaser.current = true;

    // --- Handlers de Eventos ---
    const showModalHandler = (data: { type: 'success' | 'wrong' }) => {
      //  índice de la pregunta recién respondida
      const questionForModal = globalState.questions[currentIndexRef.current];

      if (questionForModal && questionForModal.feedback) {
        setAnswerText(questionForModal.feedback);
      } else if (questionForModal) {
        setAnswerText({
            successAudio: 'assets/audios/exito.mp3',
            wrongAudio: 'assets/audios/error.mp3',
            correctText: data.type === 'success' ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta',
            incorrectText: data.type === 'success' ? '¡Siguiente!' : '!Oh no! Inténtalo de nuevo.'
        });
      }
      setModalType(data.type);
    };

    const preloadCompleteHandler = () => {
      if (!gameHasBeenExplicitlyStartedRef.current) setShowOverlay(true);
    };
    const phaserStartsGameHandler = () => setShowOverlay(false);

    const restartGameHandler = () => {
      pendingNextActionRef.current = null;
      gameHasBeenExplicitlyStartedRef.current = false;

      if (globalState.questions.length > 0) {
        gameEvents.emit('startGame', { questionIndex: 0 }); // Asegura que Phaser reinicie
      }
      setCurrentIndex(0); // Resetear el índice de React
      setShowOverlay(true);
    };

    // funcion para manejar la respuesta correcta
    const correctAnswerHandler = () => {
      const nextPotentialIndex = currentIndexRef.current + 1;

      if (nextPotentialIndex >= globalState.questions.length) {
        pendingNextActionRef.current = { type: 'endGame' };
      } else {
        pendingNextActionRef.current = { type: 'nextQuestion', questionIndex: nextPotentialIndex };
      }
    };

    gameEvents.on('feedback-modal', showModalHandler);
    gameEvents.on('preloadComplete', preloadCompleteHandler);
    gameEvents.on('phaserStartsGame', phaserStartsGameHandler);
    gameEvents.on('restartGame', restartGameHandler);
    gameEvents.on('correctAnswer', correctAnswerHandler);
    gameEvents.on('gameInit', gameInitHandler);

    return () => {
      if (phaserGameInstanceRef.current) {
        phaserGameInstanceRef.current.destroy(true);
        phaserGameInstanceRef.current = null;
      }
      gameEvents.removeAllListeners();
      hasInitializedPhaser.current = false;
    };
  }, [containerId, gameEvents]); 

 const handleStartGame = useCallback(() => {
    gameHasBeenExplicitlyStartedRef.current = true;
    pendingNextActionRef.current = null;
    setCurrentIndex(0);
    if (globalState.questions.length > 0) {
      gameEvents.emit('startGame', { questionIndex: 0 });
    } else {
      console.error('GameArquery Error: No hay preguntas cargadas para iniciar el juego.');
    }
  }, [gameEvents]);

  const gameInitHandler = () => {
    setIsGameInitialized(true);
  };

    const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newState = !prev;
      gameEvents.emit('toggleMute', newState);
      return newState;
    });
  }, [gameEvents]);

  // actualizar el texto del feedback
useEffect(() => {
    if (modalType !== 'success' && currentIndex >= 0 && currentIndex < globalState.questions.length) {
      const question = globalState.questions[currentIndex];
      if (question && question.feedback) {
        // Actualizar el texto del feedback
        setAnswerText(question.feedback);
      } else if (question) {
        // Usar los defaults
        setAnswerText({ /* ... defaults ... */
          successAudio: 'assets/audios/exito.mp3',
          wrongAudio: 'assets/audios/error.mp3',
          correctText: '¡Respuesta Correcta!',
          incorrectText: '¡Siguiente!'
        });
      }
    } 
  }, [currentIndex, initialQuestions, modalType]);

   useEffect(() => {
    if (currentIndex >= globalState.questions.length && globalState.questions.length > 0) {
      setIsGameInitialized(false);
        announce('¡Juego completado!, gracias por jugar.');
    }
  }, [currentIndex, initialQuestions.length]); // Depende de initialQuestions.length para re-evaluar si el total cambia

  return (
    <div className="gameArquery_container">
      {/* Div oculto para anuncios ARIA Live */}
      <div
        id="game-announcer"
        aria-live="polite"
        aria-atomic="true"
        className='visually-hidden'></div>
        { isGameInitialized && 
        <p className='gameArquery_number-questions'>
          <span>{currentIndex + 1}</span> / <span> {globalState.questions.length} </span>
          </p>}
      <button
        id="game-arquery-volume-button"
        aria-label={isMuted ? 'Activar sonido' : 'Desactivar sonido'}
        onClick={toggleMute}
        className={`volume-button ${isMuted ? 'muted' : 'sound'}`}
      />
      {showOverlay && (
        <div className="gameArquery_question">
          <h2 className="gameArquery_title">Desafío del Arquero</h2>
          <Button onClick={handleStartGame} aria-label="Haz click para jugar">
            Iniciar
          </Button>
        </div>
      )}

      <div ref={gameContainer} id={containerId} tabIndex={0} style={{maxHeight: '44vh'}} />

      {/* Modales */}

      <ModalFeedback
        type="success"
        isOpen={modalType === 'success'}
        onClose={closeModal}
        finalFocusRef="#main"
        audio={answerText.successAudio}>
        <p dangerouslySetInnerHTML={{ __html: answerText.correctText }}></p>
      </ModalFeedback>
      <ModalFeedback
        type="wrong"
        isOpen={modalType === 'wrong'}
        onClose={closeModal}
        finalFocusRef="#main"
        audio={answerText.wrongAudio}>
        <p dangerouslySetInnerHTML={{ __html: answerText.incorrectText }}></p>
      </ModalFeedback>

      {/*   <Modal isOpen={modalType === 'success'} onClose={closeModal} finalFocusRef={`#${containerId}`}>
        <Modal.Overlay />
        <Modal.Content addClass="feedbackModal">
          <Modal.CloseButton />
          <div className="feedbackModalContent">
            <h2>¡Correcto!</h2>
          <p dangerouslySetInnerHTML={{__html: AnswerText.correctText}}></p>
          </div>

        </Modal.Content>
      </Modal>

      <Modal isOpen={modalType === 'wrong'} onClose={closeModal} finalFocusRef={`#${containerId}`}>
        <Modal.Overlay />
        <Modal.Content addClass="feedbackModal">
          <Modal.CloseButton />
          <div className="feedbackModalContent">
            <h2>¡Incorrecto!</h2>
             <p dangerouslySetInnerHTML={{__html: AnswerText.incorrectText}}></p>
          </div>
        </Modal.Content>
      </Modal> */} 
    </div>
  );
};
