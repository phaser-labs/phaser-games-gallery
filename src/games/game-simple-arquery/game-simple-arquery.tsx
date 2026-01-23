/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

import PhaserGame from './main/main';
import { globalState, loadQuestions } from './utils/globalState';
import { Question } from './utils/types';

import './styles/GameArquery.css';

// Tipo para el resultado que se envía al padre
export interface GameResult {
  isCorrect: boolean;
  questionIndex: number;
  selectedAnswer?: string;
  correctAnswer: string;
  question: Question;
}

interface GameSimpleArqueryProps {
  questions: Question[];
  onResult: (result: GameResult) => void;
  gameId?: string;
  continueDelay?: number;
}

// Helper para la región ARIA Live
const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
};

export const GameSimpleArquery = ({ 
  questions: initialQuestions, 
  onResult,
  gameId = 'default',
  continueDelay = 1000
}: GameSimpleArqueryProps) => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;
  const phaserGameInstanceRef = useRef<PhaserGame | null>(null);
  const hasInitializedPhaser = useRef(false);

  const containerId = `game-container-${gameId}`;

  const [showOverlay, setShowOverlay] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const gameHasBeenExplicitlyStartedRef = useRef(false);
  const [isGameInitialized, setIsGameInitialized] = useState(false);

  // Tipo para la acción pendiente después del modal
  type NextAction = { type: 'nextQuestion'; questionIndex: number } | { type: 'endGame' } | null;
  const pendingNextActionRef = useRef<NextAction>(null);

  const currentIndexRef = useRef(currentIndex);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      loadQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  // Función para continuar el juego después de cerrar el modal
  const continueGame = useCallback(() => {
    if (!pendingNextActionRef.current) {
      console.log('⚠️ No hay acción pendiente');
      return;
    }
    const action = pendingNextActionRef.current;
    pendingNextActionRef.current = null;

    if (action.type === 'nextQuestion') {
      setCurrentIndex(action.questionIndex);
      gameEvents.emit('loadNextQuestion', { questionIndex: action.questionIndex });
    } else if (action.type === 'endGame') {
      setIsGameFinished(true);
      setIsGameInitialized(false);
      gameEvents.emit('showEndScene');
    }
  }, [gameEvents]);

  useEffect(() => {
    if (!gameContainer.current || hasInitializedPhaser.current) {
      return;
    }
    const game = new PhaserGame({ containerId, gameEvents, initialMuteState: isMuted }); 
    phaserGameInstanceRef.current = game;
    hasInitializedPhaser.current = true;

    // --- Handlers de Eventos ---
    
    // Handler cuando se responde una pregunta
    const answerHandler = (data: { type: 'success' | 'wrong'; selectedAnswer?: string }) => {
      console.log('🎯 answerHandler llamado:', data);
      const question = globalState.questions[currentIndexRef.current];
      if (!question) return;

      const result: GameResult = {
        isCorrect: data.type === 'success',
        questionIndex: currentIndexRef.current,
        selectedAnswer: data.selectedAnswer,
        correctAnswer: question.correctAnswer,
        question
      };

      // Enviar resultado al padre usando la ref para evitar dependencias
      console.log('📤 Enviando resultado al padre:', result);
      onResultRef.current(result);

      // Si es correcta, preparar la siguiente acción y ejecutarla automáticamente después del delay
      if (data.type === 'success') {
        console.log('✅ Respuesta correcta, preparando siguiente acción...');
        const nextIndex = currentIndexRef.current + 1;
        
        if (nextIndex >= globalState.questions.length) {
          // Juego terminado
          pendingNextActionRef.current = { type: 'endGame' };
        } else {
          pendingNextActionRef.current = { type: 'nextQuestion', questionIndex: nextIndex };
        }

        // Ejecutar automáticamente la acción pendiente después del delay
        setTimeout(() => {
          continueGame();
        }, continueDelay);
      } else {
        console.log('❌ Respuesta incorrecta, esperando reintento...');
        pendingNextActionRef.current = null;
      }
    };

    const preloadCompleteHandler = () => {
      if (!gameHasBeenExplicitlyStartedRef.current) setShowOverlay(true);
    };

    const phaserStartsGameHandler = () => setShowOverlay(false);

    const restartGameHandler = () => {
      gameHasBeenExplicitlyStartedRef.current = false;
      setIsGameFinished(false);
      pendingNextActionRef.current = null;
      if (globalState.questions.length > 0) {
        gameEvents.emit('startGame', { questionIndex: 0 });
      }
      setCurrentIndex(0);
      setShowOverlay(true);
    };

    const gameInitHandler = () => {
      setIsGameInitialized(true);
    };

    gameEvents.on('feedback-modal', answerHandler);
    gameEvents.on('preloadComplete', preloadCompleteHandler);
    gameEvents.on('phaserStartsGame', phaserStartsGameHandler);
    gameEvents.on('restartGame', restartGameHandler);
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
    setCurrentIndex(0);
    if (globalState.questions.length > 0) {
      gameEvents.emit('startGame', { questionIndex: 0 });
      announce('¡Juego comenzado!');
    } else {
      console.error('GameArquery Error: No hay preguntas cargadas para iniciar el juego.');
    }
  }, [gameEvents]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newState = !prev;
      gameEvents.emit('toggleMute', newState);
      return newState;
    });
  }, [gameEvents]);

  return (
    <div className="gameArquery_container">
      {/* Div oculto para anuncios ARIA Live */}
      <div
        id="game-announcer"
        aria-live="polite"
        aria-atomic="true"
        className='gameArquery_visually-hidden'></div>

      {/* Contador de preguntas - solo mostrar si el juego está activo y no ha terminado */}
      {isGameInitialized && !isGameFinished && (
        <p className='gameArquery_number-questions'>
          <span>{currentIndex + 1}</span> / <span> {globalState.questions.length} </span>
        </p>
      )}
      
      {/* Botón de mute - solo mostrar si el juego no ha terminado */}
      {!isGameFinished && (
        <button
          id="game-arquery-volume-button"
          aria-label={isMuted ? 'Activar sonido' : 'Desactivar sonido'}
          onClick={toggleMute}
          className={`volume-button-gameArquery ${isMuted ? 'muted' : 'sound'}`}
        />
      )}
      
      {/* Overlay de inicio */}
      {showOverlay && (
        <div className="gameArquery_question">
          <h2 className="gameArquery_title">Desafío del Arquero</h2>
          <button onClick={handleStartGame} aria-label="Haz click para jugar">
            Iniciar
          </button>
        </div>
      )}

      <div ref={gameContainer} id={containerId} tabIndex={0} />
    </div>
  );
};
