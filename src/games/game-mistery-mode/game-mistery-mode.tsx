import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';

import { EventBus, GAME_EVENTS } from './event-bus';
import StartGame from './main';

import styles from './styles/game-mistery-mode.module.css';

export interface IRefGameMisteryMode {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export type GameDataMisteryMode = {
  id: number;
  tracks: { name: string; text: string }[];
  answer: string;
  detail: string;
};

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  gameData: GameDataMisteryMode[];
  onResult?: (result: boolean) => void;
}

export const GameMisteryMode = forwardRef<IRefGameMisteryMode, IProps>(function GameMisteryMode(
  { currentActiveScene, gameData, onResult },
  ref
) {
  const game = useRef<Phaser.Game | null>(null!);

  useLayoutEffect(() => {
    if (game.current === null) {
      game.current = StartGame('game-mistery-mode');

      game.current.registry.set('game-data', gameData);

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
  }, [ref, gameData]);

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

  return (
    <div className={styles['game-mistery-mode']}>
      <div id="game-mistery-mode"></div>
    </div>
  );
});
