import React, { useContext, useLayoutEffect, useState } from 'react';

import { SvgPositionerContext } from './svg-positioner';

import css from './svg-positioner.module.css';

interface SvgDimensions {
  height: number;
  width: number;
}

interface SvgPositionerContextType {
  dimensions: SvgDimensions;
}

interface BaseProps {
  top: number;
  left: number;
  width: number;
  height: number;
  addClass?: string;
  type?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
}

type SvgProps = BaseProps & React.SVGProps<SVGElement>;
type HtmlProps = BaseProps & React.HTMLProps<HTMLElement>;

type Props = SvgProps | HtmlProps;

export const SvgElement: React.FC<Props> = ({
  top,
  left,
  width,
  height,
  addClass = '',
  type = 'div',
  children,
  ...props
}) => {
  const { dimensions: svgDimensions } = useContext<SvgPositionerContextType>(SvgPositionerContext);

  const [dimensions, setDimensions] = useState({
    top: 0,
    left: 0,
    height: 0,
    width: 0
  });

  useLayoutEffect(() => {
    if (!svgDimensions.height && !svgDimensions.width) {
      return;
    }

    const nextDimensions = {
      top: (top / svgDimensions.height) * 100,
      left: (left / svgDimensions.width) * 100,
      width: (width / svgDimensions.width) * 100,
      height: (height / svgDimensions.height) * 100
    };
    setDimensions(nextDimensions);
  }, [svgDimensions, top, left, width, height]);

  if (!top || !left || !width || !height) {
    return (
      <p>
        Elemento no disponible. Agregar las propiedades{' '}
        <code>
          <b>top</b>
        </code>
        ,{' '}
        <code>
          <b>left</b>
        </code>
        ,{' '}
        <code>
          <b>width</b>
        </code>{' '}
        y{' '}
        <code>
          <b>height</b>
        </code>{' '}
        en el componente{' '}
        <code>
          <b>SvgElement</b>
        </code>
      </p>
    );
  }

  const ElementType = type as keyof JSX.IntrinsicElements;

  const commonProps = {
    className: `${css.element} ${addClass}`,
    style: {
      '--svg-element-x-position': `${dimensions.left}%`,
      '--svg-element-y-position': `${dimensions.top}%`,
      '--svg-element-width': `${dimensions.width}%`,
      '--svg-element-height': `${dimensions.height}%`
    } as React.CSSProperties
  };

  if (ElementType in React.createElement('svg').props) {
    return React.createElement(ElementType, { ...commonProps, ...(props as SvgProps) }, children);
  } else {
    return React.createElement(ElementType, { ...commonProps, ...(props as HtmlProps) }, children);
  }
};
