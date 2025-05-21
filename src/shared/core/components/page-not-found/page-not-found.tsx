import css from './page-not-found.module.css';

interface Props {
  page: string;
}

export const PageNotFound: React.FC<Props> = ({ page }) => {
  return (
    <section>
      <div
        className={`${css['message-404']} u-flow u-text-center`}
        style={{ '--flow-space': '1rem' } as React.CSSProperties}>
        <h1>404</h1>
        <h2>Not found</h2>
        <p>
          Sorry the page <strong>"{page}"</strong> doesn't exist.
        </p>
      </div>
    </section>
  );
};
