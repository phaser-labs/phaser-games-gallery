import Phaser from 'phaser';
import { create } from 'zustand';

export type GameState = 'quieto' | 'jugando' | 'gameOver' | 'gameWin';

export interface GameManagerState {
  score: number;
  lives: number;
  gameState: GameState;
  isBossActive: boolean;
}

export const GAME_MANAGER_EVENTS = {
  SCORE_UPDATED: 'SCORE_UPDATED',
  LIVES_UPDATED: 'LIVES_UPDATED',
  GAME_STARTED: 'GAME_STARTED',
  GAME_OVER: 'GAME_OVER',
  GAME_WIN: 'GAME_WIN',
  GAME_RESET: 'GAME_RESET',
} as const;

export const useGameManagerStore = create<GameManagerState>(() => ({
  score: 0,
  lives: 3,
  gameState: 'quieto',
  isBossActive: false,
}));

class GameManager extends Phaser.Events.EventEmitter {
  private static instance: GameManager | null = null;

  private constructor() {
    super();
  }

  static getInstance(): GameManager {
    if (GameManager.instance === null) {
      GameManager.instance = new GameManager();
    }

    return GameManager.instance;
  }

  getScore(): number {
    return useGameManagerStore.getState().score;
  }

  getLives(): number {
    return useGameManagerStore.getState().lives;
  }

  getGameState(): GameState {
    return useGameManagerStore.getState().gameState;
  }

  startGame(): void {
    useGameManagerStore.setState({
      score: 0,
      lives: 3,
      gameState: 'jugando',
      isBossActive: false,
    });

    this.emit(GAME_MANAGER_EVENTS.GAME_STARTED);
    this.emit(GAME_MANAGER_EVENTS.SCORE_UPDATED, 0);
    this.emit(GAME_MANAGER_EVENTS.LIVES_UPDATED, 3);
  }

  addScore(points: number): void {
    if (useGameManagerStore.getState().gameState !== 'jugando') {
      return;
    }

    const nextScore = useGameManagerStore.getState().score + points;

    useGameManagerStore.setState({ score: nextScore });
    this.emit(GAME_MANAGER_EVENTS.SCORE_UPDATED, nextScore);
  }

  loseLife(): void {
    if (useGameManagerStore.getState().gameState !== 'jugando') {
      return;
    }

    const nextLives = Math.max(0, useGameManagerStore.getState().lives - 1);

    useGameManagerStore.setState({ lives: nextLives });
    this.emit(GAME_MANAGER_EVENTS.LIVES_UPDATED, nextLives);

    if (nextLives === 0) {
      this.setGameOver();
    }
  }

  setGameOver(): void {
    if (useGameManagerStore.getState().gameState === 'gameOver') {
      return;
    }

    const finalScore = useGameManagerStore.getState().score;

    useGameManagerStore.setState({ gameState: 'gameOver' });
    this.emit(GAME_MANAGER_EVENTS.GAME_OVER, finalScore);
  }

  setGameWin(): void {
    if (useGameManagerStore.getState().gameState === 'gameWin') {
      return;
    }

    const finalScore = useGameManagerStore.getState().score;

    useGameManagerStore.setState({ gameState: 'gameWin' });
    this.emit(GAME_MANAGER_EVENTS.GAME_WIN, finalScore);
  }

  setBossActive(isActive: boolean): void {
    useGameManagerStore.setState({ isBossActive: isActive });
  }

  reset(): void {
    useGameManagerStore.setState({
      score: 0,
      lives: 3,
      gameState: 'quieto',
      isBossActive: false,
    });

    this.emit(GAME_MANAGER_EVENTS.SCORE_UPDATED, 0);
    this.emit(GAME_MANAGER_EVENTS.LIVES_UPDATED, 3);
    this.emit(GAME_MANAGER_EVENTS.GAME_RESET);
  }
}

export default GameManager;