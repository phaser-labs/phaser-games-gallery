import { Scene } from 'phaser';

import { EventBus } from '../event-bus';

export class Instructions extends Scene {
  background!: Phaser.GameObjects.Image;
  title!: Phaser.GameObjects.DOMElement;
  instructionsText!: Phaser.GameObjects.DOMElement;
  startButton!: Phaser.GameObjects.DOMElement;

  constructor() {
    super('Instructions');
  }

  create() {
    const { width, height } = this.scale;

    this.createBackgroundSelector();
    this.registry.set('selectedBackground', 'background');

    this.background = this.add
      .image(width / 2, height / 2, 'background')
      .setDisplaySize(width, height)
      .setAlpha(0.3)
      .setDepth(-10);

    const panel = this.add.rectangle(width / 2, height / 2, width - 80, height - 150, 0x000000, 0.7);
    panel.setStrokeStyle(3, 0xffffff);

    this.createTitle();
    this.createInstructions();
    this.createStartButton();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    EventBus.emit('current-scene-ready', this);
  }

  /**
   * Creates the title element for the Instructions scene.
   * The title is a <h1> element with the text "INSTRUCCIONES".
   * The element is styled with a orange color, a cursive font, and a text shadow.
   * The element is added to the scene at the center of the screen, with a y-coordinate of 110 pixels.
   * The element is given a depth of 10, so it appears on top of other elements in the scene.
   */
  private createTitle() {
    const titleElement = document.createElement('h1');
    titleElement.id = 'instructions-title';
    titleElement.textContent = 'INSTRUCCIONES';

    // Estilos para el título
    titleElement.style.cssText = `
      color: #ff9900;
      font-family: 'Bangers', cursive;
      font-size: 42px;
      text-align: center;
      margin: 0;
      padding: 15px 0;
      text-shadow: 2px 2px 0 #000000;
      letter-spacing: 1px;
    `;

    this.title = this.add
      .dom(this.scale.width / 2, 110, titleElement)
      .setOrigin(0.5, 0.5)
      .setDepth(10);
  }

  // Create instructions the game
  private createInstructions() {
    const { width } = this.scale;

    const instructionsElement = document.createElement('div');
    instructionsElement.id = 'instructions-content';

    instructionsElement.innerHTML = `
      <div style="
        font-family: 'Arial', sans-serif;
        font-size: 18px;
        color: #ffffff;
        line-height: 1.4;
        text-align: center;
        padding: 15px;
        max-width: 650px;
        margin: 0 auto;
      ">
        <div style="margin-bottom: 20px; padding: 15px; background: rgba(255, 204, 0, 0.1); border-radius: 10px;">
          <h2 style="color: #ffcc00; margin: 0 0 10px 0; font-size: 22px;">🎯 OBJETIVO</h2>
          <p style="margin: 0;">Responde preguntas correctamente para sumar puntos.</p>
        </div>
        
        <div style="
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin-bottom: 20px;
          text-align: left;
        ">
          <div style="background: rgba(79, 163, 209, 0.1); padding: 15px; border-radius: 10px;">
            <h3 style="color: #4fa3d1; margin: 0 0 8px 0; font-size: 18px;">🖱️ MOUSE</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 16px;">
              <li>Haz clic y mueve</li>
              <li>El avión te sigue</li>
            </ul>
          </div>
          
          <div style="background: rgba(79, 163, 209, 0.1); padding: 15px; border-radius: 10px;">
            <h3 style="color: #4fa3d1; margin: 0 0 8px 0; font-size: 18px;">⌨️ TECLADO</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 16px;">
              <li>Flechas arriba/abajo</li>
            </ul>
          </div>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background: rgba(255, 102, 0, 0.1); border-radius: 10px;">
          <h2 style="color: #ff6600; margin: 0 0 10px 0; font-size: 22px;">🎮 CÓMO JUGAR</h2>
          <ul style="margin: 0; padding-left: 20px; text-align: left; font-size: 16px;">
            <li>Controla el avión con mouse o teclado</li>
            <li>Choca con la respuesta correcta</li>
            <li>+5 puntos por respuesta correcta</li>
            <li>-1 vida por respuesta incorrecta</li>
            <li>Comienzas con 3 vidas</li>
          </ul>
        </div>
      </div>
    `;

    this.instructionsText = this.add
      .dom(width / 2 - 100, this.scale.height / 2, instructionsElement)
      .setOrigin(0.5, 0.5)
      .setDepth(10);
  }

