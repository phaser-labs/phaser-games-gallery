export const createPlayerAnims = (anims: Phaser.Animations.AnimationManager): void => {
  // --- Animaciones del Jugador ---;
  anims.create({
    key: 'player_climb',
    frames: anims.generateFrameNames('atlas', {
      prefix: 'player-climb/player-climb-', // El prefijo exacto del "filename"
      start: 1, // El número del primer frame
      end: 4 // El número del último frame
    }),
    frameRate: 8, // Ajusta el frameRate a lo que se vea bien
    repeat: -1 // -1 para bucle infinito
  });

  anims.create({
    key: 'player_duck',
    frames: anims.generateFrameNames('atlas', {
      prefix: 'player-duck/player-duck-',
      start: 1,
      end: 4
    }),
    frameRate: 10,
    repeat: -1
  });

  anims.create({
    key: 'player_fall',
    frames: anims.generateFrameNames('atlas', {
      prefix: 'player-fall/player-fall-',
      start: 1,
      end: 4
    }),
    frameRate: 10,
    repeat: -1
  });

  anims.create({
    key: 'player_hurt',
    frames: anims.generateFrameNames('atlas', {
      prefix: 'player-hurt/player-hurt-',
      start: 2,
      end: 2
    }),
    frameRate: 12,
    repeat: -1
  });

  anims.create({
    key: 'player_idle',
    frames: anims.generateFrameNames('atlas', {
      prefix: 'player-idle/player-idle-',
      start: 1,
      end: 9
    }),
    frameRate: 6,
    repeat: -1
  });

  anims.create({
    key: 'player_jump',
    frames: anims.generateFrameNames('atlas', {
      prefix: 'player-jump/player-jump-',
      start: 1,
      end: 4
    }),
    frameRate: 10,
    repeat: 0
  });

  anims.create({
    key: 'player-skip',
    frames: anims.generateFrameNames('atlas', {
      prefix: 'player-skip/player-skip-',
      start: 1,
      end: 8
    }),
    frameRate: 12,
    repeat: -1
  });
};

export const createEnemyAnims = (anims: Phaser.Animations.AnimationManager): void => {
  // --- Animaciones del Enemigo Bee ---;
  anims.create({
    key: 'bee',
    frames: anims.generateFrameNames('atlas', {
      prefix: 'bee/bee-',
      start: 1,
      end: 8
    }),
    frameRate: 8,
    repeat: -1
  });

  // --- Animaciones del Enemigo Slug ---;
  anims.create({
    key: 'slug',
    frames: anims.generateFrameNames('atlas', {
      prefix: 'slug/slug-',
      start: 1,
      end: 4
    }),
    frameRate: 8,
    repeat: -1
  });
  // Animación IDLE para la Planta Piraña
  anims.create({
    key: 'piranha_idle',
    frames: anims.generateFrameNames('atlas', {
      // 'atlas' es la clave de tu atlas JSON
      prefix: 'piranha-plant/piranha-plant-',
      start: 1,
      end: 5 
    }),
    frameRate: 8, 
    repeat: -1 
  });

  // Animación de ATAQUE para la Planta Piraña
  anims.create({
    key: 'piranha_attack',
    frames: anims.generateFrameNames('atlas', {
      prefix: 'piranha-plant-attack/piranha-plant-attack-', 
      start: 1,
      end: 4 
    }),
    frameRate: 10,
    repeat: -1 
  });

};
