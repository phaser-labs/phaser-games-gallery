import '../styles/GameMaze.css';

export class Game extends Phaser.Scene {
  muros!: Phaser.Tilemaps.TilemapLayer;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  tileSize: number = 32;
  moving: boolean = false;
  gameOver: boolean = false;
  correctLetter!: string;
  enemies!: Phaser.Physics.Arcade.Group;
  validTiles!: { x: number; y: number }[];
  piso!: Phaser.Tilemaps.TilemapLayer;
  music!: Phaser.Sound.BaseSound;
  successSound!: Phaser.Sound.BaseSound;
  wrongSound!: Phaser.Sound.BaseSound;
  lostSound!: Phaser.Sound.BaseSound;
  hitSound!: Phaser.Sound.BaseSound;
  lives: number = 3;
  livesImages: Phaser.GameObjects.Image[] = [];
  isMuted: boolean = false;
  volumeButton!: Phaser.GameObjects.DOMElement;
  controlButton!: Phaser.GameObjects.DOMElement;
  preloadButton!: Phaser.GameObjects.DOMElement;
  dpad!: Phaser.GameObjects.DOMElement;
  gameEvents: Phaser.Events.EventEmitter;

  constructor(gameEvents: Phaser.Events.EventEmitter) {
    super('Game');
    this.gameEvents = gameEvents;
  }

  create(data: { correctLetter: string }) {
    this.loadSounds();
    this.createMap();
    this.createPlayer();
    this.setupInput();
    this.createLetter();
    this.createEnemies(10);
    this.createLivesUI();
    this.btnControl();
    this.btnPreload();
    this.btnVolume();
    this.createDpad();
    this.correctLetter = data.correctLetter.toUpperCase();

    this.gameEvents.on('showEndScene', () => {
      this.scene.start('End');
    });
  }

  update() {
    if (!this.gameOver) {
      this.handlePlayerMovement();
    }

    if (this.dpad && this.dpad.visible) {
      this.dpad.setPosition(this.player.x, this.player.y);
    }
  }

  createSound(key: string, volume: number = 0.25, loop: boolean = false): Phaser.Sound.BaseSound {
    return this.sound.add(key, { volume, loop });
  }

  loadSounds() {
    if (!this.music) {
      this.music = this.createSound('music', 0.25, true);
      this.music.play();
    } else if (!this.music.isPlaying) {
      this.music.play();
    }

    this.successSound = this.createSound('success');
    this.wrongSound = this.createSound('wrong');
    this.hitSound = this.createSound('hit');
    this.lostSound = this.createSound('lost');
  }

  btnControl() {
    this.controlButton = this.add.dom(752, 50).createFromHTML(`
      <style>
        .phaser-game-btn:focus {
          outline: 3px solid #ffd840;
          outline-offset: 2px;
          border-radius: 4px;
        }
      </style>
      <button 
        class="phaser-game-btn"
        style="
          width: 32px; 
          height: 32px; 
          background: url('assets/game-maze/img/control.png') no-repeat center; 
          background-size: contain; 
          border: none; 
          cursor: pointer;"
        aria-label="Ver controles"
        title="Controles"
      ></button>
    `);
    
    this.controlButton.addListener('click');
    this.controlButton.on('click', () => {
      if (!this.dpad) {
        this.createDpad();
      } else {
        this.dpad.setVisible(!this.dpad.visible);
      }
    });
  }

  btnPreload() {
    this.preloadButton = this.add.dom(688, 50).createFromHTML(`
      <button 
        class="phaser-game-btn"
        style="
          width: 32px; 
          height: 32px; 
          background: url('assets/game-maze/img/pregunta.png') no-repeat center; 
          background-size: contain; 
          border: none; 
          cursor: pointer;"
        aria-label="Ver pregunta"
        title="Ver pregunta"
      ></button>
    `);
    
    this.preloadButton.addListener('click');
    this.preloadButton.on('click', () => {
      this.dpad.destroy();
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.time.delayedCall(1000, () => {
        this.music.pause();
        this.scene.start('Preload');
      });
    });
  }

  btnVolume() {
    const isCurrentlyMuted = this.sound.mute;
    const initialTexture = isCurrentlyMuted ? 'assets/game-maze/img/volOff.png' : 'assets/game-maze/img/volOn.png';
    const initialLabel = isCurrentlyMuted ? 'Activar sonido' : 'Silenciar sonido';

    this.volumeButton = this.add.dom(624, 50).createFromHTML(`
      <button 
        id="vol-btn"
        class="phaser-game-btn"
        style="
          width: 32px; 
          height: 32px; 
          background: url('${initialTexture}') no-repeat center; 
          background-size: contain; 
          border: none; 
          cursor: pointer;"
        aria-label="${initialLabel}"
        title="Volumen"
      ></button>
    `);
    
    this.isMuted = isCurrentlyMuted;

    this.volumeButton.addListener('click');
    this.volumeButton.on('click', () => {
      this.isMuted = !this.isMuted;
      this.sound.mute = this.isMuted;
      
      const newTexture = this.isMuted ? 'assets/game-maze/img/volOff.png' : 'assets/game-maze/img/volOn.png';
      const newLabel = this.isMuted ? 'Activar sonido' : 'Silenciar sonido';

      const btnElement = this.volumeButton.getChildByID('vol-btn') as HTMLElement;
      if (btnElement) {
        btnElement.style.backgroundImage = `url('${newTexture}')`;
        btnElement.setAttribute('aria-label', newLabel);
      }
    });
  }

