import { useEffect, useRef } from 'react';
import { Interpreter as InterpreterUI, Portal } from 'books-ui';

export const Interpreter = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const button = ref.current.querySelector('button.c-interpreter__float-button') as HTMLButtonElement | null;
    if (button) {
      button.tabIndex = 7;
    }
  }, []);

  return (
    <Portal id="js-interpreter">
      <div ref={ref}>
        <InterpreterUI />
      </div>
    </Portal>
  );
};