  // Create start button for the start game
  private createStartButton() {
    const { width, height } = this.scale;

    const buttonElement = document.createElement('button');
    buttonElement.id = 'start-game-button';
    buttonElement.textContent = '¡JUGAR!';
    buttonElement.tabIndex = 0;

    // Estilos para el botón
    buttonElement.style.cssText = `
      padding: 15px 40px;
      border-radius: 15px;
      border: 4px solid #ffffff;
      background: linear-gradient(180deg, #00cc00, #009900);
      color: #ffffff;
      font-family: "Bangers", cursive;
      font-size: 26px;
      letter-spacing: 2px;
      cursor: pointer;
      box-shadow: 0 6px 0 #006600;
      outline: none;
      min-width: 200px;
      text-align: center;
      transform: translateY(-50%);
      transition: all 0.2s ease;
      text-shadow: 1px 1px 0 #000000;
    `;

    // Eventos de interacción
    buttonElement.addEventListener('focus', () => {
      buttonElement.style.outline = '3px solid #ffffff';
      buttonElement.style.outlineOffset = '4px';
    });

    buttonElement.addEventListener('blur', () => {
      buttonElement.style.outline = 'none';
    });

    buttonElement.addEventListener('mouseenter', () => {
      buttonElement.style.transform = 'translateY(-52%) scale(1.05)';
      buttonElement.style.boxShadow = '0 8px 0 #006600';
      buttonElement.style.background = 'linear-gradient(180deg, #00ff00, #00cc00)';
    });

    buttonElement.addEventListener('mouseleave', () => {
      buttonElement.style.transform = 'translateY(-50%) scale(1)';
      buttonElement.style.boxShadow = '0 6px 0 #006600';
      buttonElement.style.background = 'linear-gradient(180deg, #00cc00, #009900)';
    });

    buttonElement.addEventListener('mousedown', () => {
      buttonElement.style.transform = 'translateY(-46%)';
      buttonElement.style.boxShadow = '0 3px 0 #006600';
    });

    buttonElement.addEventListener('mouseup', () => {
      buttonElement.style.transform = 'translateY(-52%) scale(1.05)';
      buttonElement.style.boxShadow = '0 8px 0 #006600';
    });

    // Crear el DOMElement en Phaser
    this.startButton = this.add
      .dom(width / 2, height - 80, buttonElement)
      .setOrigin(0.5, 0.5)
      .setDepth(10);

    // Agregar listener para clic
    this.startButton.addListener('click');
    this.startButton.on('click', () => {
      this.startGame();
    });

    // También permitir acceso por teclado
    this.startButton.addListener('keydown');
    this.startButton.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        this.startGame();
      }
    });
  }

  private startGame() {
    this.shutdown();
    this.scene.start('Game');
  }

  private createBackgroundSelector() {
    const { width, height } = this.scale;

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '14px';
    wrapper.style.background = 'rgba(0,0,0,0.45)';
    wrapper.style.padding = '16px';
    wrapper.style.borderRadius = '16px';
    wrapper.style.width = '240px'; // ⬅️ más grande

    const title = document.createElement('span');
    title.innerText = 'Seleccionar escenario';
    title.style.color = '#ffcc00';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '18px';

    wrapper.appendChild(title);

    const optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.gap = '14px';
    optionsContainer.style.maxHeight = '380px';
    optionsContainer.style.overflowY = 'auto';
    optionsContainer.style.paddingRight = '6px';

    optionsContainer.style.scrollbarWidth = 'thin';
    optionsContainer.style.scrollbarColor = '#ffcc00 transparent';

    const backgrounds = ['background', 'background-2', 'background-3'];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let selectedIndex = 0;

    backgrounds.forEach((key, index) => {
      const img = document.createElement('img');
      img.src = `assets/quiz-flight/images/scenary-${index + 1}.png`;

      img.style.width = '220px';
      img.style.height = '120px';
      img.style.objectFit = 'cover';
      img.style.cursor = 'pointer';
      img.style.borderRadius = '12px';
      img.style.border = '3px solid transparent';
      img.style.transition = 'all 0.2s ease';
      img.tabIndex = 0;

      const select = () => {
        selectedIndex = index;
        this.registry.set('selectedBackground', key);

        this.background.setTexture(key);

        [...optionsContainer.children].forEach((c) => {
          (c as HTMLElement).style.border = '3px solid transparent';
        });

        img.style.border = '3px solid #ffcc00';
        img.focus();
      };

      img.addEventListener('click', select);

      img.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.04)';
      });

      img.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });

      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select();
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = optionsContainer.children[index + 1] as HTMLElement;
          next?.focus();
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = optionsContainer.children[index - 1] as HTMLElement;
          prev?.focus();
        }
      });

      img.addEventListener('focus', () => {
        img.style.outline = 'none';
        img.style.boxShadow = '0 0 0 3px rgba(255,204,0,0.7)';
      });

      img.addEventListener('blur', () => {
        img.style.boxShadow = 'none';
      });

      optionsContainer.appendChild(img);
    });

    wrapper.appendChild(optionsContainer);

    this.add
      .dom(width - 200, height / 2, wrapper)
      .setOrigin(0.5)
      .setDepth(12);
  }

  /**
   * Destroys all the elements created in the Instructions scene.
   *This method is called when the scene is changed.
   *It removes all the event listeners and destroys the Phaser elements.
   */
  shutdown() {
    if (this.title) this.title.destroy();
    if (this.instructionsText) this.instructionsText.destroy();
    if (this.startButton) {
      this.startButton.removeListener('click');
      this.startButton.removeListener('keydown');
      this.startButton.destroy();
    }
  }
}
