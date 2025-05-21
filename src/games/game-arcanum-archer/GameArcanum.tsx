import { GameCanvas } from './components/GameCanvas';
import { DialogCollection, FeedbackCollection, Question } from './game/utils/types/type';

import './game/utils/global.css';
interface GameProps {
    dialogs?: DialogCollection;
    data: Question[];
    id: string;
    feedbacks?: FeedbackCollection;
  }
 
  export const GameArcanumArcher: React.FC<GameProps> = ({ dialogs, data, id, feedbacks }) => {

  return (
      <GameCanvas dialogs={dialogs} data={data} id={id} feedbacks={feedbacks} />
  )
}


