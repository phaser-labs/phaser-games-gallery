/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import Phaser from "phaser";

import { ThemeSelector } from "./components/ThemeSelector";
import PhaserGame from "./main/main";
import { globalState, loadQuestions } from "./utils/globalState";
import { themeManager } from "./utils/themeManager";
import { type GameReorganizeResult,type SentenceType, WORLD_THEMES,type WorldType } from "./utils/types";

import "./styles/GameReorganize.css";

interface GameReorganizeProps {
  sentences: SentenceType[];
  gameId?: string;
  onResult?: (result: GameReorganizeResult) => void;
}

// Se define un tipo para la acción pendiente después del modal de éxito
type NextAction =
  | { type: "nextQuestion"; questionIndex: number }
  | { type: "endGame" }
  | null;

// Helper para la región ARIA Live
const announce = (message: string) => {
  const announcer = document.getElementById("game-reorganize-game-announcer");
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn("Announcer element #game-reorganize-game-announcer not found in DOM.");
  }
};

export const GameReorganizeTemplate = ({
  sentences: initialQuestions,
  gameId,
  onResult,
}: GameReorganizeProps) => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;
  const phaserGameInstanceRef = useRef<PhaserGame | null>(null);
  const hasInitializedPhaser = useRef(false);

  const containerId = `game-container-${gameId || "default"}`;

  const [showOverlay, setShowOverlay] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isMuted, setIsMuted] = useState(false);
  const gameHasBeenExplicitlyStartedRef = useRef(false);
  const pendingNextActionRef = useRef<NextAction>(null);
  const [nameTheme, setNameTheme] = useState<string>('');


  
  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      loadQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  // Listener para el resultado de la revisión
  useEffect(() => {
    const handleCheckResult = (data: GameReorganizeResult) => {
      if (onResult) {
        onResult(data);
      }
    };

    gameEvents.on('check-result', handleCheckResult);

    return () => {
      gameEvents.off('check-result', handleCheckResult);
    };
  }, [gameEvents, onResult]);

  // Inicializar el theme manager
  useEffect(() => {
    themeManager.initialize();
  }, []);

  // Handler para cambios de tema - reinicia el juego completamente
  const handleThemeChange = useCallback((theme: WorldType) => {
    // Establecer el nuevo tema
    setNameTheme(theme.name);
    
    // Detener MainScene si está activa para limpiar elementos DOM
    if (phaserGameInstanceRef.current && phaserGameInstanceRef.current.scene.isActive('MainScene')) {
      console.log('GameReorganize: Deteniendo MainScene activa al cambiar tema.');
      phaserGameInstanceRef.current.scene.stop('MainScene');
    }
    
    // Detener InstructionScene si está activa
    if (phaserGameInstanceRef.current && phaserGameInstanceRef.current.scene.isActive('InstructionScene')) {
      console.log('GameReorganize: Deteniendo InstructionScene activa al cambiar tema.');
      phaserGameInstanceRef.current.scene.stop('InstructionScene');
    }
    
    // Reiniciar completamente el juego con el nuevo tema
    setShowOverlay(true);
    setCurrentIndex(0);
    gameHasBeenExplicitlyStartedRef.current = false;
    pendingNextActionRef.current = null;
    
    // Anunciar el cambio
    announce(`Tema cambiado a ${theme.name}. Presiona jugar para comenzar.`);
  }, []);

  // Handler para reiniciar el juego completamente
  const handleRestartGame = useCallback(() => {
    // Restablecer todos los estados del juego
    setShowOverlay(true);
    setCurrentIndex(0);
    
    // Resetear el tema al valor por defecto
    themeManager.reset();
    setNameTheme('Cocina'); // Establecer el tema por defecto
    
    gameHasBeenExplicitlyStartedRef.current = false;
    pendingNextActionRef.current = null;
    
    // Limpiar el anunciador
    announce("Juego reiniciado. Tema restablecido a Cocina. Puedes cambiar el tema y presionar jugar para comenzar.");
  }, []);

  useEffect(() => {
    if (!gameContainer.current || hasInitializedPhaser.current) {
      return;
    }
    const game = new PhaserGame({
      containerId,
      gameEvents,
      initialMuteState: isMuted,
    });
    phaserGameInstanceRef.current = game;
    hasInitializedPhaser.current = true;

    // --- Handlers de Eventos ---

    const preloadCompleteHandler = () => {
      if (!gameHasBeenExplicitlyStartedRef.current) setShowOverlay(true);
    };
    const phaserStartsGameHandler = () => setShowOverlay(false);


    // funcion para manejar la respuesta correcta
    const correctAnswerHandler = () => {
      const nextPotentialIndex = currentIndexRef.current + 1;

      if (nextPotentialIndex >= globalState.questions.length) {
        pendingNextActionRef.current = { type: "endGame" };
      } else {
        pendingNextActionRef.current = {
          type: "nextQuestion",
          questionIndex: nextPotentialIndex,
        };
      }
    };
 // Eventos para phaser
    gameEvents.on("preloadComplete", preloadCompleteHandler);
    gameEvents.on("phaserStartsGame", phaserStartsGameHandler);
    gameEvents.on("correctAnswer", correctAnswerHandler);
    gameEvents.on("restartGame", handleRestartGame);

    return () => {
      if (phaserGameInstanceRef.current) {
        phaserGameInstanceRef.current.destroy(true);
        phaserGameInstanceRef.current = null;
      }
      gameEvents.removeAllListeners();
      hasInitializedPhaser.current = false;
    };
  }, [containerId, gameEvents, handleRestartGame]);

  // handler para iniciar el juego
  const handleStartGame = useCallback(() => {
    gameHasBeenExplicitlyStartedRef.current = true;
    pendingNextActionRef.current = null;
    setCurrentIndex(0);
    if (globalState.questions.length > 0) {
      gameEvents.emit("startInstructions", { questionIndex: 0 });
    } else {
      console.error(
        "gameReorganize Error: No hay preguntas cargadas para iniciar el juego."
      );
    }
  }, [gameEvents]);


