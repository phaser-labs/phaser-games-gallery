import { Question } from "@/games/game-verdictale/types/types";


export const QUESTIONS: Question[] = [
    {
        id: 'q1',
        statement: 'La Tierra es plana',
        correctAnswer: false,
        explanation: 'La Tierra es un esferoide oblato, ligeramente achatado en los polos.',
    },
    {
        id: 'q2',
        statement: 'El agua hierve a 100°C al nivel del mar',
        correctAnswer: true,
        explanation: 'A presión atmosférica estándar (nivel del mar), el agua hierve a 100°C.',
    },
    {
        id: 'q3',
        statement: 'Los humanos usan el 100% de su cerebro',
        correctAnswer: true,
        explanation: 'Es un mito que solo usamos el 10%. Usamos prácticamente todo el cerebro en diferentes momentos.',
    },
    {
        id: 'q4',
        statement: 'El sol es una estrella',
        correctAnswer: true,
        explanation: 'El sol es una estrella de tamaño medio en nuestra galaxia.',
    },
    {
        id: 'q5',
        statement: 'Los murciélagos son ciegos',
        correctAnswer: false,
        explanation: 'Los murciélagos pueden ver; además usan ecolocalización para orientarse.',
    }
];