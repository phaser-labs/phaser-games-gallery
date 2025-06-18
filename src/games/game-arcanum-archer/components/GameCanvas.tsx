
import React, { useEffect, useRef, useState } from "react";

import PhaserGame from "../game/main";
import { loadDialogs, loadFeedbacks,loadQuestions } from "../game/utils/GlobalState"; 
import { DialogCollection, FeedbackCollection,Question } from "../game/utils/types/type";

import "../game/utils/global.css"; 
import "./feedbackStyles.css";

interface CanvasProps {
  dialogs?: DialogCollection; 
  data: Question[];
  feedbacks?: FeedbackCollection;
  id?: string;
}
// Tipo para manejar el estado interno del feedback
type FeedbackState = {
  show: boolean;
  type: 'correct' | 'incorrect';
  message: string;
  title: string;
};

export const GameCanvas: React.FC<CanvasProps> = ({ dialogs, data, feedbacks, id }) => {
  // Ref para el div donde se montará el canvas de Phaser
  const gameContainer = useRef<HTMLDivElement>(null);
  // Generar un ID único para el contenedor del juego
  const gameId = `game-phaser-${id || 'default'}`;
  // Ref para mantener la instancia del juego Phaser entre renders
  const phaserGameInstance = useRef<Phaser.Game | null>(null);
  // Estado de React para controlar la visibilidad y contenido del feedback
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    type: 'correct', 
    message: '',     
    title: '',       
  });

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
    const game = new PhaserGame({ gameId: gameId });
    phaserGameInstance.current = game;

    // Configuración del Listener de Eventos para Feedback
    const handleFeedbackEvent = (data: { type: 'correct' | 'incorrect'; message: string }) => { 
      // Actualizar el estado de React para mostrar el feedback
      setFeedback({
        show: true,
        type: data.type,
        title: data.type === 'correct' ? '¡Correcto!' : '¡Incorrecto!', 
        message: data.message, 
      });

      // Configurar un temporizador para ocultar el feedback automáticamente
      const hideTimeout = setTimeout(() => {
        setFeedback(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(hideTimeout);
    };

    // Suscribirse al evento global 'show-feedback'
    if (game && game.events) {
        game.events.on('show-feedback', handleFeedbackEvent);
    } else {
         console.error("Phaser game instance or its event emitter is not available for listener setup.");
    }

    return () => {
      // Se eliminar el listener de eventos para evitar fugas de memoria
      if (phaserGameInstance.current && phaserGameInstance.current.events) {
          phaserGameInstance.current.events.off('show-feedback', handleFeedbackEvent);
      }
      // Liberar recursos
      if (phaserGameInstance.current) {
          phaserGameInstance.current.destroy(true); 
          phaserGameInstance.current = null;
      }
    };

  }, [dialogs, data, feedbacks, gameId]);

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

     <div
     className={`feedback-container ${feedback.type} ${feedback.show ? 'visible' : ''}`}
     aria-hidden={!feedback.show}>
     <h3 className="feedback-title">{feedback.title}</h3>
     <p className="feedback-message">{feedback.message}</p>
   </div>
   </>
  );
};