  createMap() {
    const map = this.add.tilemap('map');
    const tileset = map.addTilesetImage('dungeon', 'tileset');
    if (tileset) {
      this.piso = map.createLayer('piso', tileset)!;
      map.createLayer('piso2', tileset);
      this.muros = map.createLayer('muros', tileset)!;
      this.muros.setCollisionByProperty({ collides: true });
    }

    document.fonts.load('20px "PressStart2P"').then(() => {
      this.add.text(300, 40, 'GAME MAZE', {
        fontFamily: 'PressStart2P',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ffd840'
      });
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(400, 336, 'player');
    this.player.setDepth(1);
    this.createPlayerAnimations();
  }

  setupInput() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      // Agregar teclas WASD
      this.input.keyboard.addKeys('W,A,S,D');
    }
  }

  handlePlayerMovement() {
    if (this.moving) return;

    // Obtener las teclas WASD del input manager
    const keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    const keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    if (this.cursors.left.isDown || keyA.isDown) {
      this.tryMove(-1, 0, 'left');
    } else if (this.cursors.right.isDown || keyD.isDown) {
      this.tryMove(1, 0, 'right');
    } else if (this.cursors.up.isDown || keyW.isDown) {
      this.tryMove(0, -1, 'up');
    } else if (this.cursors.down.isDown || keyS.isDown) {
      this.tryMove(0, 1, 'down');
    } else {
      this.player.anims.play('turn', true);
    }
  }

  tryMove(dx: number, dy: number, animKey: string) {
    const newX = this.player.x + dx * this.tileSize;
    const newY = this.player.y + dy * this.tileSize;
    if (!this.muros.getTileAtWorldXY(newX, newY)) {
      this.moving = true;
      this.player.anims.play(animKey, true);
      this.tweens.add({
        targets: this.player,
        x: newX,
        y: newY,
        duration: 150,
        ease: 'Linear',
        onComplete: () => (this.moving = false)
      });
    }
  }

