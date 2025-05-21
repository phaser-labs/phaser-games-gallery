// Contiene los datos de las preguntas del juego, ademas de las opciones y respuestas correctas, asi como las recompensas que se obtienen al responder correctamente.
export const dataQuestions = [
 {
    id: "level-1",
    question: "Pregunta: Si 3x + 7 = 22. ¿Cuál es el valor de x?",
    options: ["a. 3", "b. 5", "c. 7", "d. 9"],
    optionsIndex: ["A", "B", "C", "D"],
    correctIndex: 1,
    reward: { 
      type: "potion",
      amount: 1, 
      description: "+1 Poción de Sabiduria"
    }
  },
  {
    id: "level-2",
    question: "¿Qué número sigue en la serie: 5, 10, 20, 40, ___?",
    options: ["a. 50", "b. 60", "c. 70", "d. 80"],
    optionsIndex: ["A", "B", "C", "D"],
    correctIndex: 3,
    reward: { 
      type: "potion", 
      amount: 1, 
      description: "+1 Poción de Elocuencia "
    }
  },
  {
    id: "level-3",
    question: "Juan tiene el doble de la edad de Pedro. Si Pedro tiene 12 años, ¿cuántos años tiene Juan?",
    options: ["a. 18", "b. 24", "c. 20", "d. 22"],
    optionsIndex: ["A", "B", "C", "D"],
    correctIndex: 1,
    reward: { 
      type: "potion", 
      amount: 1,  
      description: "+1 Poción de Percepción" 
    }
  },
  {
    id: "level-4",
    question: "Un pantalón cuesta $45 y tiene un descuento del 20%. ¿Cuál es su precio final?",
    options: ["a. $30", "b. $33", "c. $36", "d. $39"],
    optionsIndex: ["A", "B", "C", "D"],
    correctIndex: 2,
    reward: { 
      type: "potion", 
      amount: 1,    
      description: "+1 Poción de Comprensión"
    }
  },
  {
    id: "level-5",
    question: "Si 5 máquinas hacen 5 piezas en 5 minutos, ¿Cuánto tardarán 100 máquinas en hacer 100 piezas?",
    options: ["a. 5 minutos", "b. 10 minutos", "c. 100 minutos", "d. 500 minutos"],
    optionsIndex: ["A", "B", "C", "D"],
    correctIndex: 0,
    reward: { 
      type: "potion", 
      amount: 1, 
      description: "+1 Poción de Paciencia"
    }
  }
];

// Contiene el texto de los diálogos del juego
// Estructura: Objeto con categorías y diálogos
export const dialogs = {
  instruction: {
    tutorial: {
      text: [
        `¡Saludos, valiente aprendiz de arquero! 🏹Soy Althena, tu guía en el misterioso Reino Arcanum.
        En esta aventura, los sabios profesores te pondrán a prueba con sus preguntas.
        Cada respuesta correcta te dará pociones mágicas del conocimiento...`,
        `¡y con ellas te convertirás en el arquero más sabio del reino!
        Consulta siempre tu Manual del Arquero:
        Ahí encontrarás todos los secretos para apuntar y disparar.
        ¿Estás listo para tu primera lección?
        ¡El reino espera que te conviertas en un gran arquero!`,
      ],
    },
  },
  map: {
    indication: {
      text: [
        `Este es el mapa de nuestro Reino Arcanum, aprendiz de arquero. Para enfrentar 
        los desafíos de nuestros profesores, selecciona uno de los pergaminos haciendo clic sobre él. Prepara 
        bien tu arco y asegúrate de tener flechas suficientes. ¡Ja!
        ¡Buena suerte!`
      ],
    },
  },
  level1: {
    question: {
      text: [
        `Apreciado discípulo, yo soy Dhevon, guardiana del saber de Arcanum. Si tu mente halla la verdad que hoy te 
    planteo, con solo 1 pregunta que hacerte, no solo ganarás mi guía, sino también la luz de la sabiduría infinita, mi 
    poción. 📖 + 1`
      ]
    }
  },
  /* 
  level2: {
    question: {
      text: [
        `Ah, qué alegría recibir talento nuevo. Soy Bhirman, príncipe de Arcanum. Hoy tengo para ti un reto sencillo pero revelador: 1 
    sola pregunta. Respóndela con astucia, y te entregaré mi Poción de la Elocuencia.
    Créeme, es más útil que un buen cumplido… y casi igual de encantadora. ✒️ +1`
      ]
    }
  },
  level3: {
  question: {
  text: []
  }
 } */
};

export const feedbackTexts = {
  level1: {
    correct: "¡En el clavo! La sabiduría de Dhevon te sonríe.",
    incorrect: "Mmm, esa no era la respuesta que Dhevon esperaba.",
  },
  level2: {
    correct: "¡Elocuencia pura! Bhirman está impresionado.",
    incorrect: "Un intento interesante, pero no el correcto para Bhirman.",
  },
  default: { // Mensajes a usar si no hay específicos del nivel
    correct: "¡Correcto!",
    incorrect: "¡Incorrecto! Intenta de nuevo.",
  }
};