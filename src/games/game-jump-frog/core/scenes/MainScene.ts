import { globalState } from '../utils/GlobalState';
//pantalla principal
type Direccion = 'left' | 'right' | 'top';
type Posicion = {
  x: number;
  y: number;
};

let resetearPosiciones: boolean = false;
let sonidoCroar!: Phaser.Sound.BaseSound;
let resultado!: boolean | null; // variable para guardar el resultado de la pregunta;

// variable para resetear las posiciones de las hojas

export class Main extends Phaser.Scene {
  private SplashSound!: Phaser.Sound.BaseSound;
  private backgroundMusic!: Phaser.Sound.BaseSound;
  private hojas!: Phaser.Physics.Arcade.StaticGroup;
  private currentIndex: number = 0;
  private hojasNuevasGroup!: Phaser.Physics.Arcade.StaticGroup;
  private rana!: Phaser.GameObjects.Sprite;
  private posiciones = [
    { x: 400, y: 470 },
    { x: 250, y: 400 },
    { x: 400, y: 320 },
    { x: 550, y: 400 },
    { x: 250, y: 250 },
    { x: 400, y: 180 },
    { x: 550, y: 240 },
    { x: 250, y: 100 },
    { x: 400, y: 30 },
    { x: 550, y: 100 },
    { x: 100, y: 350 },
    { x: 100, y: 200 },
    { x: 100, y: 50 },
    { x: 700, y: 350 },
    { x: 700, y: 200 },
    { x: 700, y: 50 }
  ];

  constructor() {
    super('gameScene');
  }
  preload() {}

