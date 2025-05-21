import { Panel as PanelUI } from 'books-ui';

import css from '../stop-game.module.css';

interface Props {
  textInitial: React.ReactNode;
}

export const SvgGameStopGameInitial = ({ textInitial }: Props) => {
  return (
    <svg
      id="svg-stop-game-initial"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 1067 500"
      xmlSpace="preserve">
      <style>
        {
          '#svg-stop-game-initial .st1{fill:none}#svg-stop-game-initial .st2{fill:#fff}#svg-stop-game-initial .st11{font-size:66.4636px}'
        }
      </style>
      <image
        width={1068}
        height={501}
        xlinkHref="assets/images/ova-38-sld-13-fondo-game.webp"
        transform="translate(-.84 -.671)"
        overflow="visible"
        id="Fondo_general"
      />
      <path fill="#2d2b56" id="Fondo_respuestas" d="M702.5 0H1067V500H702.5z" />
      <image
        width={704}
        height={501}
        xlinkHref="assets/images/ova-38-sld-13-pista.webp"
        transform="translate(-.84 -.671)"
        overflow="visible"
        id="Fondo_ilustrado_solo"
      />

      <foreignObject x="65" y="240" width={600} height={200}>
        <PanelUI.Button section={1}>
          <button className={css['stop-game-initial-button']}>Iniciar</button>
        </PanelUI.Button>
      </foreignObject>

      <foreignObject x="65" y="390" width={600} height={200}>
        <div className={css['stop-game-container-question']}>{textInitial}</div>
      </foreignObject>

      <g id="Contenedor_respuesta">
        <linearGradient
          id="SVGID_1_"
          gradientUnits="userSpaceOnUse"
          x1={722.8}
          y1={370.5}
          x2={1046.6006}
          y2={370.5}
          gradientTransform="matrix(1 0 0 -1 0 502)">
          <stop offset={0} stopColor="#35487d" />
          <stop offset={1} stopColor="#455ea1" />
        </linearGradient>
        <path
          d="M1018.1 226.6H751.4c-15.8 0-28.6-12.8-28.6-28.6V65c0-15.8 12.8-28.6 28.6-28.6H1018c15.8 0 28.6 12.8 28.6 28.6v133c.1 15.8-12.7 28.6-28.5 28.6z"
          fill="url(#SVGID_1_)"
          stroke="#fff"
          strokeWidth={2}
          strokeMiterlimit={10}
        />
      </g>

      <g id="Contenedor_respuesta_2" transform="translate(0, 220)">
        <linearGradient
          id="SVGID_2_"
          gradientUnits="userSpaceOnUse"
          x1={722.8}
          y1={370.5}
          x2={1046.6006}
          y2={370.5}
          gradientTransform="matrix(1 0 0 -1 0 502)">
          <stop offset={0} stopColor="#35487d" />
          <stop offset={1} stopColor="#455ea1" />
        </linearGradient>
        <path
          d="M1018.1 226.6H751.4c-15.8 0-28.6-12.8-28.6-28.6V65c0-15.8 12.8-28.6 28.6-28.6H1018c15.8 0 28.6 12.8 28.6 28.6v133c.1 15.8-12.7 28.6-28.5 28.6z"
          fill="url(#SVGID_2_)"
          stroke="#fff"
          strokeWidth={2}
          strokeMiterlimit={10}
        />
      </g>
    </svg>
  );
};
