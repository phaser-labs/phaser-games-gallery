import Phaser from 'phaser';

import { calcGuideWithCollision } from '../../../core/Guide';
import { bounceSegment, framesForDir, getDir, resolveElasticCollision } from '../../../core/Physics';
import { SOUND_KEYS, SoundManager } from '../../../core/Sounds';
import { Quiz } from '../../../types/AppTypes';
// import type {  } from '../../core/Constants';
import {
  ALL_SEGMENTS,
  BALL_VISUAL_RADIUS,
  BALL1_START_X,
  BALL1_START_Y,
  CUE_DRAG_MAX,
  CUE_HIT_SPEED,
  CUE_MAX_FORCE,
  CUE_PULLBACK,
  CUE_RETURN_SPEED,
  CUE_TIP_OFFSET,
  CueState,
  DIRS,
  FRAME_RATE,
  FRAME_RATE_MIN,
  FUNNEL_SEGMENTS,
  GUIDE_ALPHA_B1,
  GUIDE_ALPHA_MAX,
  GUIDE_LINE_W,
  POCKET_ANIM_MS,
  POCKETS,
  SPEED_MAX,
  WALL_SEGMENTS,
  WHITE_BALL_START_X,
  WHITE_BALL_START_Y
} from '../Constants';
import {
  animateQuestionChange,
  createAllPocketLabels,
  createHeaderUI,
  createOptionsUI,
  showFeedback,
  toggleMuteButton,
  updateHeaderQuestion,
  updateOptionsContent,
  updatePocketLabels,
  updateScore,
  updateTimer
} from '../ui';
export class Main extends Phaser.Scene {
  // ── Bola blanca ───────────────────────
  private ballWhite!: Phaser.GameObjects.Sprite;
  private vxW = 0;
  private vyW = 0;
  private rollAngleW = 0;
  private currentDirW = DIRS.E as number;

  // ── Bola 1 ────────────────────────────
  private ball1!: Phaser.GameObjects.Sprite;
  private vx1 = 0;
  private vy1 = 0;
  private rollAngle1 = 0;
  private currentDir1 = DIRS.E as number;
  private ball1Moving = false;

  // ── Estado troneras ───────────────────
  private ballWhitePocketed = false;
  private ball1Pocketed = false;

  // ── Límites exteriores ────────────────
  private outerX1 = 0;
  private outerY1 = 0;
  private outerX2 = 0;
  private outerY2 = 0;
  private readonly BALL_RADIUS = 15;
  private readonly COLLISION_DIST = 30;
  private readonly FRICTION = 0.55;
  private readonly MIN_SPEED = 8;

  // ── Taco ──────────────────────────────
  private cue!: Phaser.GameObjects.Image;
  private cueAngle = 0; // apunta a la izquierda inicialmente
  private _mouseX = 0;
  private _mouseY = 0;
  private cueOffset = CUE_TIP_OFFSET;
  private cueState: CueState = 'idle';
  private cueForce = 0;

  // ── Drag ──────────────────────────────
  private dragStartX = 0;
  private dragStartY = 0;
  private isDragging = false;
  private dirLocked = false;
  private dragIndicator!: Phaser.GameObjects.Graphics;

  // ── Guía ──────────────────────────────
  private guideGraphics!: Phaser.GameObjects.Graphics;
  private debugCross!: Phaser.GameObjects.Graphics;

  // ── Quiz data ─────────────────────────
  private quizList: Quiz[] = [];
  private currentIndex = 0;
  private headerEl!: Phaser.GameObjects.DOMElement;
  private optionsEl!: Phaser.GameObjects.DOMElement;
  private pocketLabels: Phaser.GameObjects.DOMElement[] = []; // ← agregar

  // ── Puntaje y tiempo ──────────────────
  private score = 0;
  private elapsedSecs = 0;
  private timerEvent!: Phaser.Time.TimerEvent;

  // ── Sonidos ───────────────────────────
  private sounds!: SoundManager;
  constructor() {
    super('MainScene');
  }

