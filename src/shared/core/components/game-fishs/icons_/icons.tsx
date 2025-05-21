import css from '../styles/level.module.css';

export const CorrectIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={
      {
        enableBackground: 'new 0 0 48.6 48.6'
      } as React.CSSProperties
    }
    viewBox="0 0 48.6 48.6"
    className={css.feedback}>
    <circle
      cx={24.3}
      cy={24.3}
      r={23.5}
      style={{
        fill: '#6f9c39',
        stroke: '#fff',
        strokeWidth: 1.6,
        strokeMiterlimit: 10
      }}
    />
    <path
      d="m5.2 25.2 17.7 13.1 15.9-27.4-19 17.6z"
      style={{
        fill: '#fff'
      }}
    />
  </svg>
);

export const WrongIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    id="Capa_1"
    x={0}
    y={0}
    style={
      {
        enableBackground: 'new 0 0 48.6 48.6'
      } as React.CSSProperties
    }
    viewBox="0 0 48.6 48.6"
    className={css.feedback}>
    <style>{'.st1{fill:#fff}'}</style>
    <g id="X">
      <circle
        cx={24.3}
        cy={24.3}
        r={23.5}
        style={{
          fill: '#bc4124',
          stroke: '#fff',
          strokeWidth: 1.6,
          strokeMiterlimit: 10
        }}
      />
      <path
        d="M35.9 35.9c-1 1-2.6 1-3.7 0L12.6 16.3c-1-1-1-2.6 0-3.7 1-1 2.6-1 3.7 0l19.6 19.6c1.1 1.1 1.1 2.7 0 3.7z"
        className="st1"
      />
      <path
        d="M12.7 35.9c1 1 2.6 1 3.7 0L36 16.3c1-1 1-2.6 0-3.7-1-1-2.6-1-3.7 0L12.7 32.2c-1 1.1-1 2.7 0 3.7z"
        className="st1"
      />
    </g>
  </svg>
);
