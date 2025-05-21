import css from './loader.module.css';

export const Loader = ({ addClass }: { addClass?: string }) => {
  return <span className={`${css.loader} ${addClass ?? ''}`}></span>;
};