  /** Phaser llama a init() antes de preload/create — aquí recibimos los datos externos. */
  // Main.ts
  init(data: { dataGame: Quiz[] }) {
    this.quizList = data?.dataGame ?? [];
    this.currentIndex = 0;
    this.score = 0; // ← reset
    this.elapsedSecs = 0; // ← reset
  }
  // ─────────────────────────────────────────
  create() {
    // ── UI ────────────────────────────────
    // this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    //   console.log(`x: ${Math.round(pointer.x)}, y: ${Math.round(pointer.y)}`);
    // });
    const currentQuiz = this.quizList[this.currentIndex];
    console.log('Quiz actual:', currentQuiz);
    this.headerEl = createHeaderUI(this, currentQuiz, this.currentIndex, this.quizList.length);
    this.optionsEl = createOptionsUI(this, currentQuiz);
    const totalOpciones = this.quizList[this.currentIndex]?.opciones.length ?? 6;
    this.pocketLabels = createAllPocketLabels(this, totalOpciones); // ← guardar

    // ── MAPA ──────────────────────────────
    const map = this.make.tilemap({ key: 'mesaBillar' });
    const tileset = map.addTilesetImage('mesaDeBillar', 'mesa');
    if (!tileset) return;
    map.createLayer('mesaBillar', tileset, 150, 240);

    // ── BOUNDS ────────────────────────────
    const tableLeft = 150,
      tableRight = 1175,
      tableTop = 235,
      tableBottom = 790;
    this.outerX1 = tableLeft + this.BALL_RADIUS;
    this.outerX2 = tableRight - this.BALL_RADIUS;
    this.outerY1 = tableTop + this.BALL_RADIUS;
    this.outerY2 = tableBottom - this.BALL_RADIUS;

    // ── ANIMACIONES ───────────────────────
    ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].forEach((dir, i) => {
      this.anims.create({
        key: `white_${dir}`,
        frames: framesForDir(i).map((f) => ({ key: 'ballWhite', frame: f })),
        frameRate: FRAME_RATE,
        repeat: -1
      });
      this.anims.create({
        key: `b1_${dir}`,
        frames: framesForDir(i).map((f) => ({ key: 'ball1', frame: f })),
        frameRate: FRAME_RATE,
        repeat: -1
      });
    });

    // ── BOLAS ─────────────────────────────
    this.ballWhite = this.add.sprite(WHITE_BALL_START_X, WHITE_BALL_START_Y, 'ballWhite');
    this.ballWhite.setScale(0.25).setFrame(framesForDir(DIRS.E)[0]);

    this.ball1 = this.add.sprite(BALL1_START_X, BALL1_START_Y, 'ball1');
    this.ball1.setScale(0.25).setFrame(framesForDir(DIRS.E)[0]);

    // ── GRÁFICOS ──────────────────────────
    this.guideGraphics = this.add.graphics();
    this.cue = this.add.image(this.ballWhite.x, this.ballWhite.y, 'cue');
    this.cue.setOrigin(1, 0.5).setScale(0.8);
    this._positionCue();
    this.dragIndicator = this.add.graphics();

    // ── INPUT ─────────────────────────────
    this._setupInput();
    this.sounds = new SoundManager(this); // ← agregar
    this.sounds.init(); // ← agregar
    // ── BOTÓN MUTE ────────────────────────
    const muteBtn = (this.headerEl.node as HTMLElement).querySelector<HTMLElement>('[data-mute]');

    muteBtn?.addEventListener('click', () => {
      this.sounds.toggleMute();
      toggleMuteButton(this.headerEl);
    });

