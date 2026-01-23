import { GameCanvas } from './components/GameCanvas';
import { DialogCollection, FeedbackCollection, Question } from './game/utils/types/type';

import './game/utils/global.css';

export interface GameResult {
  isCorrect: boolean;
  questionIndex: number;
  selectedAnswer: string;
  correctAnswer: string;
  question: string;
}

interface GameProps {
    dialogs?: DialogCollection;
    data: Question[];
    id: string;
    feedbacks?: FeedbackCollection;
    onResult?: (result: GameResult) => void;
  }
 
  export const GameArcanumArcher: React.FC<GameProps> = ({ dialogs, data, id, feedbacks, onResult }) => {

  return (
      <GameCanvas dialogs={dialogs} data={data} id={id} feedbacks={feedbacks} onResult={onResult} />
  )
}


