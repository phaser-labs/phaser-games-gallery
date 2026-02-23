import React, { useCallback, useEffect, useRef, useState } from "react";
import Phaser from "phaser";

import PhaserGame from "./game/main";
import { GameResult, GameWhackAQuestionProps, ThemeType } from "./types/types";
import { announce } from './utils/announce';
import { loadQuestions, setTheme } from './utils/global-state';
import { themeManager } from './utils/theme-manager';
import { applyTheme } from './utils/ui-styles';
import { ThemeSelector } from './components';

import './styles/game-whack.css';



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
  // State para manejar el reinicio de Phaser cuando cambia el tema
  const [phaserKey, setPhaserKey] = useState(0);

  // Inicializar el theme-manager al montar el componente
  useEffect(() => {
    themeManager.initialize();
  }, []);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // Cargar preguntas al globalState
  useEffect(() => {
    if (data?.length) {
      loadQuestions(data);
    }
  }, [data]);

  // Handler del ThemeSelector
  const handleThemeChange = useCallback(
    (theme: ThemeType) => {
      setTheme(theme); // globalState.theme

      applyTheme(theme);

      // Avisar a Phaser para que lo aplique (o reinicie)
      gameEvents.emit('theme-changed', { theme });
      setPhaserKey((k) => k + 1);

      // Anunciar el cambio
      announce(`Tema cambiado a ${theme.name}. Presiona jugar para comenzar.`);
    },
    [gameEvents]
  );

  useEffect(() => {
    // Limpiar instancia anterior si existe
    if (phaserGameInstance.current) {
      phaserGameInstance.current.destroy(true);
      phaserGameInstance.current = null;
    }

    // Inicialización de Phaser
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
  }, [containerId, gameEvents, data, phaserKey]);


  // handler para cambiar al sonido o mute
 /*     const toggleMute = useCallback(() => {
      setIsMuted(prev => {
        const newState = !prev;
        gameEvents.emit('toggleMute', newState);
        return newState;
      });
    }, [gameEvents]); */

  return (
    <>
      {/* Selector de temas */}
      <div className="theme-selector-container">
        <ThemeSelector onThemeChange={handleThemeChange} gameEvents={gameEvents} />
      </div>
      
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

        {/*  <button
          id="game-reorganize-volume-button"
          aria-label={isMuted ? 'Activar sonido' : 'Desactivar sonido'}
          onClick={toggleMute}
          className={`game-reorganize-volume-button ${isMuted ? 'muted' : 'sound'}`}
        /> */}
        
        <div key={phaserKey} ref={gameContainer} id={containerId} className="game-whack-a-question_canvas" />
      </div>
    </>
  );
};