    // ── TIMER — cuenta desde 0 cada segundo ──
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.elapsedSecs++;
        updateTimer(this.headerEl, this.elapsedSecs);
      }
    });
    // ── BOTÓN SALIR ───────────────────────
    const exitBtn = (this.headerEl.node as HTMLElement).querySelector<HTMLElement>('[data-exit]');

    exitBtn?.addEventListener('click', () => {
      this.sounds.stopAll();
      this.timerEvent?.remove();
      this.scene.start('MenuScene'); // ← el string debe coincidir con super() de tu MenuScene
    });

    // ── DEBUG (activar si se necesita) ────
    const DEBUG_BOUNDS = false;
    if (DEBUG_BOUNDS) {
      const g = this.add.graphics();
      g.lineStyle(2, 0x00ff00, 0.8);
      g.strokeRect(tableLeft, tableTop, tableRight - tableLeft, tableBottom - tableTop);
      g.lineStyle(2, 0xff0000, 0.9);
      for (const seg of WALL_SEGMENTS) g.lineBetween(seg.x1, seg.y1, seg.x2, seg.y2);
      g.lineStyle(2, 0x00ffff, 0.9);
      for (const p of POCKETS) g.strokeCircle(p.x, p.y, p.r);
      g.lineStyle(2, 0xff8800, 0.9);
      for (const seg of FUNNEL_SEGMENTS) g.lineBetween(seg.x1, seg.y1, seg.x2, seg.y2);
      this.debugCross = this.add.graphics();
    }
  }

  // ─────────────────────────────────────────
  update(_time: number, delta: number) {
    const dt = delta / 1000;
    this._updateCue();
    this._updateWhiteBall(dt);
    this._updateBall1(dt);
    this._resolveCollision();
    this._checkAllPockets();
    this._drawGuide();
    this._trackMouse();

    if (this.debugCross) {
      this.debugCross.clear();

      // Bola blanca — cyan
      this.debugCross.lineStyle(1, 0x00ffff, 0.9);
      this.debugCross.lineBetween(this.ballWhite.x - 10, this.ballWhite.y, this.ballWhite.x + 10, this.ballWhite.y);
      this.debugCross.lineBetween(this.ballWhite.x, this.ballWhite.y - 10, this.ballWhite.x, this.ballWhite.y + 10);
      this.debugCross.lineStyle(1, 0x00ffff, 0.4);
      this.debugCross.strokeCircle(this.ballWhite.x, this.ballWhite.y, this.BALL_RADIUS);

      // Ball1 — amarillo
      this.debugCross.lineStyle(1, 0xffff00, 0.9);
      this.debugCross.lineBetween(this.ball1.x - 10, this.ball1.y, this.ball1.x + 10, this.ball1.y);
      this.debugCross.lineBetween(this.ball1.x, this.ball1.y - 10, this.ball1.x, this.ball1.y + 10);
      this.debugCross.lineStyle(2, 0xffff00, 0.4);
      this.debugCross.strokeCircle(this.ball1.x, this.ball1.y, this.BALL_RADIUS);
    }
  }

  // ─────────────────────────────────────────
  //  INPUT — mouse y touch
  // ─────────────────────────────────────────
  private _setupInput() {
    const canvas = this.sys.game.canvas;

    const toGameXY = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const calcDragForce = (x: number, y: number) => {
      const dx = x - this.dragStartX,
        dy = y - this.dragStartY;
      const backX = -Math.cos(this.cueAngle + Math.PI);
      const backY = -Math.sin(this.cueAngle + Math.PI);
      const proj = Math.max(0, dx * backX + dy * backY);
      const t = Math.min(1, proj / CUE_DRAG_MAX);
      this.cueForce = t * CUE_MAX_FORCE;
      this.dirLocked = proj > 0;
      return t;
    };

    const ballsMoving = () =>
      Math.sqrt(this.vxW ** 2 + this.vyW ** 2) > 0 || Math.sqrt(this.vx1 ** 2 + this.vy1 ** 2) > 0;

    const onMouseDown = (e: MouseEvent) => {
      if (this.cueState !== 'idle' || ballsMoving()) return;
      const { x, y } = toGameXY(e.clientX, e.clientY);
      this.dragStartX = x;
      this.dragStartY = y;
      this.isDragging = true;
      this.dirLocked = true;
      this.cueForce = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = toGameXY(e.clientX, e.clientY);
      this._mouseX = x;
      this._mouseY = y;
      if (!this.isDragging) return;
      this._drawDragIndicator(calcDragForce(x, y));
    };

    const onMouseUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.dirLocked = false;
      this.dragIndicator.clear();
      if (this.cueForce > 10) this.cueState = 'pullback';
    };

    const onTouchStart = (e: TouchEvent) => {
      if (this.cueState !== 'idle' || ballsMoving()) return;
      const { x, y } = toGameXY(e.touches[0].clientX, e.touches[0].clientY);
      this.dragStartX = x;
      this.dragStartY = y;
      this.isDragging = true;
      this.dirLocked = true;
      this.cueForce = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!this.isDragging) return;
      const { x, y } = toGameXY(e.touches[0].clientX, e.touches[0].clientY);
      this._drawDragIndicator(calcDragForce(x, y));
    };

    const onTouchEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.dirLocked = false;
      this.dragIndicator.clear();
      if (this.cueForce > 10) this.cueState = 'pullback';
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    this.events.once('destroy', () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    });
  }

  // ─────────────────────────────────────────
  //  UPDATE — bloques separados por responsabilidad
  // ─────────────────────────────────────────
  private _updateWhiteBall(dt: number) {
    this.vxW = this._applyFriction(this.vxW, dt);
    this.vyW = this._applyFriction(this.vyW, dt);
    if (Math.sqrt(this.vxW ** 2 + this.vyW ** 2) > 0) {
      this.ballWhite.x += this.vxW * dt;
      this.ballWhite.y += this.vyW * dt;
      this._applyRoll(this.vxW, this.vyW, dt, 'W');
      this._updateFrameRate(this.ballWhite, this.vxW, this.vyW);
      const b = this._bounceWalls(this.ballWhite, this.vxW, this.vyW);
      if (b.bounced) {
        this.vxW = b.vx;
        this.vyW = b.vy;
        this._playAnim(
          this.ballWhite,
          this.vxW,
          this.vyW,
          'white_',
          (d) => {
            this.currentDirW = d;
          },
          this.currentDirW
        );
      }
    } else if (this.ballWhite.anims.isPlaying) {
      this.ballWhite.anims.stop();
    }
  }

  private _updateBall1(dt: number) {
    if (!this.ball1Moving) return;
    this.vx1 = this._applyFriction(this.vx1, dt);
    this.vy1 = this._applyFriction(this.vy1, dt);
    if (Math.sqrt(this.vx1 ** 2 + this.vy1 ** 2) > 0) {
      this.ball1.x += this.vx1 * dt;
      this.ball1.y += this.vy1 * dt;
      this._applyRoll(this.vx1, this.vy1, dt, '1');
      this._updateFrameRate(this.ball1, this.vx1, this.vy1);
      const b = this._bounceWalls(this.ball1, this.vx1, this.vy1);
      if (b.bounced) {
        this.vx1 = b.vx;
        this.vy1 = b.vy;
        this._playAnim(
          this.ball1,
          this.vx1,
          this.vy1,
          'b1_',
          (d) => {
            this.currentDir1 = d;
          },
          this.currentDir1
        );
      }
    } else if (this.ball1.anims.isPlaying) {
      this.ball1.anims.stop();
    }
  }

  private _resolveCollision() {
    const cdx = this.ball1.x - this.ballWhite.x;
    const cdy = this.ball1.y - this.ballWhite.y;
    const dist = Math.sqrt(cdx * cdx + cdy * cdy);
    if (dist >= this.COLLISION_DIST || dist <= 0) return;
    this.sounds.play(SOUND_KEYS.BALL_HIT);
    const overlap = this.COLLISION_DIST - dist;
    const nx = cdx / dist,
      ny = cdy / dist;
    this.ballWhite.x -= nx * overlap * 0.5;
    this.ballWhite.y -= ny * overlap * 0.5;
    this.ball1.x += nx * overlap * 0.5;
    this.ball1.y += ny * overlap * 0.5;

    const velW = { vx: this.vxW, vy: this.vyW };
    const vel1 = { vx: this.vx1, vy: this.vy1 };
    resolveElasticCollision(velW, vel1, this.ballWhite.x, this.ballWhite.y, this.ball1.x, this.ball1.y);
    this.vxW = velW.vx;
    this.vyW = velW.vy;
    this.vx1 = vel1.vx;
    this.vy1 = vel1.vy;
    this.ball1Moving = true;

    this._playAnim(
      this.ballWhite,
      this.vxW,
      this.vyW,
      'white_',
      (d) => {
        this.currentDirW = d;
      },
      this.currentDirW
    );
    this._playAnim(
      this.ball1,
      this.vx1,
      this.vy1,
      'b1_',
      (d) => {
        this.currentDir1 = d;
      },
      -1
    );
  }

  private _checkAllPockets() {
    if (!this.ballWhitePocketed) this._checkPockets(this.ballWhite, 'W');
    if (!this.ball1Pocketed) this._checkPockets(this.ball1, '1');
  }

  private _trackMouse() {
    if ((this.cueState === 'idle' || this.cueState === 'return') && !this.dirLocked) {
      this.cueAngle = Math.atan2(this._mouseY - this.ballWhite.y, this._mouseX - this.ballWhite.x);
      this._positionCue();
    }
  }

  // ─────────────────────────────────────────
  //  GUÍA DE TRAYECTORIA
  // ─────────────────────────────────────────
  private _drawGuide() {
    this.guideGraphics.clear();
    const ballsMoving = Math.sqrt(this.vxW ** 2 + this.vyW ** 2) > 0 || Math.sqrt(this.vx1 ** 2 + this.vy1 ** 2) > 0;
    if (this.cueState !== 'idle' || ballsMoving || this.ballWhitePocketed) return;

    const shotAngle = this.cueAngle + Math.PI;
    const { whitePts, ball1Pts } = calcGuideWithCollision(
      this.ballWhite.x,
      this.ballWhite.y,
      Math.cos(shotAngle),
      Math.sin(shotAngle),
      { x: this.ball1.x, y: this.ball1.y },
      this.ball1Pocketed,
      this.BALL_RADIUS,
      this.COLLISION_DIST,
      this.outerX1,
      this.outerY1,
      this.outerX2,
      this.outerY2
    );

    // Línea blanca — hasta el impacto
    if (whitePts.length >= 2) {
      this.guideGraphics.lineStyle(GUIDE_LINE_W, 0xffffff, GUIDE_ALPHA_MAX);
      this.guideGraphics.beginPath();
      this.guideGraphics.moveTo(this.ballWhite.x, this.ballWhite.y);
      for (const p of whitePts) this.guideGraphics.lineTo(p.x, p.y);
      this.guideGraphics.strokePath();
    }

    // Línea amarilla — dirección de ball1 tras el impacto, con fade
    if (ball1Pts.length >= 2) {
      let prevX = this.ball1.x,
        prevY = this.ball1.y;
      ball1Pts.forEach((pt, i) => {
        const alpha = Phaser.Math.Linear(GUIDE_ALPHA_B1, 0, i / (ball1Pts.length - 1 || 1));
        this.guideGraphics.lineStyle(GUIDE_LINE_W, 0xffdd00, alpha);
        this.guideGraphics.beginPath();
        this.guideGraphics.moveTo(prevX, prevY);
        this.guideGraphics.lineTo(pt.x, pt.y);
        this.guideGraphics.strokePath();
        prevX = pt.x;
        prevY = pt.y;
      });
    }
  }

  // ─────────────────────────────────────────
  //  TACO — máquina de estados
  // ─────────────────────────────────────────
  private _updateCue() {
    switch (this.cueState) {
      case 'pullback':
        this.sounds.play(SOUND_KEYS.CUEHITBALL);
        this.cueOffset += CUE_RETURN_SPEED;
        if (this.cueOffset >= CUE_TIP_OFFSET + CUE_PULLBACK) {
          this.cueOffset = CUE_TIP_OFFSET + CUE_PULLBACK;
          this.cueState = 'strike';
        }
        this._positionCue();
        break;

      case 'strike':
        this.cueOffset -= CUE_HIT_SPEED;
        if (this.cueOffset <= 0) {
          this.cueOffset = 0;
          this.vxW = Math.cos(this.cueAngle) * -this.cueForce;
          this.vyW = Math.sin(this.cueAngle) * -this.cueForce;
          this._playAnim(
            this.ballWhite,
            this.vxW,
            this.vyW,
            'white_',
            (d) => {
              this.currentDirW = d;
            },
            -1
          );
          this.cueState = 'return';
        }
        this._positionCue();
        break;

      case 'return':
        this.cueOffset += CUE_RETURN_SPEED * 0.5;
        if (this.cueOffset >= CUE_TIP_OFFSET) {
          this.cueOffset = CUE_TIP_OFFSET;
          const moving = Math.sqrt(this.vxW ** 2 + this.vyW ** 2) > 0 || Math.sqrt(this.vx1 ** 2 + this.vy1 ** 2) > 0;
          if (moving) {
            this.cue.setVisible(false);
            this.cueState = 'hidden';
          } else this.cueState = 'idle';
        }
        this._positionCue();
        break;

      case 'hidden': {
        const allStopped =
          Math.sqrt(this.vxW ** 2 + this.vyW ** 2) === 0 && Math.sqrt(this.vx1 ** 2 + this.vy1 ** 2) === 0;
        if (allStopped && !this.ballWhitePocketed) {
          this.cue.setVisible(true);
          this.cueState = 'idle';
          this._positionCue();
        }
        break;
      }
    }
  }

  private _positionCue() {
    const dir = this.cueAngle + Math.PI;
    const tipDist = this.BALL_RADIUS + this.cueOffset;
    this.cue.x = this.ballWhite.x + Math.cos(dir) * tipDist;
    this.cue.y = this.ballWhite.y + Math.sin(dir) * tipDist;
    this.cue.setRotation(dir);
  }

  private _drawDragIndicator(t: number) {
    this.dragIndicator.clear();
    const barMaxLen = 80,
      barLen = t * barMaxLen,
      barH = 6;
    let color: number;
    if (t < 0.5) {
      const r = Math.round(t * 2 * 255);
      color = (r << 16) | (0xff << 8) | 0x00;
    } else {
      const g = Math.round((1 - (t - 0.5) * 2) * 255);
      color = (0xff << 16) | (g << 8) | 0x00;
    }
    this.dragIndicator.fillStyle(0x444444, 0.6);
    this.dragIndicator.fillRect(this.ballWhite.x - barMaxLen / 2, this.ballWhite.y - 35, barMaxLen, barH);
    this.dragIndicator.fillStyle(color, 1);
    this.dragIndicator.fillRect(this.ballWhite.x - barMaxLen / 2, this.ballWhite.y - 35, barLen, barH);
    this.dragIndicator.lineStyle(1, 0xffffff, 0.5);
    this.dragIndicator.strokeRect(this.ballWhite.x - barMaxLen / 2, this.ballWhite.y - 35, barMaxLen, barH);
  }

  // ─────────────────────────────────────────
  //  HELPERS FÍSICOS
  // ─────────────────────────────────────────
  private _applyFriction(v: number, dt: number): number {
    const newV = v * Math.pow(this.FRICTION, dt);
    return Math.abs(newV) < this.MIN_SPEED ? 0 : newV;
  }

  private _frameRateForSpeed(vx: number, vy: number): number {
    const t = Math.min(1, Math.sqrt(vx * vx + vy * vy) / SPEED_MAX);
    return FRAME_RATE_MIN + t * (FRAME_RATE - FRAME_RATE_MIN);
  }

  private _updateFrameRate(sprite: Phaser.GameObjects.Sprite, vx: number, vy: number) {
    if (!sprite.anims.isPlaying) return;
    sprite.anims.msPerFrame = 1000 / this._frameRateForSpeed(vx, vy);
  }

  private _applyRoll(vx: number, vy: number, dt: number, which: 'W' | '1') {
    const dist = Math.sqrt((vx * dt) ** 2 + (vy * dt) ** 2);
    const sign = Math.abs(vx) >= Math.abs(vy) ? Math.sign(vx) : Math.sign(vy);
    if (which === 'W') this.rollAngleW += sign * (dist / BALL_VISUAL_RADIUS);
    else this.rollAngle1 += sign * (dist / BALL_VISUAL_RADIUS);
  }

  private _bounceWalls(sprite: Phaser.GameObjects.Sprite, vx: number, vy: number) {
    let bounced = false;
    const r = this.BALL_RADIUS;

    for (const seg of ALL_SEGMENTS) {
      const res = bounceSegment(sprite, vx, vy, seg, r);
      if (res.bounced) {
        vx = res.vx;
        vy = res.vy;
        bounced = true;
        this.sounds.play(SOUND_KEYS.CUSHION);
      }
    }

    if (sprite.x - r <= this.outerX1) {
      sprite.x = this.outerX1 + r;
      vx = Math.abs(vx);
      bounced = true;
    } else if (sprite.x + r >= this.outerX2) {
      sprite.x = this.outerX2 - r;
      vx = -Math.abs(vx);
      bounced = true;
    }
    if (sprite.y - r <= this.outerY1) {
      sprite.y = this.outerY1 + r;
      vy = Math.abs(vy);
      bounced = true;
    } else if (sprite.y + r >= this.outerY2) {
      sprite.y = this.outerY2 - r;
      vy = -Math.abs(vy);
      bounced = true;
    }

    return { vx, vy, bounced };
  }

  // ─────────────────────────────────────────
  //  TRONERAS
  // ─────────────────────────────────────────
  private _checkPockets(sprite: Phaser.GameObjects.Sprite, which: 'W' | '1') {
    const totalOpciones = this.quizList[this.currentIndex]?.opciones.length ?? 6;

    for (let i = 0; i < POCKETS.length; i++) {
      const p = POCKETS[i];
      const dx = sprite.x - p.x,
        dy = sprite.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) >= p.r) continue;

      // ── Tronera sin opción asignada → ignorar completamente
      if (which === '1' && i >= totalOpciones) continue;
      for (let i = 0; i < POCKETS.length; i++) {
        const p = POCKETS[i];
        const dx = sprite.x - p.x,
          dy = sprite.y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) >= p.r) continue;
      }
      if (which === 'W') {
        this.sounds.play(SOUND_KEYS.POCKET);
        // Bola blanca cae — solo resetear, no evaluar respuesta
        this.ballWhitePocketed = true;
        this.vxW = 0;
        this.vyW = 0;
        if (sprite.anims.isPlaying) sprite.anims.stop();
        this.tweens.add({
          targets: sprite,
          x: p.x,
          y: p.y,
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
          duration: POCKET_ANIM_MS,
          ease: 'Cubic.easeIn',
          onComplete: () => this._resetWhiteBall()
        });
      } else {
        this.sounds.play(SOUND_KEYS.POCKET); // ← agregar aquí
        // ball1 cae — evaluar si la tronera corresponde a la opción correcta
        this.ball1Pocketed = true;
        this.vx1 = 0;
        this.vy1 = 0;
        if (sprite.anims.isPlaying) sprite.anims.stop();

        const currentQuiz = this.quizList[this.currentIndex];
        const opcion = currentQuiz?.opciones[i]; // índice tronera = índice opción
        const esCorrecta = opcion?.correcta ?? false;
        this.tweens.add({
          targets: sprite,
          x: p.x,
          y: p.y,
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
          duration: POCKET_ANIM_MS,
          ease: 'Cubic.easeIn',
          onComplete: () => this._onBall1Pocketed(esCorrecta)
        });
      }
      return;
    }
  }

  /** Reaparece la bola blanca en posición inicial con animación. */
  private _resetWhiteBall() {
    this.vxW = 0;
    this.vyW = 0;

    const waitForBall1 = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        const ball1Moving = Math.sqrt(this.vx1 ** 2 + this.vy1 ** 2) > 0;
        if (ball1Moving) return;

        waitForBall1.remove();

        this.ballWhite.setPosition(WHITE_BALL_START_X, WHITE_BALL_START_Y);
        this.ballWhite.setScale(0).setAlpha(1).setVisible(true).setActive(true);
        this.ballWhite.setFrame(framesForDir(DIRS.E)[0]);

        this.tweens.add({
          targets: this.ballWhite,
          scaleX: 0.25,
          scaleY: 0.25,
          duration: 350,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.ballWhitePocketed = false; // ← aquí, cuando ya apareció
            this.cueState = 'idle';
            this.cueOffset = CUE_TIP_OFFSET;
            this.cue.setVisible(true);
            this._positionCue();
            this.sounds.play(SOUND_KEYS.FAULD);
          }
        });
      }
    });
  }

  // ─────────────────────────────────────────
  //  ANIMACIÓN
  // ─────────────────────────────────────────
  private _playAnim(
    sprite: Phaser.GameObjects.Sprite,
    vx: number,
    vy: number,
    prefix: string,
    setDir: (d: number) => void,
    currentDir: number
  ) {
    if (Math.sqrt(vx * vx + vy * vy) < 1) return;
    const newDir = getDir(vx, vy);
    const keys = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const fr = this._frameRateForSpeed(vx, vy);
    if (newDir !== currentDir) {
      setDir(newDir);
      sprite.play({ key: `${prefix}${keys[newDir]}`, frameRate: fr });
    } else if (sprite.anims.isPlaying) {
      sprite.anims.msPerFrame = 1000 / fr;
    }
  }

  /**
   * Avanza a la siguiente pregunta y actualiza la UI.
   * Llamar cuando ball1 entre en una tronera (respuesta correcta)
   * o cuando se quiera pasar de pregunta manualmente.
   */
  /** Se llama cuando ball1 termina la animación de caída en una tronera. */

  private _onBall1Pocketed(esCorrecta: boolean) {
    this.time.delayedCall(1000, () => {
      if (esCorrecta) {
        this.sounds.play(SOUND_KEYS.CORRECT);
        this.score = this.score + 10;
        this._nextQuestion();
      } else {
        this.sounds.play(SOUND_KEYS.INCORRECT);
        this.score = Math.max(0, this.score - 5); // mínimo 0
      }
      updateScore(this.headerEl, this.score);
      showFeedback(esCorrecta);
    });
    // Siempre resetear ball1 para que vuelva a su posición
    this.time.delayedCall(2000, () => {
      this._resetBall1();
    });
  }

  private _resetBall1() {
    this.ball1Pocketed = false;
    this.vx1 = 0;
    this.vy1 = 0;
    this.ball1Moving = false;

    this.ball1.setPosition(BALL1_START_X, BALL1_START_Y);
    this.ball1.setScale(0).setAlpha(1).setVisible(true).setActive(true);
    this.ball1.setFrame(framesForDir(DIRS.E)[0]);

    this.tweens.add({
      targets: this.ball1,
      scaleX: 0.25,
      scaleY: 0.25,
      duration: 350,
      ease: 'Back.easeOut'
    });
  }
  private _nextQuestion() {
    const siguiente = this.currentIndex + 1;

    if (siguiente >= this.quizList.length) {
      this._goToEndGame();
      return;
    }

    this.currentIndex = siguiente;
    const q = this.quizList[this.currentIndex];

    // Actualizar labels de troneras según las opciones de la nueva pregunta
    updatePocketLabels(this.pocketLabels, q.opciones.length); // ← agregar

    animateQuestionChange(this.headerEl, this.optionsEl, () => {
      updateHeaderQuestion(this.headerEl, q, this.currentIndex, this.quizList.length);
      updateOptionsContent(this.optionsEl, q);
    });
  }
  /**
   * Transición a la escena final cuando se agotan las preguntas.
   * Pasa el puntaje acumulado para mostrarlo en EndGame.
   */
  private _goToEndGame() {
    // Detener input y ocultar taco
    this.timerEvent.remove(); // ← detener el contador
    this.isDragging = false;
    this.cue.setVisible(false);
    this.guideGraphics.clear();

    // Pequeña pausa para que el feedback de "correcto" termine
    // antes de cambiar de escena
    this.time.delayedCall(2500, () => {
      this.scene.start('endGameScene', {
        score: this.score ?? 0,
        total: this.quizList.length,
        elapsedSecs: this.elapsedSecs,
        dataGame: this.quizList
      });
    });
  }
}
