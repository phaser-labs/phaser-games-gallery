import css from './stop-game.module.css';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  id: string;
}

export const StopGameRadio = ({ label, name, id, onChange, ...props }: Props) => {
  return (
    <div className={css['radio-input']}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="radio" name={name} onChange={onChange} {...props} />
    </div>
  );
};
