import { useEffect, useRef } from 'react';

import { GlobalOptions, Questions} from "../../types/AppTypes"

import PhaserGame from './core/main'; // Importa el juego
import { globalState } from './core/utils/GlobalState'; // Importa el estado global

import './tapReveal.css';



/**
 * El componente GameCanvas sirve como contenedor para el juego de Phaser.
 * Inicializa la instancia del juego de Phaser y se asegura de limpiar correctamente al desmontar el componente.
 */
const TapReveal:React.FC= () => {
  const  globalOptions: GlobalOptions[] = [
  { id: 1, label: "Gato" },
  { id: 2, label: "Perro" },
  { id: 3, label: "Elefante" },
  { id: 4, label: "Tigre" },
  { id: 5, label: "Conejo" },
  { id: 6, label: "Pájaro" },
  { id: 7, label: "Caballo" },
  { id: 8, label: "Vaca" },

];
const questions: Questions[] = [
  {
    id: 101,
    image: "assets/images/imgPrueba/gato.png",
    altImage: "figura animada de un gato",
    key: "gato",
    answerId: 1
  },
  {
    id: 102,
    image: "assets/images/imgPrueba/perro.png",
    altImage: "figura animada de un perro",
    key: "perro",
    answerId: 2
  },
  {
    id: 103,
    image: "assets/images/imgPrueba/elefante.png",
    altImage: "figura animada de un elefante",
    key: "elefante",
    answerId: 3
  }
];

    globalState.globalOptions = globalOptions;
    globalState.questions = questions;


  // Referencia al contenedor div para el juego
  const gameContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verifica si el contenedor del juego está disponible
    if (!gameContainer.current) return;

    // Crea una nueva instancia del juego de Phaser
    const game = new PhaserGame(gameContainer.current);

    // Función de limpieza para destruir la instancia del juego al desmontar el componente
    return () => {
      game.destroy(true);
    };
  }, []);

  // Renderiza el contenedor del juego
  return (
    <>
     <div
          id="game-announcer"
          aria-live="polite"
          aria-atomic="true"
          className="u-sr-only"
        ></div>
      <div
        className="tapReveal__container"
        aria-label="Este juego es una dinámica interactiva de adivinanza de imágenes ocultas. El jugador debe descubrir qué imagen se encuentra detrás del área oculta utilizando su intuición y las pistas disponibles. Dispone de tres ayudas especiales que solo pueden usarse una vez durante toda la ronda y una ayuda ilimitada que puede activarse tantas veces como se necesite, aunque cada uso resta 5 puntos del marcador. Por cada respuesta incorrecta, el sistema descuenta 10 puntos, por lo que la estrategia es clave para maximizar la puntuación. El objetivo es responder correctamente todas las imágenes del conjunto y obtener la máxima puntuación posible. ">
        <div ref={gameContainer} className="tapReveal__game-container" />
      </div>
    </>
  );
};

export default TapReveal;