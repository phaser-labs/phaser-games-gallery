import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

import PhaserGame from './main';

import css from './styles/space-typer.module.css';

interface SpaceTyperProps {
    gameId?: string;
}

export function SpaceTyperGame({ gameId }: SpaceTyperProps) {
    const gameContainer = useRef<HTMLDivElement>(null);

    const gameEvents = useRef(new Phaser.Events.EventEmitter()).current;
    const phaserGameInstanceRef = useRef<PhaserGame | null>(null);

    const containerId = `game-container-${gameId ?? 'default'}`;


    useEffect(() => {
        if (phaserGameInstanceRef.current) {
            phaserGameInstanceRef.current.destroy(true);
            phaserGameInstanceRef.current = null;
        }

        phaserGameInstanceRef.current = new PhaserGame({
            gameId: containerId,
            gameEvents
        });

        return () => {
            phaserGameInstanceRef.current?.destroy(true);
            phaserGameInstanceRef.current = null;
        };
    }, [containerId, gameEvents]);

    return (
        <>
            <div className={css['gameSpace_container']} id="game-space-typer-id">
                <div id="game-announcer" aria-live="polite" aria-atomic="true" className={css['visually-hidden']}></div>
                <div ref={gameContainer} id={containerId} tabIndex={-1} />
            </div>
        </>

    );
}
