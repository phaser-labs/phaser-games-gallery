import { CorrectIcon, WrongIcon } from './icons_/icons';

import css from './styles/level.module.css';

const scales = ['-1', '1'];

interface Props {
  answer: string;
  isPressed: boolean;
  fish: string;
  margin: string;
  onClick: (answer: string) => void;
  addClass?: string;
  isCorrect: boolean;
  isDisabled: boolean;
}

export const Fish: React.FC<Props> = ({
  answer,
  isPressed,
  isDisabled,
  isCorrect,
  fish,
  margin,
  onClick,
  addClass
}) => {
  const handleClick = () => {
    onClick?.(answer);
  };

  return (
    <button
      className={`${css.fish} ${addClass ?? ''}`}
      aria-label={answer}
      aria-pressed={isPressed}
      disabled={isDisabled}
      {...(isDisabled && { ['data-state']: isCorrect })}
      style={{
        top: `${35 + Math.random() * 40}%`,
        left: margin,
        animationDelay: Math.random() * 2 + 's'
      }}
      onClick={handleClick}>
      <img src={fish} style={{ transform: `scaleX(${scales[Math.round(Math.random())]})` }} alt={answer} />
      <p className={css.paragraph__fish}>{answer}</p>
      {isDisabled && isPressed ? isCorrect ? <CorrectIcon /> : <WrongIcon /> : null}
    </button>
  );
};
