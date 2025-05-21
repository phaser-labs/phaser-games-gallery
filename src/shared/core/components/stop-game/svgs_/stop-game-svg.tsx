/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useId, useState } from 'react';

import { Button } from '@/shared/ui/components';

import { FullScreenAlert } from '../../fullscreen-alert';
import { FullScreenButton } from '../../fullscreen-button';
import { useStopGame } from '../stop-game-context';
import { StopGameRadio } from '../stop-game-radio';

import css from '../stop-game.module.css';

interface Option {
  id: string;
  label: string;
  value: string;
  name: string;
}

interface Props {
  options: Option[];
  question: React.ReactNode;
  onResult: (result: string | null) => void;
}

enum selectedOption {
  'success',
  'wrong'
}

export const StopGameSvg = ({ options, question, onResult }: Props) => {
  const uuid = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<boolean | null>(null);

  const [disabledElement, setDisabledElement] = useState({
    reset: true,
    validate: true,
    input: false
  });

  const { listStop, updateListStop, adduuidList } = useStopGame();

  useEffect(() => {
    adduuidList(uuid);
  }, [uuid]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.value);
    setSelectedId(event.target.id);

    setDisabledElement((prev) => ({ ...prev, validate: false }));
  };

  const handleValidate = () => {
    const selection = selected === selectedOption[selectedOption.success];

    setDisabledElement((prev) => ({ ...prev, validate: true, input: true, reset: selection }));

    if (selection) {
      updateListStop(uuid);
    }

    setSelectedState(selection);

    onResult(selected);
  };

  const handleReset = () => {
    setSelected(null);
    setSelectedId(null);
    setSelectedState(null);

    setDisabledElement((prev) => ({ ...prev, validate: true, input: false, reset: true }));
  };

  return (
    <div id="stop-game" style={{ overflow: 'auto' }}>
      <FullScreenAlert />
      <FullScreenButton elementId="stop-game" />
      <svg
        id="svg-stop-game"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 1067 500"
        xmlSpace="preserve">
        <style>
          {
            '#svg-stop-game .st1{display:none}#svg-stop-game .st11{fill:none}#svg-stop-game .st12{fill:#fff}#svg-stop-game .st14{font-size:66.4636px}'
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

        <image
          width={704}
          height={501}
          xlinkHref="assets/images/ova-38-sld-13-pista.webp"
          transform="translate(-.84 -.671)"
          overflow="visible"
          id="Fondo_ilustrado_solo"
        />

        <image
          width={93}
          height={91}
          xlinkHref="assets/images/ova-38-sld-13-04.webp"
          transform="translate(11.445 255.578) scale(.9945)"
          overflow="visible"
          id="Bot\xF3n_1"
        />
        <image
          width={93}
          height={92}
          xlinkHref="assets/images/ova-38-sld-13-05.webp"
          transform="translate(299.308 207.588) scale(.9892)"
          overflow="visible"
          id="Bot\xF3n_2"
        />
        <image
          width={93}
          height={92}
          xlinkHref="assets/images/ova-38-sld-13-06.webp"
          transform="translate(499.521 83.971) scale(.9892)"
          overflow="visible"
          id="Bot\xF3n_3"
        />
        <image
          width={92}
          height={92}
          xlinkHref="assets/images/ova-38-sld-13-07.webp"
          transform="translate(15.17 79.567) scale(.9891)"
          overflow="visible"
          id="Bot\xF3n_4"
        />
        <g id="_x31_">
          <path className="st11" d="M15.6 275.8H98.89999999999999V330.5H15.6z" />
          <text transform="translate(44.218 325.106)" className="st12 st13 st14">
            {'1'}
          </text>
        </g>
        <g id="_x32_">
          <path className="st11" d="M304.4 226H387.7V280.7H304.4z" />
          <text transform="translate(326.516 275.272)" className="st12 st13 st14">
            {'2'}
          </text>
        </g>
        <g id="_x33_">
          <path className="st11" d="M503.4 104.4H586.6999999999999V159.10000000000002H503.4z" />
          <text transform="translate(525.408 153.752)" className="st12 st13 st14">
            {'3'}
          </text>
        </g>
        <g id="_x34_">
          <path className="st11" d="M16.7 96.7H100V151.4H16.7z" />
          <text transform="translate(35.5 146.039)" className="st12 st13 st14">
            {'4'}
          </text>
        </g>

        {/* Paradas */}

        <image
          width={53}
          height={91}
          transform="matrix(.987 0 0 .987 110.038 298.682)"
          overflow="visible"
          xlinkHref={listStop[0] ? 'assets/images/ova-38-sld-13-10.webp' : 'assets/images/ova-38-sld-13-09.webp'}
          id="Capa_26"
          className={!listStop[0] ? css['move-image'] : ''}
        />

        <image
          width={53}
          height={91}
          transform="matrix(.987 0 0 .987 407.24 210.95)"
          overflow="visible"
          xlinkHref={listStop[1] ? 'assets/images/ova-38-sld-13-10.webp' : 'assets/images/ova-38-sld-13-09.webp'}
          id="Capa_25"
          className={!listStop[1] ? css['move-image'] : ''}
        />
        <image
          width={53}
          height={91}
          transform="matrix(.987 0 0 .987 601.211 81.027)"
          overflow="visible"
          xlinkHref={listStop[2] ? 'assets/images/ova-38-sld-13-10.webp' : 'assets/images/ova-38-sld-13-09.webp'}
          id="Capa_27"
          className={!listStop[2] ? css['move-image'] : ''}
        />

        <image
          width={54}
          height={86}
          xlinkHref={listStop[3] ? 'assets/images/ova-38-sld-13-10.webp' : 'assets/images/ova-38-sld-13-09.webp'}
          transform="translate(107.725 55.52) scale(.9864)"
          overflow="visible"
          id="Capa_24_1_"
          className={!listStop[3] ? css['move-image'] : ''}
        />

        <foreignObject x={690} y={92} width={400} height={600} style={{ overflow: 'visible' }}>
          <div className={css['radio-wrapper']}>
            {options.map(({ label, id, value, name }) => (
              <StopGameRadio
                data-state={
                  selectedId === id && selectedState !== null ? (selectedState ? 'correct' : 'incorrect') : ''
                }
                id={id}
                key={id}
                onChange={handleChange}
                label={label}
                value={value}
                name={name}
                disabled={disabledElement.input}
              />
            ))}
          </div>
        </foreignObject>

        <foreignObject x="65" y="390" width={600} height={200} style={{ overflow: 'visible' }}>
          <div className={css['stop-game-container-question']}>{question}</div>
        </foreignObject>
      </svg>

      <div className={css['stop-game-buttons']}>
        <Button disabled={disabledElement.validate} onClick={handleValidate} label="Comprobar" />
        <Button onClick={handleReset} disabled={disabledElement.reset} label="Reintentar" />
      </div>
    </div>
  );
};
