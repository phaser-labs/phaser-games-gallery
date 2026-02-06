import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';

import { Options } from './types/types';
import { EventBus, GAME_EVENTS } from './event-bus';
import StartGame from './main';

export interface IRefQuizFlight {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  options: Options[];
  onResult?: (result: boolean) => void;
}

export const QuizFlight = forwardRef<IRefQuizFlight, IProps>(function PhaserGame(
  { currentActiveScene, options, onResult },
  ref
) {
  const game = useRef<Phaser.Game | null>(null!);

  useLayoutEffect(() => {
    if (game.current === null) {
      game.current = StartGame('game-container');

      game.current.registry.set('questions', options);

      if (typeof ref === 'function') {
        ref({ game: game.current, scene: null });
      } else if (ref) {
        ref.current = { game: game.current, scene: null };
      }
    }

    return () => {
      if (game.current) {
        game.current.destroy(true);
        if (game.current !== null) {
          game.current = null;
        }
      }
    };
  }, [ref, options]);

  useEffect(() => {
    EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
      if (currentActiveScene && typeof currentActiveScene === 'function') {
        currentActiveScene(scene_instance);
      }

      if (typeof ref === 'function') {
        ref({ game: game.current, scene: scene_instance });
      } else if (ref) {
        ref.current = { game: game.current, scene: scene_instance };
      }
    });
    return () => {
      EventBus.removeListener('current-scene-ready');
    };
  }, [currentActiveScene, ref]);

  useEffect(() => {
    if (!onResult) return;

    const handler = (result: boolean) => {
      onResult(result);
    };

    EventBus.on(GAME_EVENTS.RESULT, handler);

    return () => {
      EventBus.off(GAME_EVENTS.RESULT, handler);
    };
  }, [onResult]);

  return <div id="game-container"></div>;
});
