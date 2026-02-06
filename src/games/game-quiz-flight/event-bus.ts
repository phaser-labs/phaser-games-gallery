import { Events } from 'phaser';

export const GAME_EVENTS = {
  RESULT: 'quiz-result'
};

// Used to emit events between React components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
export const EventBus = new Events.EventEmitter();