  create() {
    let vidas = 4;
    let puntos = 0;
    if (globalState.reload) {
      // Ejecuta tu código para reiniciar posiciones
      if (this.currentIndex === globalState.data.length) {
        this.currentIndex = 0;
        vidas = 4; // Reiniciar vidas
        puntos = 0; // Reiniciar puntos
        globalState.puntos = puntos;
        // globalState.vidas = vidas;
      }
      globalState.reload = false; // Reiniciar el juego
    }
    sonidoCroar = this.sound.add('croar', { volume: 0.5 });
    this.add.image(400, 275, 'water').setScale(1.1);

    // Crear animación  rana
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('rana', { start: 0, end: 5 }),
      frameRate: 5,
      repeat: 0 // Repetir infinitamente
    });
    this.anims.create({
      key: 'hundimiento2',
      frames: this.anims.generateFrameNumbers('hundimiento2', { start: 0, end: 4 }),
      frameRate: 3,
      repeat: 0
    });

    this.hojas = this.physics.add.staticGroup();
    // this.hojas.create(400, 470, 'hundimiento2').setScale(0.8);

    // Crear elementos manualmente

    // grupo de hojas de la derecha
    this.posiciones.forEach((pos, index) => {
      const hoja = this.hojas.create(pos.x, pos.y, 'hundimiento2') as Phaser.Physics.Arcade.Sprite;
      hoja.setScale(0.8);
      hoja.setInteractive();
      hoja.setData('id', `hoja_${index}`); // Asignar un identificador único
    });

    const hojasArray = this.hojas.getChildren();
    const hojasConHover = hojasArray.slice(0, 4) as Phaser.GameObjects.GameObject[];
    hojasConHover.forEach((hoja) => {
      this.hoverOpciones(hoja);
    });
    // Crear el sprite de la rana
    this.rana = this.add.sprite(400, 440, 'rana').setScale(0.8);
    // Iniciar animación
    // valor para desahabilitas los sonidos de saltos, y  cuando se unde  la hoja

    this.sound.stopAll();
    this.SplashSound = this.sound.add('splash', {
      volume: 1,
      loop: false
    });
    const handleMusicState = () => {
      if (globalState.generalMusic) {
        this.backgroundMusic.play();
      } else {
        this.backgroundMusic.pause();
      }
    };
    this.events.on('updateMusic', handleMusicState);
    // Inicializar el audio (pero no reproducirlo aún)
    this.backgroundMusic = this.sound.add('music', {
      volume: 1,
      loop: true
    });
    this.events.emit('updateMusic');
    const containerPrincipal = this.add.dom(400, 32, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerPrincipal.setClassName('gameFrog__containerPrincipal');
    const htmlcontainerPrincipal = containerPrincipal.node as HTMLElement;
    htmlcontainerPrincipal.innerHTML = `
      <div class="gameFrog__container_vidas">
      <strong class="gameFrog__vidas">Vidas</strong>
      <div class="gameFrog__numero_vidas">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"/></svg>
        <strong id="vidasContador" aria-live="polite" aria-atomic="true" aria-label="Vidas">${vidas}</strong>
        </div>
      </div>
      <h2 class="gameFrog__title">Rana Educativa</h2>
      <div class="gameFrog__container_puntos">
        <p class="gameFrog__puntos">Puntos</p>
        <div class="gameFrog__numero_puntos"  >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M240-400q0 52 21 98.5t60 81.5q-1-5-1-9v-9q0-32 12-60t35-51l113-111 113 111q23 23 35 51t12 60v9q0 4-1 9 39-35 60-81.5t21-98.5q0-50-18.5-94.5T648-574q-20 13-42 19.5t-45 6.5q-62 0-107.5-41T401-690q-39 33-69 68.5t-50.5 72Q261-513 250.5-475T240-400Zm240 52-57 56q-11 11-17 25t-6 29q0 32 23.5 55t56.5 23q33 0 56.5-23t23.5-55q0-16-6-29.5T537-292l-57-56Zm0-492v132q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658l18-22q74 42 117 117t43 163q0 134-93 227T480-80q-134 0-227-93t-93-227q0-129 86.5-245T480-840Z"/></svg>
          <strong aria-live="polite" aria-atomic="true"  aria-label="puntos">${puntos}</strong>
        </div>
    `;
    // creacion del container para la pregunta

    this.renderPregunta(this.currentIndex, hojasConHover, this.rana, vidas, puntos);
  }
  private renderPregunta(
    index: number,
    hojasConHover: Phaser.GameObjects.GameObject[],
    rana: Phaser.GameObjects.Sprite,
    vidas: number,
    puntos: number
  ): void {
    const preguntaActual = globalState.data[index];
    const containerPregunta = this.add.dom(400, 105, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerPregunta.setClassName('gameFrog__containerPregunta');
    const htmlcontainerPregunta = containerPregunta.node as HTMLElement;
    htmlcontainerPregunta.innerHTML = `
        <div class="gameFrog__container_numero_pregunta">
        <p class="u-sr-only">pregunta numero ${index + 1} de ${globalState.data.length}</p>
        <p> ${index + 1}/${globalState.data.length}</p>
        </div>
        <p>${preguntaActual.question}</p>
        `;
    containerPregunta.setY(50); // Arriba de su posición final
    containerPregunta.setAlpha(0); // Invisible al inicio
    this.tweens.add({
      targets: containerPregunta,
      y: 105, // Posición final
      alpha: 1, // Visibilidad completa
      duration: 600, // Duración de la animación
      ease: 'Power2' // Efecto suave
    });
    //creacion del container para las opciones de respuesta
    const containerOpciones = this.add.dom(400, 350, 'div', '', '') as Phaser.GameObjects.DOMElement;
    containerOpciones.setClassName('gameFrog__containerOpciones');
    const htmlcontainerOpciones = containerOpciones.node as HTMLElement;

    htmlcontainerOpciones.innerHTML = preguntaActual.options
      .map((opcion, i) => {
        const letra = String.fromCharCode(65 + i); // A, B, C...
        return `
          <div class="gameFrog__opcion">
            <div class="gameFrog__opcion_indice"><strong>${letra}</strong></div>
              <button class="gameFrog__btn_option" data-id="${globalState.data[0].options[i].id}" data-state="${opcion.state}">
              ${opcion.label}
            </button>
          </div>`;
      })
      .join('');

    const botones = htmlcontainerOpciones.querySelectorAll('.gameFrog__btn_option');

    botones.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        console.log(target.dataset.id);
        containerOpciones.destroy();
        containerPregunta.destroy(); // Destruir el contenedor de la pregunt
        const jump = this.sound.add('jump', { volume: 0.5 });
        if (globalState.specificMusic) {
          jump.play();
        }
        const dataId = target.dataset.id; // Obtener el id del botón clickeado
        if (dataId === '1-1') {
          this.moveGroupAndAddHojas('right');
          this.crearMasHojas('left');
          this.rana.anims.play('jump', true);
          this.rana.angle = -70;
        } else if (dataId === '1-2') {
          this.moveGroupAndAddHojas('top');
          this.rana.anims.play('jump', true);
          this.crearMasHojas('top');
          this.rana.angle = 0;
        } else if (dataId === '1-3') {
          this.rana.angle = 80;
          this.rana.anims.play('jump', true);
          this.moveGroupAndAddHojas('left');
          this.crearMasHojas('right');
        }
        const estado = target.dataset.state;
        resetearPosiciones = true;
        if (estado === 'success') {
          resultado = true;
          this.time.delayedCall(2000, () => {
            puntos += 100; // Aumenta los puntos
            globalState.puntos = puntos;
            const puntosDOM = document.querySelector('.gameFrog__numero_puntos strong');
            if (puntosDOM) {
              puntosDOM.textContent = String(puntos); // Actualiza el número en el DOM
            }
            const success = this.sound.add('success', { volume: 0.5 });
            if (globalState.specificMusic) {
              success.play();
            }
          });
        } else if (estado === 'wrong') {
          vidas--; // Resta una vida
          globalState.vidas = vidas;
          resultado = false;
          // Actualiza el estado global de vidas

          this.time.delayedCall(1500, () => {
            hojasConHover.forEach((hoja) => {
              const sprite = hoja as Phaser.GameObjects.Sprite;
              sprite.anims.play('hundimiento2', true);
              if (globalState.specificMusic) {
                this.SplashSound.play();
              }
              sprite.once('animationcomplete', () => {
                this.tweens.add({
                  targets: sprite,
                  alpha: 0,
                  duration: 500,
                  ease: 'Power1'
                });
                this.tweens.add({
                  targets: rana,
                  alpha: 0,
                  duration: 500,
                  ease: 'Power1'
                });
              });
            });
            const vidasDOM = document.getElementById('vidasContador');
            if (vidasDOM) {
              vidasDOM.textContent = vidas.toString(); // Actualiza el número en el DOM
            }
          });
        }
        const eventInformationResult = new CustomEvent('informationResult', {
          detail: resultado
        });
        window.dispatchEvent(eventInformationResult);
        this.time.delayedCall(4000, () => {
          if (vidas === 0) {
            globalState.vidas = vidas;
            this.scene.start('endGameScene');
            resultado = null;
          }
          this.currentIndex++;
          // Si el índice es mayor o igual a la cantidad total de preguntas, reinicia a 0

          if (resetearPosiciones && this.currentIndex < globalState.data.length) {
            this.renderPregunta(this.currentIndex, hojasConHover, rana, vidas, puntos);
            this.oculatarHojas();
            // Reiniciar el contenedor de opciones y preguntas
            resetearPosiciones = false;
          } else {
            const saltos = 4;
            let saltoActual = 0;
            const posicionInicialX = 400;
            const desplazamiento = -150; // Distancia por salto
            const orilla = this.add.image(400, 50, 'orilla').setScale(0.8);
            orilla.setDepth(0);
            const realizarSalto = () => {
              if (saltoActual < saltos) {
                // Ejecutar animación de salto
                rana.play('jump', true);
                rana.setY(posicionInicialX + saltoActual * desplazamiento);
                if (globalState.specificMusic) {
                  jump.play();
                  sonidoCroar.play();
                }
                // Esperar un poco antes de hacer el siguiente salto
                this.time.delayedCall(600, () => {
                  saltoActual++;

                  realizarSalto(); // Llamar al siguiente salto
                });
              } else {
                this.time.delayedCall(1000, () => {
                  this.scene.start('endGameScene');
                });
              }
            };
            realizarSalto();

            this.input.enabled = false;
            this.oculatarHojas();
          }
        });
      });
    });
    const eventInformationQuestion = new CustomEvent('informationQuestion', {
      detail: globalState.data[this.currentIndex].id
    });
    window.dispatchEvent(eventInformationQuestion);
    globalState.vidas = vidas;
  }
  private resetearHojas() {
    // Recorremos cada hoja en el grupo
    const hojasNuevas = this.hojas.getChildren().forEach((hoja, index) => {
      if (hoja instanceof Phaser.GameObjects.Sprite) {
        // Obtenemos la posición inicial según el índice
        const pos = this.posiciones[index];
        if (pos) {
          hoja.setPosition(pos.x, pos.y); // Reestablece la posición
          hoja.setVisible(true); // Vuelve a hacerla visible
          hoja.alpha = 1; // Opcional: asegurar opacidad completa
        }
      }
    });
    this.tweens.add({
      targets: hojasNuevas,
      y: 2000,
      alpha: 1,
      duration: 1000,
      ease: 'Sine.easeOut',
      delay: 100
    });
    this.rana.angle = 0;
    this.rana.setAlpha(1);
    this.rana.setDepth(1);
  }
  private moveGroupAndAddHojas(direccion: Direccion): void {
    // Mover cada hoja del grupo 100 píxeles a la derecha
    this.hojas.children.each((child: Phaser.GameObjects.GameObject) => {
      if (child instanceof Phaser.Physics.Arcade.Sprite) {
        this.tweens.add({
          targets: this.hojas.getChildren(), // Todos los objetos del grupo
          x: direccion == 'left' ? '-=150' : direccion == 'right' ? '+=150' : '+=0',
          y: direccion == 'left' ? '+=60' : direccion == 'right' ? '+=40' : '+=145',

          duration: 2000, // Duración de 1000 ms (1 segundo)
          ease: 'Power2'
        });
      }
      // Mover cada hoja del grupo suavemente 100 píxeles a la derecha

      return null;
    });
  }
  private crearMasHojas(direccion: Direccion): void {
    let posiciones: Posicion[] = [];
    if (direccion == 'left') {
      posiciones = [
        { x: 100 - 150, y: 350 - 60 },
        { x: 100 - 150, y: 200 - 60 },
        { x: 100 - 150, y: 50 - 60 }
      ];
    } else if (direccion == 'right') {
      posiciones = [
        { x: 700 + 150, y: 350 - 40 },
        { x: 700 + 150, y: 200 - 40 },
        { x: 700 + 150, y: 50 - 40 }
      ];
    } else if (direccion == 'top') {
      posiciones = [
        { x: 100, y: 30 - 150 },
        { x: 250, y: 80 - 150 },
        { x: 400, y: 20 - 150 },
        { x: 550, y: 70 - 150 },
        { x: 700, y: 20 - 150 }
      ];
    }

    // grupo de hojas de la derecha
    this.hojasNuevasGroup = this.physics.add.staticGroup();
    posiciones.forEach((pos, index) => {
      const hojaNuevas = this.hojasNuevasGroup.create(pos.x, pos.y, 'hundimiento2') as Phaser.Physics.Arcade.Sprite;
      hojaNuevas.setScale(0.8);
      hojaNuevas.setInteractive();
      hojaNuevas.setData('id', `hoja_Nuevas${index}`); // Asignar un identificador único

      this.hojasNuevasGroup.children.each((child: Phaser.GameObjects.GameObject) => {
        if (child instanceof Phaser.Physics.Arcade.Sprite) {
          this.tweens.add({
            targets: this.hojasNuevasGroup.getChildren(), // Todos los objetos del grupo
            x: direccion == 'left' ? '+=150' : direccion == 'right' ? '-=150' : '+=0',
            y: direccion == 'left' ? '+=60' : direccion == 'right' ? '+=40' : '+=145',
            duration: 2000, // Duración de 1000 ms (1 segundo)
            ease: 'Power2'
          });
        }
        // Mover cada hoja del grupo suavemente 100 píxeles a la derecha

        return null;
      });
    });
  }

  private hoverOpciones(hojaConHover: Phaser.GameObjects.GameObject): void {
    hojaConHover.on('pointerover', () => {
      this.tweens.add({
        targets: hojaConHover,
        scale: 0.9,
        duration: 200,
        ease: 'Power1'
      });
    });

    hojaConHover.on('pointerout', () => {
      this.tweens.add({
        targets: hojaConHover,
        scale: 0.8,
        duration: 200,
        ease: 'Power1'
      });
    });
  }

  private oculatarHojas() {
    const hojasArray = this.hojas.getChildren();
    hojasArray.forEach((hoja) => {
      const sprite = hoja as Phaser.GameObjects.Sprite;
      sprite.setVisible(false);
      sprite.anims.stop();
      sprite.setFrame(0);
    });
    const hojasNuevasGroup = this.hojasNuevasGroup.getChildren();
    hojasNuevasGroup.forEach((hoja) => {
      const sprite = hoja as Phaser.GameObjects.Sprite;
      sprite.setVisible(false);
      sprite.anims.stop();
    });
    this.resetearHojas();
    if (globalState.specificMusic) {
      sonidoCroar.play();
    }
  }
  // En MainScene (cuando respondes una pregunta)
}
