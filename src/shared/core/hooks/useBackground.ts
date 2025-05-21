import { useEffect, useState } from 'react';

export const useBackground = (): [string | null, (image: string) => void] => {
  const [background, setBackground] = useState<string | null>(null);

  useEffect(() => {
    if (!background) return;
    const parentElement = document.body as HTMLElement;
    parentElement?.style.setProperty('--bg-image', `url(${background})`);

    return () => {
      parentElement?.style.removeProperty('--bg-image');
    };
  }, [background]);

  return [background, setBackground];
};
