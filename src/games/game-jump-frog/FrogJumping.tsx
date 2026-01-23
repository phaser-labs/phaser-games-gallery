/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

import PhaserGame from './core/main';
import { globalState } from './core/utils/GlobalState';

import './frogJumping.css';

export interface DataGameFrog {
  id: number;
  question: string;
  options: {
    id: string;
    label: string;
    state: 'wrong' | 'success';
  }[];
}

export interface GameResult {
  isCorrect: boolean;
  selectedAnswer: string;
  questionIndex: number;
}

interface FrogJumpingProps {
  dataGameFrog: DataGameFrog[];
  onResult: (result: GameResult) => void;
  onQuestionChange?: (questionIndex: number) => void;
}

const FrogJumping: React.FC<FrogJumpingProps> = ({ dataGameFrog, onResult, onQuestionChange }) => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;
  const gameInstanceRef = useRef<PhaserGame | null>(null);
  const onResultRef = useRef(onResult);
  const onQuestionChangeRef = useRef(onQuestionChange);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onQuestionChangeRef.current = onQuestionChange;
  }, [onQuestionChange]);

  useEffect(() => {
    if (dataGameFrog) {
      globalState.data = dataGameFrog;
    }
  }, [dataGameFrog]);

  useEffect(() => {
    if (!gameContainer.current) return;

    const game = new PhaserGame({
      container: gameContainer.current,
      gameEvents: gameEvents
    });
    
    gameInstanceRef.current = game;

    const handleResult = (result: GameResult) => {
      if (onResultRef.current) {
        onResultRef.current(result);
      }
    };

    const handleQuestionChange = (questionIndex: number) => {
      if (onQuestionChangeRef.current) {
        onQuestionChangeRef.current(questionIndex);
      }
    };

    gameEvents.on('informationResult', handleResult);
    gameEvents.on('informationQuestion', handleQuestionChange);

    return () => {
      game.destroy(true);
      gameEvents.off('informationResult', handleResult);
      gameEvents.off('informationQuestion', handleQuestionChange);
      gameInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      className="gameFrog__container"
      role="application"
      aria-label="Juego de rana educativa. Responde las preguntas para avanzar.">
      <div ref={gameContainer} className="gameFrog__game-container" />
    </div>
  );
};

export default FrogJumping;
