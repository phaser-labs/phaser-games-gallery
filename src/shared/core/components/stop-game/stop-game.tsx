import { useRef, useState } from 'react';

interface PropsStopGame {
  children: React.ReactNode;
}
import { StopGameContextProvider } from './stop-game-context';

export const GameStopProvider = ({ children }: PropsStopGame) => {
  const [listStop, setLisStop] = useState<(string | null)[]>([]);

  const uuidList = useRef<string[]>([]);

  const adduuidList = (id: string) => {
    if (!uuidList.current.includes(id)) {
      uuidList.current.push(id);
    }
  };

  const updateListStop = (value: string) => {
    setLisStop((prev) => {
      const uuidIndex = uuidList.current.findIndex((id) => id === value);

      if (uuidIndex < 0) return prev;

      if (prev.length === 0) {
        const newArray = Array.from({ length: uuidList.current.length }, () => null) as (string | null)[];
        newArray[uuidIndex] = value;
        return newArray;
      }

      prev[uuidIndex] = value;

      return prev;
    });
  };

  return (
    <StopGameContextProvider value={{ listStop, updateListStop, adduuidList }}>{children}</StopGameContextProvider>
  );
};
