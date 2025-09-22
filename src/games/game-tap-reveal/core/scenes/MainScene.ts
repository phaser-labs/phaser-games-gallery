import { animations } from '../utils/AnimationsGsap';
import { globalState } from '../utils/GlobalState';
interface GridImage extends Phaser.GameObjects.Image {
  image: Phaser.GameObjects.Image;
  row: number;
  col: number;
}

const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) announcer.textContent = message;
  if (!announcer || !announcer.textContent) return;

  if (announcer.textContent.valueOf() === message.valueOf()) {
    setTimeout(() => {
      if (announcer) announcer.textContent = '';
    }, 1000);
  }
};
export class Main extends Phaser.Scene {
  private scoreElement: HTMLElement | null = null;
  private contanerActions: HTMLElement | null = null;
  private containerButtons: HTMLElement | null = null;
  private gridImages: GridImage[] = [];
  private points: number = 0;
  private scoreContainer!: HTMLDivElement;
  private scoreCircle!: SVGCircleElement;
  private indicator!: HTMLElement;
  private indicatorSibling!: HTMLElement;
  private output!: HTMLOutputElement;
  private randomImage?: Phaser.GameObjects.Image | null = null;
  private selectedQuestion: { key: string; image: string; altImage: string; answerId: number } | null = null;
  private selectedOptionId: number | null = null;
  private currentQuestionIndex: number = 0;

