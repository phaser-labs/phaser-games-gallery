/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';

import PhaserGame from './main/main';
import { GameResult, Question } from './utils/types';

import './styles/GameMaze.css';

interface GameMazeProps {
  questions: Question[];
  gameId?: string;
  onResult: (result: GameResult) => void;
}

const GameMaze = ({ questions, gameId, onResult }: GameMazeProps) => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;
  const onResultRef = useRef(onResult);
  const currentIndexRef = useRef(0);
  const gameStartedRef = useRef(false);

  const containerId = `game-maze-container-${gameId}`;

  const [showOverlay, setShowOverlay] = useState(false); // Oculto al inicio para mostrar el Menú de Phaser
  const [gameStarted, setGameStarted] = useState(false); // Estado para controlar si el usuario ya pasó el menú inicial
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);
  
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);

  useEffect(() => {
    if (!gameContainer.current) return;

    const game = new PhaserGame({ containerId, gameEvents });

    const showModal = (data: { type: 'success' | 'wrong', selectedAnswer: string }) => {
      const currentQuestion = questions[currentIndexRef.current];
      const result: GameResult = {
        isCorrect: data.type === 'success',
        questionIndex: currentIndexRef.current,
        selectedAnswer: data.selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        question: currentQuestion
      };
      onResultRef.current(result);
    };

    gameEvents.on('feedback-modal', showModal);
    
    // Al completar el menú inicial, activamos el estado de juego iniciado y mostramos el overlay de la primera pregunta
    gameEvents.on('menuComplete', () => {
        setGameStarted(true);
        setShowOverlay(true);
    });

    gameEvents.on('preloadComplete', () => {
        // Solo mostramos overlay si ya pasamos el menú
        if (gameStartedRef.current) setShowOverlay(true);
    });
    
    gameEvents.on('startGame', () => setShowOverlay(false));
    gameEvents.on('restartGame', () => setCurrentIndex(0));
    gameEvents.on('correctAnswer', () => {
      const nextIndex = currentIndexRef.current + 1;

      if (nextIndex >= questions.length) {
        gameEvents.emit('showEndScene');
      } else {
        setCurrentIndex(nextIndex);
        // Al avanzar de pregunta, aseguramos que el overlay se muestre
        setShowOverlay(true);
      }
    });

    return () => {
      game.destroy(true);
      gameEvents.removeAllListeners();
      gameEvents.off('feedback-modal', showModal);
    };
  }, []); // El juego solo debe inicializarse una vez

  const handleStartGame = () => {
    const currentLetter = questions[currentIndex].correctAnswer;
    gameEvents.emit('startGame', currentLetter);
  };

  return (
    <div className="gameMaze__container">
      {showOverlay && (
        <div className="gameMaze__question">
          <p className="gameMaze__description">
            A continuación, encontrarás una pregunta con varias opciones de respuesta. Para participar, presiona el
            botón "Jugar" y accede al juego, donde se mostrarán las opciones disponibles. ¡Elige sabiamente para ganar!
          </p>
          <p>
            <strong className="gameMaze__subtitle" style={{fontSize: '1.2rem'}}>Pregunta {currentIndex + 1}.</strong>
          </p>
          <p className="gameMaze__questionText">{currentQuestion.question}</p>
          <ul className="gameMaze__options">
            <li>
              <strong className="gameMaze__subtitle">a. </strong>
              {currentQuestion.options.a}
            </li>
            <li>
              <strong className="gameMaze__subtitle">b. </strong>
              {currentQuestion.options.b}
            </li>
            <li>
              <strong className="gameMaze__subtitle">c. </strong>
              {currentQuestion.options.c}
            </li>
            <li>
              <strong className="gameMaze__subtitle">d. </strong>
              {currentQuestion.options.d}
            </li>
          </ul>
          <button type="button" id="startGame" className="gameMaze__button" onClick={handleStartGame} aria-label="Jugar">
            Jugar
          </button>
        </div>
      )}

      <div ref={gameContainer} id={containerId} />
    </div>
  );
};

export default GameMaze;