  createPlayerAnimations() {
    const animations = [
      { key: 'left', frames: { start: 7, end: 4 } },
      { key: 'right', frames: { start: 8, end: 11 } },
      { key: 'up', frames: { start: 12, end: 15 } },
      { key: 'down', frames: { start: 0, end: 3 } },
      { key: 'turn', frames: { start: 0, end: 0 } }
    ];
    animations.forEach(({ key, frames }) => {
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers('player', frames),
          frameRate: 10,
          repeat: -1
        });
      }
    });
  }

  createLetter() {
    const letters = [
      { x: 145, y: 177, key: 'A' },
      { x: 655, y: 177, key: 'B' },
      { x: 145, y: 495, key: 'C' },
      { x: 655, y: 495, key: 'D' }
    ];
    letters.forEach(({ x, y, key }) => {
      const letter = this.physics.add.sprite(x, y, key).setData('id', key);
      this.physics.add.overlap(this.player, letter, () => this.collectLetter(letter), undefined, this);
    });
  }

  collectLetter(letter: Phaser.Physics.Arcade.Sprite) {
    const letterId = letter.getData('id') as string;
    const selectedAnswer = letterId.toLowerCase();

    if (letterId === this.correctLetter) {
      this.moving = true;
      this.dpad.destroy();
      this.player.anims.play('turn');
      this.successSound.play(); // 🔄 MODIFICADO
      this.gameOver = true;
      // const success = this.add.dom(400, 300).createFromCache('success');
      this.gameEvents.emit('feedback-modal', { type: 'success', selectedAnswer });
      this.time.delayedCall(2000, () => {
        // success.destroy();
        this.music.pause();
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
          this.moving = false;
          // Reiniciar vidas y música para el siguiente nivel/pregunta
          this.lives = 3;
          this.createLivesUI();
          this.music.resume();
          this.gameEvents.emit('correctAnswer');
        });
      });
    } else {
      this.wrongSound.play(); // 🔄 MODIFICADO
      this.removeLife();
      // const wrong = this.add.dom(400, 300).createFromCache('wrong');
      this.gameEvents.emit('feedback-modal', { type: 'wrong', selectedAnswer });
      // this.time.delayedCall(2000, () => {
      //   wrong.destroy();
      // });
    }

    letter.destroy();
  }

  createEnemies(cantidad: number) {
    this.enemies = this.physics.add.group();
    this.validTiles = this.piso.layer.data
      .flat()
      .filter((t) => t.index !== -1)
      .map((t) => ({ x: t.pixelX, y: t.pixelY }));
    for (let i = 0; i < cantidad; i++) {
      const { x, y } = Phaser.Math.RND.pick(this.validTiles);
      const enemy = this.physics.add.sprite(x, y, 'enemy').setOrigin(0);
      enemy.setData('lastMove', null);
      enemy.setData('moveEvent', this.moveEnemy(enemy));
      this.enemies.add(enemy);
    }
    this.physics.add.collider(this.player, this.enemies, this.hitPlayer, undefined, this);
  }

  moveEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    return this.time.addEvent({
      delay: Phaser.Math.Between(500, 1000),
      loop: true,
      callback: () => {
        if (this.gameOver || Phaser.Math.FloatBetween(0, 1) < 0.1) return;
        const moves = [
          { x: enemy.x - this.tileSize, y: enemy.y },
          { x: enemy.x + this.tileSize, y: enemy.y },
          { x: enemy.x, y: enemy.y - this.tileSize },
          { x: enemy.x, y: enemy.y + this.tileSize }
        ].filter((m) => this.validTiles.some((t) => t.x === m.x && t.y === m.y));
        const lastMove = enemy.getData('lastMove');
        const filteredMoves = moves.filter((m) => !lastMove || m.x !== lastMove.x || m.y !== lastMove.y);
        const nextMove = Phaser.Math.RND.pick(filteredMoves);
        if (nextMove) {
          enemy.setData('lastMove', { x: enemy.x, y: enemy.y });
          this.tweens.add({
            targets: enemy,
            x: nextMove.x,
            y: nextMove.y,
            duration: 200,
            ease: 'Linear'
          });
        }
      }
    });
  }

  createLivesUI() {
    this.livesImages = [];
    for (let i = 0; i < this.lives; i++) {
      const life = this.add.image(30 + i * 40, 50, 'lives').setScrollFactor(0);
      this.livesImages.push(life);
    }
  }

  removeLife() {
    if (this.livesImages.length > 0) {
      const lifeImage = this.livesImages.pop();
      if (lifeImage) {
        lifeImage.destroy();
      }
    }

    if (this.livesImages.length === 0) {
      this.endGame();
    }
  }

  hitPlayer() {
    if (this.player.getData('hitCooldown')) return;
    this.moving = true;
    this.tweens.killTweensOf(this.player);
    this.player.body.enable = false;
    this.player.anims.play('turn');
    this.player.setPosition(400, 336);
    this.hitSound.play();
    this.player.setData('hitCooldown', true);
    this.removeLife();
    this.time.delayedCall(500, () => {
      this.player.setData('hitCooldown', false);
      this.player.body.enable = true;
      this.moving = false;
    });
    if (this.livesImages.length === 0) {
      this.endGame();
    }
  }

  endGame() {
    this.moving = true;
    this.dpad.destroy();
    this.player.anims.play('turn');
    this.player.setTint(0xff0000);
    this.music.pause();
    this.lostSound.play(); // 🔄 MODIFICADO
    this.gameOver = true;
    this.cameras.main.fadeOut(3000, 0, 0, 0);
    this.time.delayedCall(3000, () => {
      this.scene.start('Preload');
    });
    this.moving = false;
  }

  createDpad() {
    const html = `
      <div class="dpad-container" id="dpad">
        <div></div>
        <button class="btn-up">△</button>
        <div></div>
        <button class="btn-left">◁</button>
        <div></div>
        <button class="btn-right">▷</button>
        <div></div>
        <button class="btn-down">▽</button>
        <div></div>
      </div>
    `;

    this.dpad = this.add.dom(this.player.x, this.player.y).createFromHTML(html);
    this.dpad.setVisible(false);

    const element = this.dpad.node as HTMLElement;

    // Dirección actual activa
    let currentKey: keyof Phaser.Types.Input.Keyboard.CursorKeys | null = null;

    const pressDirection = (key: keyof Phaser.Types.Input.Keyboard.CursorKeys) => {
      currentKey = key;
      this.cursors[key].isDown = true;
    };

    const releaseDirection = (key: keyof Phaser.Types.Input.Keyboard.CursorKeys) => {
      if (this.cursors[key]) {
        this.cursors[key].isDown = false;
      }
      if (currentKey === key) {
        currentKey = null;
      }
    };

    const directions: (keyof Phaser.Types.Input.Keyboard.CursorKeys)[] = ['up', 'down', 'left', 'right'];

    directions.forEach((dir) => {
      const btn = element.querySelector(`.btn-${dir}`) as HTMLElement;
      if (btn) {
        btn.addEventListener('pointerdown', () => pressDirection(dir));
        btn.addEventListener('pointerup', () => releaseDirection(dir));
        btn.addEventListener('pointerout', () => releaseDirection(dir)); // Si el dedo/mouse se sale del botón
        btn.addEventListener('pointercancel', () => releaseDirection(dir));
      }
    });
  }
}