  constructor() {
    super('MainScene');
  }
  create() {
    console.log(globalState.choose);
    // animacion de la explocion
    this.anims.create({
      key: 'bang',
      frames: this.anims.generateFrameNumbers('bang', { start: 0, end: 8 }),
      frameRate: 30,
      repeat: 0
    });
    this.choseStyle();

    this.elementsHtml();

    const scoreDivNow = document.querySelector('#tapReveal__score') as HTMLElement | null;

    if (scoreDivNow) {
      this.attachClassObserver(scoreDivNow);
    } else {
      // Si aún no existe, observa el DOM hasta que aparezca
      const domObserver = new MutationObserver((_muts, obs) => {
        const el = document.querySelector('#tapReveal__score') as HTMLElement | null;
        if (el) {
          obs.disconnect();
          this.attachClassObserver(el);
        }
      });
      domObserver.observe(document.body, { childList: true, subtree: true });
      // Limpieza al cerrar la escena
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => domObserver.disconnect());
    }
    const currentChoose = globalState.choose;
    if (currentChoose) {
      this.createBackground(currentChoose);
      this.showCurrentQuestion();
      this.createGrid(currentChoose, 0);
      this.updateElementsStyle(currentChoose.toString());
    }
  }
  applyScoreUI = (scoreDiv: HTMLElement) => {
    const existingScore = scoreDiv.querySelector('#cont');
    if (existingScore) existingScore.remove();
    const currentClass = Array.from(scoreDiv.classList).find((cls) => cls.startsWith('tapReveal__score_'));
    let scoreElement: HTMLElement | undefined;
    switch (currentClass) {
      case 'tapReveal__score_1':
        scoreElement = this.createCircularScore(this.points);
        break;
      case 'tapReveal__score_2':
        scoreElement = this.createRadialGauge(this.points);
        break;
      case 'tapReveal__score_3':
        scoreElement = this.createScoreGrafic();
        break;
      default:
        console.log('Escoja un estilo.');
        break;
    }
    if (scoreElement) scoreDiv.appendChild(scoreElement);
  };
  attachClassObserver = (scoreDiv: HTMLElement) => {
    const classObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          this.applyScoreUI(scoreDiv);
        }
      }
    });
    classObserver.observe(scoreDiv, { attributes: true, attributeFilter: ['class'] });
    this.applyScoreUI(scoreDiv);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => classObserver.disconnect());
  };
  createBackground = (ChangeBackground: number) => {
    const background = this.add.image(0, 0, `background_${ChangeBackground}`).setOrigin(0, 0);
    background.setDisplaySize(this.scale.width, this.scale.height);
  };
  createGrid(texture: number, frameIndex = 0) {
    this.createFancyBorder(this.scale.width / 2, this.scale.height / 2 - 98, 350, 320, 20);
    this.clearGrid();
    // Obtener tamaño del lienzo (canvas) del juego
    const width = this.scale.width;
    const height = this.scale.height;
    // Definir tamaño de cada celda (en píxeles). Debe coincidir con frameWidth/frameHeight.
    const cellWidth = 100;
    const cellHeight = 100;
    // Calcular el ancho y alto total de la cuadrícula
    const totalWidth = 4 * cellWidth;
    const totalHeight = 4 * cellHeight;
    // Calcular desplazamientos (offset) para centrar la cuadrícula en el lienzo
    const offsetX = (width - totalWidth) / 2;
    const offsetY = (height - totalHeight) / 2;
    this.gridImages = [];
    // Recorrer filas y columnas para crear cada sprite en la posición correspondiente
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        // Calcular posición X, Y de la celda actual
        const x = offsetX + col * cellWidth;
        const y = offsetY + row * cellHeight - 100;
        const gridImage = this.add
          .image(x, y, `grid_${texture}_${row + 1}`, frameIndex)
          .setOrigin(0, 0)
          .setDepth(2);
        interface GridImage extends Phaser.GameObjects.Image {
          image: Phaser.GameObjects.Image;
          row: number;
          col: number;
        }
        this.gridImages.push({
          image: gridImage,
          row: row,
          col: col
        } as GridImage);
      }
    }
  }
  clearGrid() {
    // destruir todos los GameObjects previos
    this.gridImages.forEach((cell) => {
      if (cell.image) {
        cell.image.destroy();
      }
    });
    this.gridImages = [];
  }
  // funcion para desaparecer los elementos del  grid
  hideAndShowGrid = (delay: number = 2000) => {
    if (this.gridImages.length === 0) return;

    this.gridImages.forEach((cell) => {
      cell.image.setAlpha(0);
      const { x, y } = cell.image;
      const sprite = this.add.sprite(x, y, 'bang', 0).setOrigin(0, 0).setScale(0.6).setDepth(1);
      sprite.play('bang');
      sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        sprite.destroy();
      });
    });
    // Mostrar después del delay
    this.time.delayedCall(delay, () => {
      this.gridImages.forEach((cell) => cell.image.setAlpha(1));
    });
  };
  hideOnceImage = (delay: number = 2000, removePoints: boolean = false) => {
    if (this.gridImages.length === 0) return;

    // Seleccionar un índice aleatorio
    const randomIndex = Phaser.Math.Between(0, this.gridImages.length - 1);
    const selectedCell = this.gridImages[randomIndex]; // Obtenemos el objeto completo
    const selectedImage = selectedCell.image; // Accedemos a la imagen

    // Ocultar la celda
    selectedImage.setAlpha(0);
    const { x, y } = selectedImage;
    const sprite = this.add
      .sprite(x - 20, y, 'bang', 0)
      .setOrigin(0, 0)
      .setScale(0.7)
      .setDepth(1);
    sprite.play('bang');
    sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      sprite.destroy();
    });

    // Mostrarla después del tiempo especificado (en milisegundos)
    this.time.delayedCall(delay, () => {
      selectedImage.setAlpha(1);
    });
    if (removePoints) {
      this.updateScore(null, true);
    }
  };
  updateScore = (isCorrect: boolean | null = false, penaltyFive: boolean = false) => {
    const totalQuestions = globalState.questions.length;
    const pointsPerQuestion = Math.round(100 / totalQuestions);
    if (isCorrect) {
      this.points += pointsPerQuestion;
    } else if (penaltyFive) {
      this.points -= 5;
      console.log('se resta 5 puntos');
    } else {
      this.points -= 10;
      console.log('se  resta 10 puntos');
    }

    this.points = Math.max(0, Math.min(this.points, 100));
    globalState.score = this.points;
    this.updateCircularScore(this.points);
    this.updateRadialGauge(this.points);
    this.updateScoreGrafic(this.points);
  };
  hideCrossLine = (delay: number = 2000) => {
    // Filtrar las imágenes que estén en la diagonal principal
    const diagonalImages = (this.gridImages as GridImage[]).filter((cell) => cell.row === cell.col);
    diagonalImages.forEach((cell) => {
      cell.image.setAlpha(0);
      const { x, y } = cell.image;
      const sprite = this.add.sprite(x, y, 'bang', 0).setOrigin(0, 0).setScale(0.7).setDepth(1);
      sprite.play('bang');
      sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        sprite.destroy();
      });
      this.time.delayedCall(delay, () => {
        cell.image.setAlpha(1);
      });
    });
  };

  elementsHtml = () => {
    const containerText = this.add.dom(0, 0, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerText.setOrigin(0, 0);
    containerText.setClassName('tapReveal__containerTexthtml');
    const htmlContainerText = containerText.node as HTMLElement;
    htmlContainerText.innerHTML = `
    <div id="tapReveal__score">
    </div>
    <div id="tapReveal__actions" class="tapReveal__actions">
      <button class="tapReveal__btnShowAll" aria-label="Ayuda 1: Revela toda la imagen oculta">
      <image class="tapReveal__btnShowOne_image" src="assets/images/ray1.png" alt="rayo de color amarillo" />
      <span>Ayuda 1</span>
      </button>
      <button class="tapReveal__btnShowOne" aria-label="Ayuda 2: Revela una parte de la imagen oculta. ">
         <image class="tapReveal__btnShowOne_image" src="assets/images/eye.png" alt="ojo de color azul" />
         <span>Ayuda 2</span>
      </button>
      <button class="tapReveal__btnSoundShowCross"  aria-label= "Ayuda 3: Revela una parte de la imagen oculta en forma transversal.">
        <image class="tapReveal__btnShowOne_image" src="assets/images/cross.png" alt="flecha transversal" />
        <span>Ayuda 3</span>
      </button>
      <button class="tapReveal__btnShowAllCenter" aria-label="Ayuda 4: desaparece  un pequeno cuadrado de foma aleatoria y deja al descubierto un  pequeña parte de la imagen oculta por pocos segundos y descuenta 5 puntos.">
        <image  class="tapReveal__btnShowOne_image"src="assets/images/ray2.png" alt="ojo de color azul" />
        <span>Ayuda 4</span>
      </button>
    </div>
    <div class="tapReveal__containerOptions" id="tapReveal__containerOptions">
    </div>
    `;

    this.scoreElement = document.getElementById('tapReveal__score');
    this.contanerActions = document.getElementById('tapReveal__actions');
    this.containerButtons = document.getElementById('tapReveal__containerOptions');
    this.createButtonOption();
  };
  updateElementsStyle = (estilo: string) => {
    if (this.scoreElement || this.contanerActions || this.containerButtons) {
      this.scoreElement!.className = `tapReveal__score_${estilo}`;
      this.contanerActions!.className = `tapReveal__actions_${estilo}`;
      this.containerButtons!.className = `tapReveal__containerOptions_${estilo}`;
    }
    animations.AnimationsGsap();
    this.handleClickHelper();
  };
  handleClickHelper = () => {
    const btnsBreak = document.querySelectorAll<HTMLButtonElement>('#tapReveal__actions button');
    btnsBreak.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.playAudio('breaking', 0.5);
        if (btn.className === 'tapReveal__btnShowAll') {
          this.hideAndShowGrid(600);
        } else if (btn.className === 'tapReveal__btnShowOne') {
          this.hideOnceImage(600);
        } else if (btn.className === 'tapReveal__btnSoundShowCross') {
          this.hideCrossLine(600);
        } else if (btn.className === 'tapReveal__btnShowAllCenter') {
          this.hideOnceImage(600, true);
        }
      });
    });
    // animacion de  romper el  boton cuando se hace click
    const btnsWithoutLast = Array.from(btnsBreak).slice(0, -1);
    btnsWithoutLast.forEach((btnBreak) => {
      btnBreak?.addEventListener('click', () => {
        animations.breakButtonAnimation(btnBreak);
      });
    });
  };
  choseStyle = () => {
    document.addEventListener('chooseChanged', (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      console.log(customEvent.detail);
      // aquí puedes aplicar el cambio en la escena
      this.createBackground(customEvent.detail);
      this.showCurrentQuestion();
      this.createGrid(customEvent.detail, 0);
      this.updateElementsStyle(customEvent.detail.toString());
    });
  };
  createCircularScore(score: number) {
    const container = document.createElement('div');
    container.id = 'cont';
    container.className = 'tapReveal__score_cont';
    // container.setAttribute('data-pct', score.toString());

    container.innerHTML = `
    <svg id="svg" width="200" height="200" viewBox="0 0 200 200">
      <circle r="90" cx="100" cy="100" fill="transparent" stroke="#ddd" stroke-width="10" stroke-dasharray="565.48" stroke-dashoffset="0"></circle>
      <circle id="bar" r="90" cx="100" cy="100" fill="transparent" stroke="#4caf50" stroke-width="10" stroke-dasharray="565.48" stroke-dashoffset="0"></circle>
    </svg>
    <span id="scoreText" arial-label="score" aria-live="polite"
    ">0</span>
    <h2>Puntos</h2>
    `;
    this.scoreContainer = container;
    this.scoreCircle = container.querySelector('#bar') as SVGCircleElement;

    this.updateCircularScore(score); // Inicializa el progreso

    return container;
  }
  updateCircularScore(score: number) {
    if (!this.scoreCircle) return;

    const r = this.scoreCircle.getAttribute('r');
    if (r !== null) {
      const radius = parseInt(r, 10);

      const c = Math.PI * (radius * 2);
      const val = Math.max(0, Math.min(score, 100)); // Limitar 0-100
      const pct = ((100 - val) / 100) * c;
      this.scoreCircle.style.strokeDashoffset = pct.toString();
    }

    // Actualiza el texto dentro del contenedor
    const scoreText = this.scoreContainer.querySelector('#scoreText');
    if (scoreText) {
      scoreText.textContent = `${score.toString()}`;
      scoreText.setAttribute('aria-label', `${score} puntos`);
    }
  }
  createRadialGauge(score: number) {
    const container = document.createElement('div');
    container.id = 'cont';
    container.className = 'tapReveal__score_cont_2';
    container.innerHTML = `
      <h2>Puntos</h2>
      <div class="gaugewrap">
        <div class="gauge">
          <div class="dial">
            <div class="indicator">
            </div>
            <i></i>
            <div class="dialbase">
              <output id="scoreText" aria-live="polite">0</output>
            </div>
          </div>
        </div>
	    </div>
    `;
    this.scoreContainer = container;
    this.indicator = container.querySelector('.indicator') as HTMLElement;
    this.indicatorSibling = container.querySelector('.indicator + i') as HTMLElement;
    this.output = container.querySelector('#scoreText') as HTMLOutputElement;

    this.scoreContainer = container;
    this.scoreCircle = container.querySelector('#bar') as SVGCircleElement;
    const rotation = score - 120;
    if (this.indicator) {
      (this.indicator as HTMLElement).style.transform = `rotate(${rotation}deg)`;
    }
    if (this.indicatorSibling) {
      (this.indicatorSibling as HTMLElement).style.transform = `rotate(${rotation}deg)`;
    }
    return container;
  }
  updateRadialGauge = (score: number) => {
    if (!this.indicator || !this.output) return;
    // Rango de rotación
    const maxAngle = 243;
    const minAngle = 115;
    const maxScore = 100;
    const rotation = maxAngle + (score / maxScore) * (maxAngle - minAngle + 100);
    this.indicator.style.transform = `rotate(${rotation}deg)`;
    this.indicatorSibling.style.transform = `rotate(${rotation}deg)`;
    this.output.textContent = score.toString();
    if (this.output) {
      this.output.textContent = score.toString();
      this.output.setAttribute('aria-label', `${score} puntos`);
      this.output.setAttribute('role', 'status');
    }

    animations.shakingAnimation(this.indicator, rotation);
  };
  createScoreGrafic() {
    const container = document.createElement('div');
    container.id = 'cont';
    container.className = 'cont_3';
    container.innerHTML = `
      <div class="panel">
        <img src="assets/images/trofeo.png" alt="un trofeo dorado" class="tapReveal_trofeo"/>
          <h2>Puntos:</h2>
        <span class="scoreSpan"  aria-live="polite">0<span>
        </div>
	    </div>
    `;

    return container;
  }
  updateScoreGrafic = (score: number) => {
    const scoreSpan = document.querySelector('.scoreSpan') as HTMLOutputElement;
    if (scoreSpan) {
      scoreSpan.textContent = score.toString();
      scoreSpan.setAttribute('aria-label', `${score} puntos`);

      const imageTrophy = document.querySelector('.tapReveal_trofeo') as HTMLElement;
      if (imageTrophy) {
        animations.bounceAnimation(imageTrophy);
      }
    }
  };
  createFancyBorder = (centerX: number, centerY: number, w = 500, h = 500, radius = 20) => {
    // coordenadas del topleft
    const x = Math.round(centerX - w / 2);
    const y = Math.round(centerY - h / 2);

    // container para agrupar elementos si quieres mover/ocultar todo junto
    const container = this.add.container(0, 0);

    // 1) Sombra difusa (rectángulo grande semi-transparente desplazado)
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.18);
    // sombra ligeramente más grande y desplazada
    shadow.fillRoundedRect(x + 8, y + 10, w, h, radius);
    container.add(shadow);

    // 2) Fondo interior (opcional) con gradiente simulado (dos fills superpuestos)
    const bg = this.add.graphics();
    bg.fillStyle(0x0f1724, 1); // color oscuro base
    bg.fillRoundedRect(x, y, w, h, radius);
    // overlay sutil para simular gradiente
    bg.fillStyle(0x122033, 0.12);
    bg.fillRoundedRect(x, y, w, h / 2, radius);
    container.add(bg);

    // 3) Glow exterior: dibujar múltiples strokes concéntricos con alpha decreciente
    const glowColors = [
      { color: 0x7c3aed, alpha: 0.18, width: 18 }, // morado exterior
      { color: 0x06b6d4, alpha: 0.12, width: 10 }, // cyan suave
      { color: 0xffffff, alpha: 0.06, width: 4 } // highlight interno
    ];

    glowColors.forEach((g) => {
      const gfx = this.add.graphics();
      gfx.lineStyle(g.width, g.color, g.alpha);
      // dibuja el stroke redondeado (lineWidth afecta al dibujo)
      // quemamos en un rect ligeramente mayor para que se vea como glow
      gfx.strokeRoundedRect(
        x - Math.floor(g.width / 2),
        y - Math.floor(g.width / 2),
        w + g.width,
        h + g.width,
        radius + Math.floor(g.width / 2)
      );
      container.add(gfx);
    });

    // 4) Borde principal nítido
    const border = this.add.graphics();
    border.lineStyle(4, 0xffffff, 0.95);
    border.strokeRoundedRect(x, y, w, h, radius);
    container.add(border);

    // 5) Ornamento: líneas finas en esquinas o en el medio (opcional)
    const accent = this.add.graphics();
    accent.lineStyle(2, 0x7c3aed, 0.9);
    // ejemplo: pequeñas marcas en los 4 centros de cada lado
    const markLen = 34;
    // top-center
    accent.strokeLineShape(new Phaser.Geom.Line(centerX - markLen / 2, y + 8, centerX + markLen / 2, y + 8));
    // bottom-center
    accent.strokeLineShape(new Phaser.Geom.Line(centerX - markLen / 2, y + h - 8, centerX + markLen / 2, y + h - 8));
    // left-center
    accent.strokeLineShape(new Phaser.Geom.Line(x + 8, centerY - markLen / 2, x + 8, centerY + markLen / 2));
    // right-center
    accent.strokeLineShape(new Phaser.Geom.Line(x + w - 8, centerY - markLen / 2, x + w - 8, centerY + markLen / 2));
    container.add(accent);

    // 6) Opcional: animación sutil del glow (pulsar)
    this.tweens.add({
      targets: container.list, // todos los children del container
      alpha: { from: 0.95, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    // devuelve el container por si quieres mantener referencia
    return container;
  };
  // funciones encargados de las preguntas  mostrarlas validarlas
  showCurrentQuestion = () => {
    if (globalState.questions.length === 0) return;
    if (this.currentQuestionIndex >= globalState.questions.length) {
      setTimeout(() => {
        this.scene.start('endGameScene');
      }, 3000);
      this.currentQuestionIndex = 0; // Reiniciar para la próxima vez
      this.points = 0; // Reiniciar puntos
      return;
    }
    this.selectedQuestion = globalState.questions[this.currentQuestionIndex];
    const { key, image, altImage } = this.selectedQuestion;

    announce('Pregunta: ' + altImage + 'selecciones la respuesta que crea que representa la figura.');

    this.loadDynamicImage(key, image);
  };
  loadDynamicImage = (key: string, url: string) => {
    this.load.image(key, url);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      const fixedX = 550;
      const fixedY = 228;

      const fixedWidth = 330;
      const fixedHeight = 300;

      if (this.randomImage) {
        this.randomImage.destroy();
      }
      // 3. Usar la imagen
      // alto fijo
      this.randomImage = this.add.image(fixedX, fixedY, key).setDepth(1);
      this.randomImage.displayWidth = fixedWidth;
      this.randomImage.displayHeight = fixedHeight;
      const maskShape = this.add.graphics();
      maskShape.fillStyle(0xffffff); // color cualquiera (no importa, es máscara)
      maskShape.fillRoundedRect(fixedX - fixedWidth / 2, fixedY - fixedHeight / 2, fixedWidth, fixedHeight, 20);
      const mask = maskShape.createGeometryMask();
      this.randomImage.setMask(mask);
    });
    this.load.start();
  };

  createButtonOption = () => {
    if (!globalState.globalOptions || globalState.globalOptions.length === 0) return;

    if (!this.containerButtons) return;

    // Limpiamos el contenedor antes de pintar nuevos botones
    this.containerButtons.innerHTML = '';
    const options = globalState.globalOptions;
    const shuffledOptions = [...options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    shuffledOptions.forEach((option) => {
      // Crear el botón
      const btn = document.createElement('button');
      btn.className = 'tapReveal__option';
      btn.setAttribute('data-id', option.id.toString());
      btn.textContent = option.label;

      // Escuchar el click
      btn.addEventListener('click', (e: Event) => {
        e.preventDefault();
        btn.style.display = 'none';
        this.selectedOptionId = option.id; // Guardar el valor del botón seleccionado
        this.playAudio('click', 0.5);
        this.validateAnswer();
      });

      // Agregar el botón al contenedor
      this.containerButtons!.appendChild(btn);
      this.disabledOptions(true, false);
    });
  };
  disabledOptions = (disable: boolean = true, showOptions: boolean = true) => {
    const buttons = document.querySelectorAll('.tapReveal__option');
    if (disable) {
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          // Bloquear TODOS los botones
          buttons.forEach((b) => {
            (b as HTMLButtonElement).disabled = true; // deshabilita clicks
            b.classList.add('disabled'); // opcional para CSS
          });
        });
      });
    } else {
      buttons.forEach((b) => {
        (b as HTMLButtonElement).disabled = false; // habilita
        b.classList.remove('disabled');
      });
    }
    if (showOptions) {
      buttons.forEach((b) => {
        (b as HTMLButtonElement).style.display = 'block';
      });
    }
  };
  validateAnswer = () => {
    if (this.selectedQuestion && this.selectedOptionId !== null) {
      const correctId = this.selectedQuestion.answerId;
      if (this.selectedOptionId === correctId) {
        this.updateScore(true);
        console.log('¡Respuesta correcta!');
        this.hideAndShowGrid(1000);
        announce('¡Respuesta correcta!');

        setTimeout(() => {
          this.disabledOptions(false, true);
          this.showCorrectFeedback();
          this.currentQuestionIndex++; // avanzar
          this.showCurrentQuestion();
          console.log(this.currentQuestionIndex);
        }, 1000);
      } else {
        announce('¡Respuesta Incorrecta!');
        setTimeout(() => {
          this.showIncorrectFeedback();
          this.updateScore(false);
          this.disabledOptions(false, false);
        }, 1000);
      }
    }
  };
  //feedback visual
  showIncorrectFeedback = () => {
    this.playAudio('incorrect', 0.1);
    const containerFeedbackIncorrect = this.add.dom(0, 0, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerFeedbackIncorrect.setOrigin(0, 0);
    containerFeedbackIncorrect.setClassName('tapReveal__containerFeedbackIncorrect_html');
    const htmlContainerText = containerFeedbackIncorrect.node as HTMLElement;
    htmlContainerText.innerHTML = `
      <div id="container" class="tapReveal__feedbackIncorrect">
        <h2 id="incorrecto" class="tapReveal__incorrecto">¡INCORRECTO!</h2>
      </div>
    `;
    const container = document.getElementById('container');
    // número de imágenes que quieres agregar
    const totalImages = 20;
    for (let i = 0; i < totalImages; i++) {
      const img = document.createElement('img');
      img.src = 'assets/images/wrong.png'; // tu URL de imagen
      img.className = 'floating-img';
      // posición aleatoria dentro del contenedor
      img.style.left = Math.random() * (container!.offsetWidth - 50) + 'px';
      img.style.top = Math.random() * (container!.offsetHeight - 50) + 'px';

      // velocidad aleatoria
      img.style.animationDuration = 3 + Math.random() * 3 + 's';

      container!.appendChild(img);
    }
    const h2 = document.getElementById('incorrecto');
    if (!h2) return;
    const text = h2.textContent;
    if (text === null) return;
    h2.textContent = ''; // limpiar el h2
    text.split('').forEach((letter) => {
      const span = document.createElement('span');
      span.textContent = letter;
      h2.appendChild(span);
    });
    const letters = h2.querySelectorAll('span');
    animations.showTitleAnimation(letters);
    const rotationMax = 15; // grados máx.
    const scaleHover = 1.05;
    window.addEventListener('mousemove', (e) => {
      // Diferencia respecto al centro
      // posición relativa al centro del viewport
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const percentX = (e.clientX - centerX) / centerX; // -1 a 1
      const percentY = (e.clientY - centerY) / centerY; // -1 a 1

      // Posición deseada
      const rotateY = percentX * rotationMax; // mover horizontal rota Y
      const rotateX = -percentY * rotationMax; // mover vertical rota X (invertido)

      animations.moveContainerAnimation(container!, rotateY, rotateX, scaleHover);
    });
    // Animación: que cada letra caiga una tras otra

    this.time.delayedCall(
      3000,
      () => {
        containerFeedbackIncorrect.destroy();
      },
      [],
      this
    );
  };
  showCorrectFeedback = () => {
    this.playAudio('correct', 0.5);
    const containerFeedbackCorrect = this.add.dom(0, 0, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerFeedbackCorrect.setOrigin(0, 0);
    containerFeedbackCorrect.setClassName('tapReveal__containerFeedbackCorrect_html');
    const htmlContainerText = containerFeedbackCorrect.node as HTMLElement;
    htmlContainerText.innerHTML = `
      <div id="container" class="tapReveal__feedbackCorrect">
        <h2 id="correcto" class="tapReveal__correcto">¡CORRECTO!</h2>
      </div>
    `;
    const container = document.getElementById('container');
    // número de imágenes que quieres agregar
    const totalImages = 20;
    for (let i = 0; i < totalImages; i++) {
      const img = document.createElement('img');
      img.src = 'assets/images/good.png'; // tu URL de imagen
      img.className = 'floating-img';
      // posición aleatoria dentro del contenedor
      img.style.left = Math.random() * (container!.offsetWidth - 50) + 'px';
      img.style.top = Math.random() * (container!.offsetHeight - 50) + 'px';

      // velocidad aleatoria
      img.style.animationDuration = 3 + Math.random() * 3 + 's';

      container!.appendChild(img);
    }
    const h2 = document.getElementById('correcto');
    if (!h2) return;
    const text = h2.textContent;
    if (text === null) return;
    h2.textContent = ''; // limpiar el h2
    text.split('').forEach((letter) => {
      const span = document.createElement('span');
      span.textContent = letter;
      h2.appendChild(span);
    });
    const letters = h2.querySelectorAll('span');
    // Animación: que cada letra caiga una tras otra
    animations.showTitleAnimation(letters);
    const rotationMax = 15; // grados máx.
    const scaleHover = 1.05;
    window.addEventListener('mousemove', (e) => {
      // Diferencia respecto al centro
      // posición relativa al centro del viewport
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const percentX = (e.clientX - centerX) / centerX; // -1 a 1
      const percentY = (e.clientY - centerY) / centerY; // -1 a 1

      // Posición deseada
      const rotateY = percentX * rotationMax; // mover horizontal rota Y
      const rotateX = -percentY * rotationMax; // mover vertical rota X (invertido)

      animations.moveContainerAnimation(container!, rotateY, rotateX, scaleHover);
    });

    this.time.delayedCall(
      3000,
      () => {
        containerFeedbackCorrect.destroy();
      },
      [],
      this
    );
  };
  //funcion de  sonido
  playAudio = (key: string, volume: number = 1, loop: boolean = false) => {
    // Reproduce el audio con las opciones dadas
    if (globalState.generalMusic) {
      this.sound.play(key, { volume, loop });
    }
  };
}
