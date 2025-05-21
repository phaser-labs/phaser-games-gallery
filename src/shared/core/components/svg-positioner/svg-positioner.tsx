import React, { createContext, ReactNode,useLayoutEffect, useRef, useState } from 'react';

import css from './svg-positioner.module.css';

// Definir el contexto con su tipo
interface SvgDimensions {
  width: number;
  height: number;
}

interface SvgPositionerContextType {
  dimensions: SvgDimensions;
}

export const SvgPositionerContext = createContext<SvgPositionerContextType>({
  dimensions: { width: 0, height: 0 }
});

// Tipos para las propiedades del componente SvgPositioner
interface Props {
  svgWidth?: string;
  svgHeight?: string;
  addClass?: string;
  maxWidth?: string;
  children: ReactNode; // Changed to support a wider variety of children types
}

export const SvgPositioner: React.FC<Props> = ({
  // svgWidth,
  // svgHeight,
  addClass = '', // Providing a default value for addClass
  maxWidth,
  children,
  ...props
}) => {
  const [dimensions, setDimensions] = useState<SvgDimensions>({
    width: 0,
    height: 0
  });

  const refContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const svg = refContainer.current?.querySelector('svg:first-child');
    
    if (svg) {
      const svgViewBox = svg.getAttribute('viewBox')?.split(' ') || [];
      const nextDimensions = {
        width: parseInt(svgViewBox[2], 10),
        height: parseInt(svgViewBox[3], 10)
      };
      setDimensions(nextDimensions);
    }
  }, []);

  return (
    <SvgPositionerContext.Provider value={{ dimensions }}>
      <div
        className={`${css.container} ${addClass}`}
        ref={refContainer}
        style={{
          '--svg-container-max-width': maxWidth,
          '--svg-width': `${dimensions.width}px`,
          '--svg-height': `${dimensions.height}px`
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    </SvgPositionerContext.Provider>
  );
};