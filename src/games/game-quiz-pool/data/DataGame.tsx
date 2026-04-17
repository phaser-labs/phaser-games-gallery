import type { Quiz } from "@game/types/AppTypes";
export const quizCulturaGeneral: Quiz[] = [
  {
    id: 1,
    pregunta: '¿Cuál es el planeta más grande del sistema solar?',
    opciones: [
      {
        id: 1,
        texto:
          'Marte',
        correcta: false
      },
      { id: 2, texto: 'Venus', correcta: false },
      { id: 3, texto: 'Saturno', correcta: false },
      { id: 4, texto: 'Júpiter', correcta: true },
      { id: 5, texto: 'Neptuno', correcta: false },
      { id: 6, texto: 'Mercurio', correcta: false }
    ]
  },
  {
    id: 2,
    pregunta: '¿En qué país se encuentran las pirámides de Giza?',
    opciones: [
      { id: 1, texto: 'México', correcta: false },
      { id: 2, texto: 'Perú', correcta: false },
      { id: 3, texto: 'Egipto', correcta: true },
      { id: 4, texto: 'India', correcta: false },
      { id: 5, texto: 'Grecia', correcta: false },
      { id: 6, texto: 'Turquía', correcta: false }
    ]
  }
  // {
  //   id: 3,
  //   pregunta: '¿Quién pintó la Mona Lisa?',
  //   opciones: [
  //     { id: 1, texto: 'Pablo Picasso', correcta: false },
  //     { id: 2, texto: 'Vincent van Gogh', correcta: false },
  //     { id: 3, texto: 'Miguel Ángel', correcta: false },
  //     { id: 4, texto: 'Leonardo da Vinci', correcta: true },
  //     { id: 5, texto: 'Salvador Dalí', correcta: false },
  //     { id: 6, texto: 'Claude Monet', correcta: false }
  //   ]
  // },
  // {
  //   id: 4,
  //   pregunta: '¿Cuál es el océano más grande del mundo?',
  //   opciones: [
  //     { id: 1, texto: 'Océano Atlántico', correcta: false },
  //     { id: 2, texto: 'Océano Índico', correcta: false },
  //     { id: 3, texto: 'Océano Ártico', correcta: false },
  //     { id: 4, texto: 'Océano Antártico', correcta: false },
  //     { id: 5, texto: 'Océano Pacífico', correcta: true },
  //     { id: 6, texto: 'Mar Mediterráneo', correcta: false }
  //   ]
  // },
  // {
  //   id: 5,
  //   pregunta: '¿Cuántos continentes hay en la Tierra?',
  //   opciones: [
  //     { id: 1, texto: '5', correcta: false },
  //     { id: 2, texto: '6', correcta: false },
  //     { id: 3, texto: '7', correcta: true },
  //     { id: 4, texto: '8', correcta: false },
  //     { id: 5, texto: '4', correcta: false },
  //     { id: 6, texto: '9', correcta: false }
  //   ]
  // },
  // {
  //   id: 6,
  //   pregunta: '¿Cuál es el idioma más hablado en el mundo por número de hablantes nativos?',
  //   opciones: [
  //     { id: 1, texto: 'Inglés', correcta: false },
  //     { id: 2, texto: 'Español', correcta: false },
  //     { id: 3, texto: 'Hindi', correcta: false },
  //     { id: 4, texto: 'Árabe', correcta: false },
  //     { id: 5, texto: 'Mandarín', correcta: true },
  //     { id: 6, texto: 'Francés', correcta: false }
  //   ]
  // },
  // {
  //   id: 7,
  //   pregunta: '¿Qué gas necesitan las plantas para realizar la fotosíntesis?',
  //   opciones: [
  //     { id: 1, texto: 'Oxígeno', correcta: false },
  //     { id: 2, texto: 'Nitrógeno', correcta: false },
  //     { id: 3, texto: 'Helio', correcta: false },
  //     { id: 4, texto: 'Dióxido de carbono', correcta: true },
  //     // { id: 5, texto: 'Hidrógeno', correcta: false },
  //     // { id: 6, texto: 'Ozono', correcta: false }
  //   ]
  // }
];
