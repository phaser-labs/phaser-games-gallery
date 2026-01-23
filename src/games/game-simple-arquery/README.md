# GameSimpleArquery - Componente React Puro

Componente autocontenido para el juego del Arquero (Phaser + React).

## 🎯 Características

- **Componente puro**: No requiere contextos ni providers externos
- **Plug & Play**: Solo necesitas `questions` y un callback `onResult`
- **Autocontenido**: Toda la lógica de Phaser está encapsulada
- **Comunicación simple**: Un solo callback para manejar resultados

## 📦 Instalación

```tsx
import { GameSimpleArquery, GameResult, Question } from '@/games/game-simple-arquery';
```

## 🚀 Uso Básico

```tsx
import { GameSimpleArquery, GameResult } from '@/games/game-simple-arquery';

function MiJuego() {
  const handleResult = (result: GameResult) => {
    console.log('¿Correcto?', result.isCorrect);
    console.log('Pregunta:', result.question.question);
    console.log('Respuesta seleccionada:', result.selectedAnswer);
    console.log('Respuesta correcta:', result.correctAnswer);
    
    // Aquí manejas tu lógica de UI (modales, audios, etc.)
    if (result.isCorrect) {
      showSuccessModal();
    } else {
      showErrorModal();
    }
  };

  const questions = [
    {
      question: '¿Cuál es la capital de Francia?',
      options: { 
        a: 'Londres', 
        b: 'París', 
        c: 'Berlín', 
        d: 'Madrid' 
      },
      correctAnswer: 'b',
      feedback: {
        successAudio: '/assets/audios/success.mp3',
        wrongAudio: '/assets/audios/error.mp3',
        correctText: '¡Correcto! París es la capital.',
        incorrectText: 'Incorrecto. Intenta de nuevo.'
      }
    }
  ];

  return (
    <GameSimpleArquery 
      questions={questions}
      onResult={handleResult}
    />
  );
}
```

## 📝 Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `questions` | `Question[]` | Array de preguntas del juego |
| `onResult` | `(result: GameResult) => void` | Callback ejecutado al responder |
| `gameId` | `string` (opcional) | ID único para múltiples instancias |

## 🎮 Tipos

### GameResult

```typescript
interface GameResult {
  isCorrect: boolean;        // ¿La respuesta fue correcta?
  questionIndex: number;     // Índice de la pregunta actual
  selectedAnswer?: string;   // Respuesta seleccionada ('a', 'b', 'c', 'd')
  correctAnswer: string;     // Respuesta correcta ('a', 'b', 'c', 'd')
  question: Question;        // Objeto completo de la pregunta
}
```

### Question

```typescript
interface Question {
  question: string;
  options: {
    a: string;
    b: string;
    c?: string;
    d?: string;
  };
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  feedback?: {
    successAudio: string;
    wrongAudio: string;
    correctText: string;
    incorrectText: string;
  };
}
```

## 💡 Ejemplo Completo con Modales

Ver [GameArquery.tsx](../../pages/GameArquery.tsx) para un ejemplo completo de integración con modales de feedback.

## 🎨 Personalización

El componente incluye UI básica (botón de inicio, contador, mute). Si deseas personalizarla:

1. Modifica los estilos en [GameArquery.css](./styles/GameArquery.css)
2. O sobrescribe las clases CSS en tu proyecto

## 🔧 Flujo de Funcionamiento

1. Usuario hace clic en "Iniciar"
2. Phaser muestra la primera pregunta con objetivos
3. Usuario dispara una flecha a un objetivo
4. Se ejecuta `onResult` con la información de la respuesta
5. El padre maneja la UI (modales, sonidos, etc.)
6. El juego avanza automáticamente a la siguiente pregunta (si fue correcta)
7. Se repite hasta completar todas las preguntas

## ⚠️ Notas Importantes

- El componente NO muestra modales de feedback (eso lo hace el padre)
- La progresión a la siguiente pregunta es automática después de una respuesta correcta
- Las respuestas incorrectas no avanzan, el usuario debe intentar de nuevo
- Toda la lógica visual de feedback debe manejarse en el callback `onResult`
