
import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

import PhaserGame from "./game/main";

import './styles/game-whack.css';

export interface WhackQuestion {
  question: string;
  options: string[]; // Array de opciones
  correctAnswer: number; // Índice de la respuesta correcta (0-based)
}

export interface GameResult {
  isCorrect: boolean;
  questionIndex: number;
  selectedAnswer: string;
  correctAnswer: string;
  question: string;
}

interface GameWhackAQuestionProps {
  data: WhackQuestion[];
  onResult?: (result: GameResult) => void;
  gameId?: string;
}

export const GameWhackAQuestion: React.FC<GameWhackAQuestionProps> = ({ data, onResult, gameId = 'default' }) => {
  // Ref para el div donde se montará el canvas de Phaser
  const gameContainer = useRef<HTMLDivElement>(null);
  // Generar un ID único para el contenedor del juego
  const containerId = `game-whack-a-question-${gameId}`;
  // Ref para mantener la instancia del juego Phaser entre renders
  const phaserGameInstance = useRef<Phaser.Game | null>(null);
  // Ref para EventEmitter
  const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;
  // Refs para evitar problemas de closure
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    // Inicialización de Phaser
    if (!gameContainer.current || phaserGameInstance.current) {
      return;
    }

    const game = new PhaserGame({ 
      gameId: containerId, 
      gameEvents,
      data 
    });
    phaserGameInstance.current = game;

    // Escuchar evento de respuesta desde Phaser
    const handleAnswer = (resultData: { 
      isCorrect: boolean; 
      questionIndex: number; 
      selectedAnswer: string;
      correctAnswer: string;
      question: string;
    }) => {
      const result: GameResult = {
        isCorrect: resultData.isCorrect,
        questionIndex: resultData.questionIndex,
        selectedAnswer: resultData.selectedAnswer,
        correctAnswer: resultData.correctAnswer,
        question: resultData.question
      };
      
      if (onResultRef.current) {
        onResultRef.current(result);
      }
    };

    gameEvents.on('question-answered', handleAnswer);

    return () => {
      gameEvents.off('question-answered', handleAnswer);
      
      // Liberar recursos
      if (phaserGameInstance.current) {
        phaserGameInstance.current.destroy(true); 
        phaserGameInstance.current = null;
      }
    };
  }, [containerId, gameEvents, data]);

  return (
    <div className="game-whack-a-question_container">
      {/* Div oculto para anuncios ARIA Live */}
      <div 
        id="game-announcer"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute', 
          width: '1px', 
          height: '1px', 
          margin: '-1px',
          padding: 0, 
          overflow: 'hidden', 
          clip: 'rect(0, 0, 0, 0)', 
          border: 0
        }}
      />

      <div ref={gameContainer} id={containerId} className="game-whack-a-question_canvas" />
    </div>
  );
};