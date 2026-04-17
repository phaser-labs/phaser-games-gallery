import { Advice } from "@/games/game-miau-farm/types/types";


export const CHALLENGE: Advice[] = [
  {
    id: "mesopotamia",
    title: "Mesopotamia",
    description: 'Es un hecho establecido hace demasiado tiempo que un lector se distraerá con el contenido del texto de un sitio mientras que mira su diseño. El punto de usar Lorem Ipsum es que tiene una distribución más o menos normal de las letras, al contrario de usar textos como por ejemplo "Contenido aquí, contenido aquí". Estos textos hacen parecerlo un español que se puede leer. Muchos paquetes de autoedición y editores de páginas web usan el Lorem Ipsum como su texto por defecto, y al hacer una búsqueda de "Lorem Ipsum" va a dar por resultado muchos sitios web que usan este texto si se encuentran en estado de desarrollo. Muchas versiones han evolucionado a través de los años, algunas veces por accidente, otras veces a propósito (por ejemplo insertándole humor y cosas por el estilo).',
    audio: {
      audioContent: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    }
  },
  {
    id: "egipto",
    title: "Antiguo Egipto",
    description: "Civilización famosa por sus pirámides, faraones y el río Nilo como fuente de vida.",
  },
  {
    id: "roma",
    title: "Imperio Romano",
    description: "Uno de los imperios más grandes de la historia, conocido por su arquitectura, leyes y ejército.",
    img: {
      src: "https://cdn.civitatis.com/italia/roma/galeria/mapa-imperio-romano.jpg",
      alt: "Imperio Romano",
    }
  },
  {
    id: "grecia",
    title: "Antigua Grecia",
    description: "Cuna de la democracia, la filosofía y los Juegos Olímpicos.",
  },
  {
    id: "china",
    title: "Antigua China",
    description: "Civilización milenaria que desarrolló inventos como el papel, la brújula y la pólvora.",
  }
];