// handler para cambiar al sonido o mute
   const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newState = !prev;
      gameEvents.emit('toggleMute', newState);
      return newState;
    });
  }, [gameEvents]);

  // actualizar el texto del feedback

  useEffect(() => {
    if (
      currentIndex >= globalState.questions.length &&
      globalState.questions.length > 0
    ) {
      announce("¡Juego completado!, gracias por jugar.");
    }
  }, [currentIndex, initialQuestions.length]); // Depende de initialQuestions.length para re-evaluar si el total cambia

  // funcion para cambiar el tema del modal inicial
const handleChangeThemeForModal = () => {
  if(nameTheme === "Universo"){
     return (
      <div className="gameReorganize_question" id="gameReorganize-bg-initial">
        <div className="gameReorganize_question-container">
          <h2 className="gameReorganize_title">
            <span>R</span>
            <span>e</span>
            <span>o</span>
            <span>r</span>
            <span>g</span>
            <span>a</span>
            <span>n</span>
            <span>i</span>
            <span>z</span>
            <span>a</span>
            <br />
            <span>l</span>
            <span>a</span>
            <span>s</span>
            <br />
            <span>o</span>
            <span>r</span>
            <span>a</span>
            <span>c</span>
            <span>i</span>
            <span>o</span>
            <span>n</span>
            <span>e</span>
            <span>s</span>
          </h2>
          <button
            onClick={handleStartGame}
            aria-label="Haz click para jugar"
          >
                <span>▶︎</span>
          </button>
        </div>
      </div>
    );
  } else if(nameTheme === "Halloween"){
    return (
      <div className="gameReorganize_question" id="gameReorganize-bg-initial">
        <div className="gameReorganize_question-container">
          <h2 className="gameReorganize_title">
            <span>R</span>
            <span>e</span>
            <span>o</span>
            <span>r</span>
            <span>g</span>
            <span>a</span>
            <span>n</span>
            <span>i</span>
            <span>z</span>
            <span>a</span>
            <br />
            <span>l</span>
            <span>a</span>
            <span>s</span>
            <br />
            <span>o</span>
            <span>r</span>
            <span>a</span>
            <span>c</span>
            <span>i</span>
            <span>o</span>
            <span>n</span>
            <span>e</span>
            <span>s</span>
          </h2>
          <button
            onClick={handleStartGame}
            aria-label="Haz click para jugar"
          >
           <span>▶︎</span>
          </button>
        </div>
      </div>
    ); 
  } else { // por default sera cocina
    return (
      <div className="gameReorganize_question" id="gameReorganize-bg-initial">
        <div className="gameReorganize_question-container">
          <h2 className="gameReorganize_title">
            <span>R</span>
            <span>e</span>
            <span>o</span>
            <span>r</span>
            <span>g</span>
            <span>a</span>
            <span>n</span>
            <span>i</span>
            <span>z</span>
            <span>a</span>
            <br />
            <span>l</span>
            <span>a</span>
            <span>s</span>
            <br />
            <span>o</span>
            <span>r</span>
            <span>a</span>
            <span>c</span>
            <span>i</span>
            <span>o</span>
            <span>n</span>
            <span>e</span>
            <span>s</span>
          </h2>
          <button
            onClick={handleStartGame}
            aria-label="Haz click para jugar"
          >
           <span>▶︎</span>
          </button>
        </div>
      </div>
    );
  }
}

useEffect(() => {
const name = document.getElementById("gameReorganize-bg-initial");
const bgInitial = WORLD_THEMES.find((theme) => theme.name === nameTheme);

if(name) {
  if(nameTheme === "Universo") {
    name.style.backgroundImage = `url(${bgInitial?.assets?.images[0].path})`;
  } else if(nameTheme === "Halloween") {
    name.style.backgroundImage = `url(${bgInitial?.assets?.images[0].path})`;
  } else {
    // Usar Cocina como tema por defecto
    name.style.backgroundImage = "url(assets/game-reorganize-template/images/theme-kitchen/initial-bg.png)";
  }
}
}, [nameTheme, showOverlay])

  return (
    <>
      {/* Selector de temas */}
      <div className="theme-selector-container">
        <ThemeSelector
          onThemeChange={handleThemeChange}
          gameEvents={gameEvents}
        />
      </div>

      <div className="gameReorganize_container" id="gameReorganize-id">
        {/* Div oculto para anuncios ARIA Live */}
        <div
          id="game-announcer"
          aria-live="polite"
          aria-atomic="true"
          className="visually-hidden"
        ></div>
       {/* Btn de sonidos */}
        { !showOverlay && (
          <button
        id="game-reorganize-volume-button"
        aria-label={isMuted ? 'Activar sonido' : 'Desactivar sonido'}
        onClick={toggleMute}
        className={`game-reorganize-volume-button ${isMuted ? 'muted' : 'sound'}`}
      /> )} 
      {/* Modal del titulo */}
        { showOverlay && handleChangeThemeForModal()}

        <div ref={gameContainer} id={containerId} tabIndex={-1} /> {/* JUEGO */}
      </div>
    </>
  );
};
