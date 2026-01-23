
import React, { useEffect, useRef } from "react";

import PhaserGame from "../game/main";
import { loadDialogs, loadFeedbacks,loadQuestions } from "../game/utils/GlobalState"; 
import { DialogCollection, FeedbackCollection,Question } from "../game/utils/types/type";
import { GameResult } from "../game-arcanum";

import "../game/utils/global.css"; 
import "./feedbackStyles.css";

interface CanvasProps {
  dialogs?: DialogCollection; 
  data: Question[];
  feedbacks?: FeedbackCollection;
  id?: string;
  onResult?: (result: GameResult) => void;
}


export const GameCanvas: React.FC<CanvasProps> = ({ dialogs, data, feedbacks, id, onResult }) => {
  // Ref para el div donde se montará el canvas de Phaser
  const gameContainer = useRef<HTMLDivElement>(null);
  // Generar un ID único para el contenedor del juego
  const gameId = `game-phaser-${id || 'default'}`;
  // Ref para mantener la instancia del juego Phaser entre renders
  const phaserGameInstance = useRef<Phaser.Game | null>(null);
  // Estado de React para controlar la visibilidad y contenido del feedback


  useEffect(() => {
    // Cargar diálogos
    loadDialogs(dialogs || {});
    // Cargar preguntas
    loadQuestions(data);
    // Cargar textos de feedback
    if (feedbacks) {
        loadFeedbacks(feedbacks);
    }
    // Inicialización de Phaser
    if (!gameContainer.current) {
        console.error("Game container ref is not available.");
        return;
    }
    // Evitar crear múltiples instancias del juego si el componente se re-renderiza innecesariamente
    if (phaserGameInstance.current) {
        console.warn("Phaser game instance already exists. Skipping creation.");
        return;
    }
    const game = new PhaserGame({ gameId: gameId, onResult });
    phaserGameInstance.current = game;

    // Configuración del Listener de Eventos para Feedback


    return () => {
      
      // Liberar recursos
      if (phaserGameInstance.current) {
          phaserGameInstance.current.destroy(true); 
          phaserGameInstance.current = null;
      }
    };

  }, [dialogs, data, feedbacks, gameId, onResult]);

  return (
    <>
    <div className="game-arcanum-container" style={{ position: 'relative' }}>
      <div ref={gameContainer} id={gameId} />
      {/* Div oculto para anuncios ARIA Live */}
      <div id="game-announcer"
           aria-live="polite"
           aria-atomic="true"
           style={{
             position: 'absolute', width: '1px', height: '1px', margin: '-1px',
             padding: 0, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0
           }}>
      </div>
    </div>

    
   </>
  );
};