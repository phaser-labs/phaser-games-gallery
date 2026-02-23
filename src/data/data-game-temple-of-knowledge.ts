import { Question } from "@/games/game-temple-of-knowledge/types/types";

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "¿Cuál es la unidad de fuerza?",
    options: [
      { id: "A", text: "Newton", correct: true },
      { id: "B", text: "Joule", correct: false },
      { id: "C", text: "KiloNewton", correct: false },
      { id: "D", text: "Pound", correct: false },
    ],
  },
  {
    id: 2,
    text: "¿Qué significa HTML?",
    options: [
      { id: "A", text: "HyperText Markup Language", correct: true },
      { id: "B", text: "HighText Machine Language", correct: false },
      { id: "C", text: "HyperTool Multi Language", correct: false },
      { id: "D", text: "Home Tool Markup Language", correct: false },
    ],
  },
  {
    id: 3,
    text: "¿Cuál es la fórmula del área de un círculo?",
    options: [
      { id: "A", text: "A = 2πr", correct: false },
      { id: "B", text: "A = πr²", correct: true },
      { id: "C", text: "A = r²", correct: false },
      { id: "D", text: "A = πd", correct: false },
    ],
  },
  {
    id: 4,
    text: "¿Qué es una base de datos relacional?",
    options: [
      { id: "A", text: "Una base que solo guarda imágenes", correct: false },
      { id: "B", text: "Un sistema que organiza datos en tablas relacionadas", correct: true },
      { id: "C", text: "Un archivo de texto con datos", correct: false },
      { id: "D", text: "Un servidor para ejecutar videojuegos", correct: false },
    ],
  },
  {
    id: 5,
    text: "¿Qué significa CSS?",
    options: [
      { id: "A", text: "Computer Style Sheets", correct: false },
      { id: "B", text: "Cascading Style Sheets", correct: true },
      { id: "C", text: "Creative Styling System", correct: false },
      { id: "D", text: "Code Styling Syntax", correct: false },
    ],
  },
  {
    id: 6,
    text: "¿Cuál de estos es un tipo de dato en JavaScript?",
    options: [
      { id: "A", text: "String", correct: true },
      { id: "B", text: "Compile", correct: false },
      { id: "C", text: "Package", correct: false },
      { id: "D", text: "Runtime", correct: false },
    ],
  },
  {
    id: 7,
    text: "¿Para qué sirve Git?",
    options: [
      { id: "A", text: "Para crear diseños en CSS", correct: false },
      { id: "B", text: "Para controlar versiones de un proyecto", correct: true },
      { id: "C", text: "Para ejecutar bases de datos", correct: false },
      { id: "D", text: "Para compilar HTML", correct: false },
    ],
  },
];
