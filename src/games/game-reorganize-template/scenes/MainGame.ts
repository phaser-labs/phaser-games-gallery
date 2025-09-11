import React from "react";
import { createRoot } from "react-dom/client";
import Phaser from "phaser";
import { IconButton } from "@atlaskit/button/new";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import ShowMoreIcon from "@atlaskit/icon/glyph/more";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { globalState } from "../utils/globalState";
import type { SentenceType, WorldType } from "../utils/types";
import {
  getCurrentWordCardImages,
  getCurrentThemeName,
  getBackgroundImage,
} from "../utils/themeManager";

import "../styles/GameReorganize.css";
import type PhaserGame from "../main/main";

const announce = (message: string) => {
  const announcer = document.getElementById("game-announcer");
  if (announcer) announcer.textContent = message;
};

export class MainScene extends Phaser.Scene {
  private bg!: Phaser.GameObjects.Image;
  tableBg!: Phaser.GameObjects.Image;
  dropZone!: Phaser.GameObjects.Zone;
  private dropZoneGraphic!: Phaser.GameObjects.Graphics;
  private dropZoneContainer!: Phaser.GameObjects.DOMElement;
  private checkButton!: Phaser.GameObjects.DOMElement;
  private imgContainerPreview!: Phaser.GameObjects.Image;

  // Mapeo de palabras a imágenes (words cards)
  private wordToImageMap: Map<string, string> = new Map();

  private optionsContainer!: Phaser.GameObjects.DOMElement;
  private previewContainer!: Phaser.GameObjects.DOMElement;
   private wordContainer?: Phaser.GameObjects.DOMElement;
   scrollUpButton!: Phaser.GameObjects.DOMElement;
  scrollDownButton!: Phaser.GameObjects.DOMElement;
  textZone!: Phaser.GameObjects.DOMElement;
  btnBackHome!: HTMLButtonElement;

  private currentQuestion!: SentenceType;
  private currentQuestionIndex!: number;
  private originalWords: string[] = []; // La frase en el orden CORRECTO
  private shuffledWords: string[] = []; // El orden inicial desordenado
  private wordsInDropZone: string[] = []; // Array para las palabras en la dropzone

  // Métodos de limpieza
  private cleanupFunctions: (() => void)[] = [];
  private sliderCleanupFunctions: (() => void)[] = [];
  private dropZoneCleanupFunctions: (() => void)[] = [];



  constructor() {
    super("MainScene");
  }

  init(data: { questionIndex?: number }) {
    this.currentQuestionIndex = data.questionIndex ?? 0;
    this.currentQuestion = globalState.questions[this.currentQuestionIndex];
    // Resetear arrays para la nueva pregunta
    this.wordsInDropZone = [];
  }

  create() {
    if (!this.currentQuestion) {
      console.error("Scene creation failed: currentQuestion is not defined.");
      return;
    }

    // Btn para volver a la pagina de instrucciones
    const buttonBackHome = this.add.dom(20, 20, "button");
    buttonBackHome.setDepth(1000);

    this.btnBackHome = buttonBackHome.node as HTMLButtonElement;
    this.btnBackHome.setAttribute("aria-label", "Vuelve al inicio");
    this.btnBackHome.classList.add("btn-back-home-game-reorganize");
    this.btnBackHome.addEventListener("click", () => {
      this.scene.start("InstructionScene");
    });

    this.originalWords = this.currentQuestion.sentence.split(" ");
    this.shuffledWords = Phaser.Utils.Array.Shuffle([...this.originalWords]);

    // Inicializar el mapeo fijo de palabras a imágenes
    this.initializeWordToImageMapping();

    this.createBackground();
    this.createDropZone();
    this.createWordOptionsSlider(); // Crea el slider con las palabras desordenadas
    this.createPreviewOrderContainer(); // Crea el preview y lo actualiza por primera vez
    this.createCheckButton();

    // Escuchar cambios de tema desde React
    const phaserGameInstance = this.game as PhaserGame;
    if (phaserGameInstance && phaserGameInstance.gameEvents) {
      phaserGameInstance.gameEvents.on(
        "themeChanged",
        this.handleThemeChange,
        this
      );
    }

    announce(
      `Pregunta ${this.currentQuestionIndex + 1}. Ordena la frase y presiona revisar. El orden actual es: ${this.shuffledWords.join(" ")}`
    );
  }

  // MÉTODOS DE CREACIÓN DE ELEMENTOS -------------------------------------------------------------------------

  // Metodo para inicializar mapeo de palabras a imagenes (words cards)
  private initializeWordToImageMapping() {
    // Limpiar el mapeo anterior
    this.wordToImageMap.clear();

    // Obtener las imágenes del tema actual
    const currentImages = getCurrentWordCardImages();

    // Asignar una imagen fija a cada palabra única
    this.originalWords.forEach((word, index) => {
      const imageIndex = index % currentImages.length;
      this.wordToImageMap.set(word, currentImages[imageIndex]);
    });
  }
// Metodo para crear fondo main-bg
  private createBackground() {
    // Usar fondo dinámico basado en el tema actual
    const currentTheme = getCurrentThemeName().toLowerCase();
    const backgroundKey = `${currentTheme}-bg-main`;

    // Intentar cargar el fondo específico del tema, si no existe usar el genérico
    const textureExists = this.textures.exists(backgroundKey);
    const finalBackgroundKey = textureExists ? backgroundKey : "bg-main";

    this.bg = this.add
      .image(0, 0, finalBackgroundKey)
      .setOrigin(0, 0)
      .setDepth(1);
    this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
  }
// Metodo para crear zona de drop
  private createDropZone() {
    const zoneX = 600;
    const zoneY = 170;
    const zoneWidth = 600;
    const zoneHeight = 600;
    const zoneRadius = 150;

    this.dropZone = this.add
      .zone(zoneX, zoneY, zoneWidth, zoneHeight)
      .setCircleDropZone(zoneRadius - 40);
    this.dropZoneGraphic = this.add.graphics({
      x: zoneX + 3,
      y: zoneY - 6,
    });
    this.dropZoneGraphic.setDepth(1);

    // Crear contenedor DOM para la dropzone
    const dropZoneDiv = document.createElement("div");
    dropZoneDiv.className = "drop-zone-container";
    dropZoneDiv.style.position = "absolute";
    dropZoneDiv.style.width = `${zoneRadius * 1.5}px`;
    dropZoneDiv.style.height = `${zoneRadius * 1.5}px`;
    dropZoneDiv.style.borderRadius = "50%";
    dropZoneDiv.style.backgroundColor = "transparent";
    dropZoneDiv.style.backgroundSize = "cover"

    this.dropZoneContainer = this.add
      .dom(zoneX, zoneY, dropZoneDiv)
      .setOrigin(0.5)
      .setDepth(2);

    // Establecer el fondo inicial de la dropzone
    this.updateDropZoneBackground();

    // Configurar dropTarget para la dropzone
    const dropZoneCleanup = dropTargetForElements({
      element: dropZoneDiv,
      getData: () => {
        return { type: "drop-zone" };
      },
      onDragEnter: () => {
        dropZoneDiv.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
      },
      onDragLeave: () => {
        dropZoneDiv.style.backgroundColor = "transparent";
      },
      onDrop: ({ source }) => {
        dropZoneDiv.style.backgroundColor = "transparent";

        const word = source.data.word as string;

        if (word && !this.wordsInDropZone.includes(word)) {
          this.addWordToDropZone(word);
          // Desactivar visualmente la palabra en el slider
          this.updateWordCardState(word, true); // true = disabled
          this.updatePreviewOrder();
        }
      },
    });

    this.dropZoneCleanupFunctions.push(dropZoneCleanup);
  }
// Metodo para crear slider de palabras
  private createWordOptionsSlider() {
    if (this.originalWords.length === 0) {
      console.error("No hay palabras originales para crear el slider.");
      return;
    }

    // Crear contenedor principal que incluirá el slider y los botones
    const mainContainer = document.createElement("div");
    mainContainer.style.position = "relative";
    mainContainer.style.width = "90%";
    mainContainer.style.height = "180px";
    mainContainer.style.left = "-36px";

    //numero de frases por armar
    const totalQuestions = globalState.questions.length;
    const currentQuestion = this.currentQuestionIndex + 1;

    // Establecer la variable CSS para el texto de la pregunta
    const questionTextContent = `Frase ${currentQuestion} de ${totalQuestions}`;
    mainContainer.style.setProperty(
      "--question-text",
      `"${questionTextContent}"`
    );

    const sliderContainer = document.createElement("div");
    sliderContainer.className = "word-slider-container";
    sliderContainer.style.display = "grid";
    sliderContainer.style.gap = "16px";

    const nameTheme = getCurrentThemeName().toLowerCase();
    if (nameTheme === "halloween") {
      sliderContainer.style.bottom = "-12px";

      mainContainer.className = "mainContainer-game-reorganize";
    } else if (nameTheme === "universo") {
      sliderContainer.style.bottom = "15px";

      mainContainer.className = "mainContainer-game-reorganize2";
    } else {
      sliderContainer.style.bottom = "30px";
      mainContainer.className = "mainContainer-game-reorganize-default";
    }
    sliderContainer.style.overflowY = "hidden";
    sliderContainer.style.overflowX = "hidden";
    sliderContainer.style.scrollBehavior = "smooth";
    sliderContainer.style.scrollbarWidth = "none"; // Firefox
    // Ocultar scrollbar en WebKit browsers
    const style = document.createElement("style");
    style.textContent = `
      .word-slider-container::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);

    this.shuffledWords.forEach((word) => {
      const card = this.createWordCard(word);
      sliderContainer.appendChild(card);
    });

    // Crear botones de scroll
    this.createScrollButtons(mainContainer, sliderContainer);

    // Agregar el slider al contenedor principal
    mainContainer.appendChild(sliderContainer);

    this.optionsContainer = this.add
      .dom(
        this.cameras.main.width / 2,
        this.cameras.main.height - 80,
        mainContainer
      )
      .setOrigin(0.5);

    // Configurar dropTarget para el sliderContainer (para reordenar dentro del slider)
    const sliderDropTargetCleanup = dropTargetForElements({
      element: sliderContainer,
      getData: () => {
        return { type: "slider-container" };
      },
      onDragEnter: () => {
        sliderContainer.classList.add("drag-over");
      },
      onDragLeave: () => {
        sliderContainer.classList.remove("drag-over");
      },
      onDrop: ({ source, location }) => {
        sliderContainer.classList.remove("drag-over");
        const draggedWord = source.data.word as string;
        const dropTarget = location.current.dropTargets[0];

        if (
          draggedWord &&
          dropTarget &&
          dropTarget.element instanceof HTMLElement
        ) {
          const targetWord = dropTarget.element
            .closest(".word-card")
            ?.getAttribute("data-word") as string;

          if (draggedWord && targetWord && draggedWord !== targetWord) {
            this.reorderWordsInSlider(draggedWord, targetWord);
          }
        }
      },
    });

    this.sliderCleanupFunctions.push(sliderDropTargetCleanup);
  }
// Metodo para crear botones de scroll
  private createScrollButtons(
    mainContainer: HTMLDivElement,
    sliderContainer: HTMLDivElement
  ) {
    // Botón de scroll hacia arriba
    const scrollUpBtn = document.createElement("button");
    scrollUpBtn.className = "scroll-arrow-button";
    scrollUpBtn.innerHTML = "▲";
    scrollUpBtn.setAttribute("aria-label", "Desplazar hacia arriba");
    scrollUpBtn.style.right = "-8px";

    // Botón de scroll hacia abajo
    const scrollDownBtn = document.createElement("button");
    scrollDownBtn.className = "scroll-arrow-button";
    scrollDownBtn.innerHTML = "▼";
    scrollDownBtn.setAttribute("aria-label", "Desplazar hacia abajo");
    scrollDownBtn.style.position = "absolute";
    scrollDownBtn.style.right = "-8px";

    const nameTheme = getCurrentThemeName().toLowerCase();
    if (nameTheme === "halloween") {
      scrollUpBtn.style.top = "428px";
      scrollDownBtn.style.bottom = "-8px";
    } else if (nameTheme === "universo") {
      scrollUpBtn.style.top = "408px";
      scrollDownBtn.style.bottom = "8px";
    } else {
      scrollUpBtn.style.top = "370px";
      scrollDownBtn.style.bottom = "32px";
    }

    // Efectos hover para los botones
    const addHoverEffects = (button: HTMLButtonElement) => {
      button.addEventListener("mouseenter", () => {
        button.style.transform = "scale(1.1)";
        button.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.5)";
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "scale(1)";
        button.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.3)";
      });
    };

    addHoverEffects(scrollUpBtn);
    addHoverEffects(scrollDownBtn);

    // Funcionalidad de scroll
    const scrollAmount = 140; // Altura aproximada de una fila de tarjetas

    scrollUpBtn.addEventListener("click", () => {
      sliderContainer.style.overflowY = "auto";
      sliderContainer.scrollBy({
        top: -scrollAmount,
        behavior: "smooth",
      });
      // Ocultar scroll después de un momento
      setTimeout(() => {
        sliderContainer.style.overflowY = "hidden";
      }, 500);
    });

    scrollDownBtn.addEventListener("click", () => {
      sliderContainer.style.overflowY = "auto";
      sliderContainer.scrollBy({
        top: scrollAmount,
        behavior: "smooth",
      });
      // Ocultar scroll después de un momento
      setTimeout(() => {
        sliderContainer.style.overflowY = "hidden";
      }, 500);
    });

    // Soporte para scroll con rueda del mouse
    sliderContainer.addEventListener("wheel", (e) => {
      e.preventDefault();
      sliderContainer.style.overflowY = "auto";
      sliderContainer.scrollBy({
        top: e.deltaY,
        behavior: "smooth",
      });
      // Ocultar scroll después de un momento
      setTimeout(() => {
        sliderContainer.style.overflowY = "hidden";
      }, 500);
    });

    // Agregar botones al contenedor principal
    mainContainer.appendChild(scrollUpBtn);
    mainContainer.appendChild(scrollDownBtn);

    // Guardar referencias para cleanup
    this.scrollUpButton = this.add.dom(0, 0, scrollUpBtn);
    this.scrollDownButton = this.add.dom(0, 0, scrollDownBtn);
  }
// Funcion para crear tarjeta de palabra
  private createWordCard(word: string): HTMLDivElement {
    const card = document.createElement("div");
    card.className = "word-card";
    card.setAttribute("data-word", word.trim());
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.style.position = "relative";

    // Contenido de la tarjeta
    const image = document.createElement("img");
    // Usar la imagen fija asignada a esta palabra
    const assignedImage = this.wordToImageMap.get(word);
    if (assignedImage) {
      image.src = assignedImage;
    } else {
      image.src = "assets/game-reorganize-template/images/placeholder.png";
    }
    image.alt = "Imagen de la palabra";
    image.className = "word-card-image";
    card.appendChild(image);

    const wordText = document.createElement("span");
    wordText.textContent = word;
    wordText.className = "word-card-text";
    const theme = getCurrentThemeName();

    if (theme === "Universo") {
      wordText.style.color = "var(--clr-text-primary)";
      wordText.style.textShadow = "0 1px 2px rgb(46 46 46 / 80%)";
    } else if (theme === "Halloween") {
      wordText.style.color = "var(--clr-text-dark)";
    } else if (theme === "Cocina") {
      wordText.style.color = "var(--clr-text-dark)";
    }

    card.appendChild(wordText);

    // Contenedor para el DropdownMenu de Atlaskit
    const dropdownContainer = document.createElement("div");
    dropdownContainer.className = "word-card-dropdown";
    dropdownContainer.style.position = "absolute";
    dropdownContainer.style.top = "5px";
    dropdownContainer.style.right = "5px";
    card.appendChild(dropdownContainer);

    // Crear el componente React DropdownMenu con trigger personalizado
    const DropdownComponent = React.createElement(
      DropdownMenu,
      {
        trigger: ({ triggerRef, ...props }) => {
          return React.createElement(IconButton, {
            ...props,
            icon: ShowMoreIcon,
            id: "dropdown-menu",
            label: "Opciones de palabra",
            ref: triggerRef as unknown as React.Ref<HTMLButtonElement>,
          });
        },
        placement: "top-end",
        onOpenChange(args) {
          if (args.isOpen) {
            card.classList.add("zIndex");
          } else {
            card.classList.remove("zIndex");
          }
        },
        shouldRenderToParent: true,
      },
      React.createElement(
        DropdownItemGroup,
        {
          id: "dropdown-menu-group",
          children: null,
        },
        React.createElement(
          DropdownItem,
          {
            children: "Mover a la izquierda",
            onClick: () => this.moveWordLeft(word),
            isDisabled: this.wordsInDropZone.includes(word),
          },
          "Mover a la izquierda"
        ),
        React.createElement(
          DropdownItem,
          {
            children: "Mover a la derecha",
            onClick: () => this.moveWordRight(word),
            isDisabled: this.wordsInDropZone.includes(word),
          },
          "Mover a la derecha"
        ),
        React.createElement(
          DropdownItem,
          {
            children: "Enviar a",
            onClick: () => this.sendWordToDropZone(word),
            isDisabled: this.wordsInDropZone.includes(word),
          },
          "Enviar a"
        ),
        React.createElement(
          DropdownItem,
          {
            children: "Sacar de",
            onClick: () => this.leaveWordToDropZone(word),
            isDisabled: !this.wordsInDropZone.includes(word),
          },
          "Sacar de"
        )
      )
    );

    // Renderizar el componente React en el contenedor
    const root = createRoot(dropdownContainer);
    root.render(DropdownComponent);

    // Configurar draggable para cada tarjeta
    const draggableCleanup = draggable({
      element: card,
      dragHandle: card, // Toda la tarjeta es draggable
      getInitialData: () => ({ word }),
      onDragStart: () => {
        card.classList.add("dragging");
      },
      onDrop: () => {
        card.classList.remove("dragging");
      },
    });

    // Configurar dropTarget para cada tarjeta (para reordenamiento)
    const dropTargetCleanup = dropTargetForElements({
      element: card,
      getData: () => ({ word }),
      onDragEnter: () => {
        card.classList.add("drag-over");
      },
      onDragLeave: () => {
        card.classList.remove("drag-over");
      },
      onDrop: ({ source }) => {
        card.classList.remove("drag-over");
        const draggedWord = source.data.word as string;
        const targetWord = word;

        if (draggedWord && targetWord && draggedWord !== targetWord) {
          this.reorderWordsInSlider(draggedWord, targetWord);
        }
      },
    });

    this.sliderCleanupFunctions.push(draggableCleanup, dropTargetCleanup);

    return card;
  }
// Metodo para reordenar palabras en el slider
  private reorderWordsInSlider(draggedWord: string, targetWord: string) {
    const draggedIndex = this.shuffledWords.indexOf(draggedWord);
    const targetIndex = this.shuffledWords.indexOf(targetWord);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Reordenar en el array
      this.shuffledWords.splice(draggedIndex, 1);
      this.shuffledWords.splice(targetIndex, 0, draggedWord);

      // Re-renderizar el slider
      this.renderWordOptionsSlider();
      this.updatePreviewOrder();
    }
  }
// Metodo para mover palabra a la izquierda
  private moveWordLeft(word: string) {
    const index = this.shuffledWords.indexOf(word);
    if (index > 0) {
      [this.shuffledWords[index], this.shuffledWords[index - 1]] = [
        this.shuffledWords[index - 1],
        this.shuffledWords[index],
      ];
      this.renderWordOptionsSlider();
      this.updatePreviewOrder();
    }
  }
// Metodo para mover palabra a la derecha
  private moveWordRight(word: string) {
    const index = this.shuffledWords.indexOf(word);
    if (index < this.shuffledWords.length - 1) {
      [this.shuffledWords[index], this.shuffledWords[index + 1]] = [
        this.shuffledWords[index + 1],
        this.shuffledWords[index],
      ];
      this.renderWordOptionsSlider();
      this.updatePreviewOrder();
    }
  }
// Metodo para enviar palabra a la dropzone
  private sendWordToDropZone(word: string) {
    if (!this.wordsInDropZone.includes(word)) {
      this.addWordToDropZone(word);
      // No eliminamos la palabra del slider, solo la desactivamos visualmente
      this.updateWordCardState(word, true); // true = disabled
      this.updatePreviewOrder();
    }
  }
// Metodo para sacar palabra de la dropzone
  private leaveWordToDropZone(word: string) {
    // Verificar si la palabra está en la dropzone antes de intentar sacarla
    if (this.wordsInDropZone.includes(word)) {
      this.returnWordToSlider(word);
    }
  }
// Metodo para actualizar el estado de la tarjeta de palabra
  private updateWordCardState(word: string, disabled: boolean) {
    // Buscar la tarjeta de palabra en el slider y actualizar su estado visual
    const sliderContainer = this.optionsContainer.node as HTMLDivElement;
    const wordCards = sliderContainer.querySelectorAll(".word-card");

    wordCards.forEach((card) => {
      const cardElement = card as HTMLElement;
      if (cardElement.getAttribute("data-word") === word) {
        if (disabled) {
          cardElement.classList.add("disabled");
          // Deshabilitar el draggable cuando está en dropzone
          cardElement.style.pointerEvents = "none";
          // Pero mantener el dropdown activo
          const dropdown = cardElement.querySelector(".word-card-dropdown");
          if (dropdown) {
            (dropdown as HTMLElement).style.pointerEvents = "auto";
            (dropdown as HTMLElement).style.opacity = "1";
            (dropdown as HTMLElement).style.zIndex = "999";
            (dropdown as HTMLElement).style.backgroundColor =
              "rgba(255, 255, 255, 0.2)";
            (dropdown as HTMLElement).style.borderRadius = "6px";
          }
        } else {
          cardElement.classList.remove("disabled");
          cardElement.style.pointerEvents = "auto";
        }
      }
    });
  }
// Metodo para agregar palabra a la dropzone
  private addWordToDropZone(word: string) {
    // Reproducir sonido de drop antes de las animaciones
    this.playDropSound();

    this.wordsInDropZone.push(word);

    // Crear elemento visual para la palabra en la dropzone
    this.wordContainer = this.add.dom(0, 0, "div").setDepth(10);
    const wordElement = this.wordContainer.node as HTMLDivElement;
    wordElement.classList.add("word-in-dropzone");

    const nameTheme = getCurrentThemeName().toLowerCase();

    if (nameTheme.includes("universo")) {
      wordElement.style.marginBottom = "12px";
    }

    // Usar la imagen fija asignada a esta palabra
    const assignedImage = this.wordToImageMap.get(word);
    wordElement.innerHTML = `
      <button aria-label="${word}" data-word="${word}" class="btn-in-dropzone">
        <img class="img-btn ingredient-animation" src="${assignedImage}" alt="${word}" />
      </button>`;

    wordElement.setAttribute("data-word", word);

    // Permitir devolver la palabra al slider
    wordElement.addEventListener("click", () => {
      this.returnWordToSlider(word);
    });

    this.dropZoneContainer.node.appendChild(wordElement);

    // Aplicar animación específica a la imagen de la palabra
    const imgElement = wordElement.querySelector(
      ".img-btn"
    ) as HTMLImageElement;
    if (imgElement) {
      // Activar la animación según el tema
      const nameTheme = getCurrentThemeName().toLowerCase();

      // Guardar los estilos originales para restaurarlos después
      const originalTransform = imgElement.style.transform;
      const originalFilter = imgElement.style.filter;
      const originalTransition = imgElement.style.transition;

      if (nameTheme === "universo") {
        // Usar GSAP para la animación del tema universo
        import("gsap").then((gsap) => {
          // Aplicar efecto de brillo inicial
          imgElement.style.filter =
            "brightness(1.1) drop-shadow(rgba(128, 0, 255, 0.4) 0px 0px 20px)";

          // Secuencia de animación
          const tl = gsap.default.timeline();

          // Primera parte: escalar hacia arriba mientras gira lentamente
          tl.to(imgElement, {
            duration: 1.0,
            rotation: 180,
            scale: 1.3,
            ease: "power2.out",
            filter:
              "brightness(1.3) drop-shadow(rgba(57, 7, 108, 0.6) 0px 0px 20px)",
          });

          // Segunda parte: completar la rotación y volver al tamaño original
          tl.to(imgElement, {
            duration: 1.0,
            rotation: 360,
            scale: 1,
            ease: "power2.inOut",
            filter:
              "brightness(1) drop-shadow(rgba(46, 4, 88, 0.2) 0px 0px 5px)",
            onComplete: () => {
              // Restaurar los estilos originales
              imgElement.style.transform = originalTransform;
              imgElement.style.filter = originalFilter;
              imgElement.style.transition = originalTransition;
            },
          });
        });
      } else {
        import("gsap").then((gsap) => {
          // Configurar animación según el tema
          let filterEffect = "";
          let color = "rgba(255, 215, 0, 0.7)";

          if (nameTheme === "halloween") {
            color = "rgba(221, 84, 252, 0.7)";
          } else if (nameTheme === "cocina") {
            color = "rgba(255, 215, 0, 0.7)";
          }

          filterEffect = `brightness(1.2) drop-shadow(${color} 0px 0px 15px)`;

          // Secuencia de animación
          const tl = gsap.default.timeline();

          // Animación de caída
          tl.fromTo(
            imgElement,
            { y: -40, scale: 1.2, opacity: 0.6, filter: filterEffect },
            {
              duration: 0.6,
              y: 0,
              scale: 1,
              opacity: 1,
              filter:
                "brightness(1) drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.1))",
              ease: "bounce.inOut",
              onComplete: () => {
                // Restaurar los estilos originales
                imgElement.style.transform = originalTransform;
                imgElement.style.filter = originalFilter;
                imgElement.style.transition = originalTransition;

                // Efecto de splash/burbuja al colocar en la olla

                this.createSplashEffect(600, 160);
              },
            }
          );
        });
      }
    }

    // Verificar si todas las palabras están en la dropzone
    if (this.wordsInDropZone.length === this.originalWords.length) {
      this.checkButton.setVisible(true);
      // Habilitar interactividad solo cuando todas las palabras estén en la dropzone
      this.checkButton.setInteractive({ useHandCursor: true });
      this.checkButton.on("pointerdown", () => this.checkAnswer());
      announce("Todas las palabras están en la zona. ¡Ahora presiona revisar!");
    }

    // Re-renderizar el slider para actualizar los estados de los dropdowns
    this.renderWordOptionsSlider();

    // Restaurar el estado disabled de todas las palabras que están en la dropzone
    this.wordsInDropZone.forEach((wordInDropZone) => {
      this.updateWordCardState(wordInDropZone, true); // true = disabled
    });
  }
// Metodo para renderizar el slider de palabras
  private renderWordOptionsSlider() {
    // Limpiar el contenedor actual
    while (this.optionsContainer.node.firstChild) {
      this.optionsContainer.node.removeChild(
        this.optionsContainer.node.firstChild
      );
    }

    // Limpiar las funciones de cleanup antiguas relacionadas con los draggables del slider
    this.sliderCleanupFunctions.forEach((cleanup) => cleanup());
    this.sliderCleanupFunctions = [];

    // Recrear la estructura completa con botones de scroll
    const mainContainer = this.optionsContainer.node as HTMLDivElement;

    // Establecer la variable CSS para el texto de la pregunta
    const totalQuestions = globalState.questions.length;
    const currentQuestion = this.currentQuestionIndex + 1;
    const questionTextContent = `Frase ${currentQuestion} de ${totalQuestions}`;
    mainContainer.style.setProperty(
      "--question-text",
      `"${questionTextContent}"`
    );

    // Crear nuevo slider container
    const sliderContainer = document.createElement("div");
    sliderContainer.className = "word-slider-container";
    sliderContainer.style.display = "grid";
    sliderContainer.style.gap = "16px";

    // Aplicar el estilo bottom basado en el tema (igual que en createWordOptionsSlider)
    const nameTheme = getCurrentThemeName().toLowerCase();
    if (nameTheme === "halloween") {
      sliderContainer.style.bottom = "-10px";
    } else if (nameTheme === "universo") {
      sliderContainer.style.bottom = "15px";
    } else {
      sliderContainer.style.bottom = "30px";
    }

    sliderContainer.style.overflowY = "hidden";
    sliderContainer.style.overflowX = "hidden";
    sliderContainer.style.scrollBehavior = "smooth";
    sliderContainer.style.scrollbarWidth = "none";
    // Ocultar scrollbar en WebKit browsers
    const style = document.createElement("style");
    style.textContent = `
      .word-slider-container::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);

    this.shuffledWords.forEach((word) => {
      const card = this.createWordCard(word);
      sliderContainer.appendChild(card);
    });

    // Recrear botones de scroll
    this.createScrollButtons(mainContainer, sliderContainer);

    // Agregar el slider al contenedor principal
    mainContainer.appendChild(sliderContainer);

    // Re-configurar el dropTarget para el sliderContainer después de re-renderizar
    const optionsSliderContainer = this.optionsContainer.node as HTMLDivElement;
    const sliderDropTargetCleanup = dropTargetForElements({
      element: optionsSliderContainer,
      getData: () => {
        return { type: "slider-container" };
      },
      onDragEnter: () => {
        optionsSliderContainer.classList.add("drag-over");
      },
      onDragLeave: () => {
        optionsSliderContainer.classList.remove("drag-over");
      },
      onDrop: ({ source, location }) => {
        optionsSliderContainer.classList.remove("drag-over");
        const draggedWord = (source.data as { word?: string }).word;
        const dropTarget = location.current.dropTargets[0];

        if (draggedWord && dropTarget instanceof HTMLElement) {
          const targetWord = dropTarget
            .closest(".word-card")
            ?.getAttribute("data-word");

          if (draggedWord && targetWord && draggedWord !== targetWord) {
            this.reorderWordsInSlider(draggedWord, targetWord);
          }
        }
      },
    });
    this.sliderCleanupFunctions.push(sliderDropTargetCleanup);

    // Restaurar el estado disabled de todas las palabras que están en la dropzone
    // Esto es crucial para mantener la consistencia visual después del re-renderizado
    this.wordsInDropZone.forEach((wordInDropZone) => {
      this.updateWordCardState(wordInDropZone, true); // true = disabled
    });
  }
// Metodo para verificar la respuesta
  private checkAnswer() {
    // Obtiene el orden actual directamente del DOM
    const playerAnswerArray = this.wordsInDropZone;

    const playerAnswerString = playerAnswerArray.join(" ");
    const correctAnswerString = this.originalWords.join(" ");

    const isCorrect = playerAnswerString === correctAnswerString;
    this.onComplete(isCorrect);
  }
  // Metodo para manejar la comprobacion de la respuesta
  private onComplete(isCorrect: boolean) {
    if (!this.checkButton.input) {
      console.warn("Check button input is not defined.");
      return;
    }
    this.checkButton.input.enabled = false;
    this.checkButton.setVisible(false);

    if (isCorrect) {
      announce("¡Correcto! ¡Felicidades!");
      (this.previewContainer.node as HTMLDivElement).style.color = "#228B22";
      (this.previewContainer.node as HTMLDivElement).style.fontWeight = "bold";
      this.sound.play("isCorrect", {
        loop: false,
        volume: 0.2,
      });

      const checkSuccess = this.add.dom(0, 0, "button");
      checkSuccess.node.className = "success-effect";
    } else {
      announce("Casi. El orden no es correcto, inténtalo de nuevo.");
      (this.previewContainer.node as HTMLDivElement).style.color = "#ff0000";
      this.sound.play("isIncorrect", {
        loop: false,
        volume: 0.2,
      });
      const checkError = this.add.dom(0, 0, "button");
      checkError.node.className = "error-effect";
    }

    this.time.delayedCall(1500, () => {
      if (isCorrect) {
        const nextQuestionIndex = this.currentQuestionIndex + 1;
        if (nextQuestionIndex < globalState.questions.length) {
          // Limpiar todos los listeners de Pragmatic Drag and Drop
          this.cleanupFunctions.forEach((cleanup) => cleanup());
          this.cleanupFunctions = []; // Resetear el array
          this.scene.restart({ questionIndex: nextQuestionIndex });
        } else {
          // Obtener el tema actual para la transición personalizada
          const nameTheme = getCurrentThemeName().toLowerCase();

          // Crear una transición personalizada según el tema antes de ir a EndScene
          this.createThemeTransition(nameTheme);
        }
      } else {
        // Si es incorrecto, reactivamos todo para que pueda intentarlo de nuevo
        if (this.checkButton.input) {
          this.checkButton.input.enabled = true;
        }

        (this.previewContainer.node as HTMLDivElement).style.color = "#121212";
        this.scene.restart({ questionIndex: this.currentQuestionIndex });
      }
    });
  }
  // Método para reproducir sonido deñ btn revisar
  private playCheckSound() {
    try {
      const currentTheme = getCurrentThemeName().toLowerCase();
      const checkSoundKey = `${currentTheme}-check-sound`;

      this.sound.play(checkSoundKey, { volume: 0.05 });
    } catch (error) {
      console.warn("Error al reproducir hover sound:", error);
    }
  }
  // Método para reproducir sonido al dropear palabra
  private playDropSound() {
    try {
      const currentTheme = getCurrentThemeName().toLowerCase();
      const dropSoundKey = `${currentTheme}-drop-sound`;

      this.sound.play(dropSoundKey, { volume: 0.1 });
    } catch (error) {
      console.warn("Error al reproducir drop sound:", error);
    }
  }

  // Metodo para devolver palabra al slider(mesa de trabajo)
  private returnWordToSlider(word: string) {
    // Remover la palabra de la dropzone
    this.wordsInDropZone = this.wordsInDropZone.filter((w) => w !== word);

    // Remover el elemento visual de la dropzone
    const wordElements =
      this.dropZoneContainer.node.querySelectorAll(".word-in-dropzone");
    wordElements.forEach((element) => {
      if (element.getAttribute("data-word") === word) {
        element.remove();
      }
    });

    // Agregar la palabra de vuelta al final de shuffledWords si no está presente
    if (!this.shuffledWords.includes(word)) {
      this.shuffledWords.push(word);
    }

    // Re-renderizar el slider para mostrar la palabra devuelta
    this.renderWordOptionsSlider();

    // Reactivar la palabra devuelta en el slider visualmente
    this.updateWordCardState(word, false); // false = enabled

    // Restaurar el estado disabled de todas las palabras que siguen en la dropzone
    this.wordsInDropZone.forEach((wordInDropZone) => {
      this.updateWordCardState(wordInDropZone, true); // true = disabled
    });

    this.updatePreviewOrder();

    // Ocultar el botón de check si es necesario
    if (this.wordsInDropZone.length < this.originalWords.length) {
      this.checkButton.setVisible(false);
      // Deshabilitar interactividad cuando no todas las palabras estén en la dropzone
      this.checkButton.removeInteractive();
    }
  }
  // Creacion del contenedor de preview
  private createPreviewOrderContainer() {
    const previewOrderPositionX = 180;
    const previewOrderPositionY = 180;

    const textZone = document.createElement("div");
    textZone.id = "preview-order-text";

    this.textZone = this.add
      .dom(previewOrderPositionX, previewOrderPositionY, textZone)
      .setOrigin(0.5);
    this.textZone.setDepth(11);
    const previewDiv = document.createElement("div");
    previewDiv.id = "preview-order-container";
    previewDiv.classList.add("preview-order-container");

    //imagen que cambia dinamicamente #2
    const currentTheme = getCurrentThemeName().toLowerCase();
    const previewContainerKey = `${currentTheme}-bg-contain-previewOrder`;
    const textureExists = this.textures.exists(previewContainerKey);
    const finalPreviewContainerKey = textureExists
      ? previewContainerKey
      : "bg-contain-previewOrder";

    this.imgContainerPreview = this.add
      .image(
        previewOrderPositionX,
        previewOrderPositionY,
        finalPreviewContainerKey
      )
      .setDepth(15);

    if (previewContainerKey.includes("halloween")) {
      this.imgContainerPreview.setScale(0.6);
      previewDiv.style.width = "182px";
      previewDiv.style.height = "94px";
      previewDiv.style.left = "0px";
      previewDiv.style.top = "-32px";
    } else if (previewContainerKey.includes("universo")) {
      this.imgContainerPreview.setScale(3.2);
      previewDiv.style.color = "var(--clr-text-primary)";
      previewDiv.style.scrollbarColor = "red";
    } else {
      this.imgContainerPreview.setScale(3);
    }

    this.previewContainer = this.add
      .dom(previewOrderPositionX + 1, previewOrderPositionY + 22, previewDiv)
      .setOrigin(0.5);

    // Llamada inicial para mostrar el orden desordenado por defecto
    this.updatePreviewOrder();
  }

  // Creacion del boton de REVISAR
  private createCheckButton() {
    const checkButtonDom = document.createElement("button");
    checkButtonDom.id = "check-button";
    checkButtonDom.className = "check-button";
    checkButtonDom.style.display = "none";
    checkButtonDom.textContent = "Revisar";
    checkButtonDom.addEventListener("mouseenter", () => {
      this.playCheckSound();
    });

    checkButtonDom.addEventListener("click", () => {
      this.checkAnswer();
    });

    this.checkButton = this.add
      .dom(this.cameras.main.centerX, 300, checkButtonDom)
      .setOrigin(0.5);

    this.checkButton.setDepth(10);
    this.checkButton.setVisible(false);
    // No configurar interactividad inicialmente
    this.checkButton.removeInteractive();
  }

  // LÓGICA DEL JUEGO --------------------------------------------------

  // Método para actualizar el orden previo
  private updatePreviewOrder() {
    // Obtener solo las palabras activas del slider (no las desactivadas)
    const activeSliderWords = this.shuffledWords.filter(
      (word) => !this.wordsInDropZone.includes(word)
    );
    const dropZoneWords = this.wordsInDropZone;

    // Mostrar primero las palabras de la dropzone, luego las activas del slider
    const allWords = [...dropZoneWords, ...activeSliderWords];
    const previewText = allWords.join(" ");

    // El 'node' del DOMElement es el div que creamos.
    (this.previewContainer.node as HTMLDivElement).textContent = previewText;

    announce(`El orden actual de la frase es: ${previewText}`);
  }
  // Método para crear efectos de splash
  private createSplashEffect(x: number, y: number) {
    // Crear partículas de burbuja para simular el splash
    const bubbleCount = 30;

    for (let i = 0; i < bubbleCount; i++) {
      // Crear elemento DOM para cada burbuja
      const bubble = this.add.dom(x, y, "div").setDepth(20);
      const bubbleElement = bubble.node as HTMLDivElement;

      const nameTheme = getCurrentThemeName().toLowerCase();

      if (nameTheme.includes("halloween")) {
        bubbleElement.style.cssText = `
        width: 8px;
        height: 8px;
        background-image: url('assets/game-reorganize-template/images/theme-halloween/burbuja.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: absolute;
        pointer-events: none;
        box-shadow: 0 0 4px rgba(208, 50, 233, 0.5);
      `;
      } else {
        bubbleElement.style.cssText = `
        width: 4px;
        height: 4px;
        background-image: url('assets/game-reorganize-template/images/theme-kitchen/gota-agua.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: absolute;
        pointer-events: none;
        box-shadow: 0 0 4px rgba(55, 165, 243, 0.5);
      `;
      }

      // Animación de las burbujas
      const randomX = x + (Math.random() - 0.5) * 60;
      const randomY = y - Math.random() * 40 - 20;

      this.tweens.add({
        targets: bubble,
        x: randomX,
        y: randomY,
        alpha: 0,
        duration: 700,
        ease: "Power2.easeOut",
        onComplete: () => {
          bubble.destroy();
        },
      });

      // Animación de escala para las burbujas
      this.tweens.add({
        targets: bubble,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 300,
        ease: "Power2.easeOut",
        yoyo: true,
      });
    }
  }

  // Handler para cambios de tema
  private handleThemeChange(_theme: WorldType) {
    // Actualizar el fondo con el nuevo tema
    this.updateBackground();

    // Actualizar el mapeo de imágenes con el nuevo tema
    this.initializeWordToImageMapping();

    // Re-renderizar el slider con las nuevas imágenes
    this.renderWordOptionsSlider();

    // Actualizar las imágenes en la dropzone si hay palabras
    this.updateDropZoneImages();

    // Actualizar la imagen de la dropzone
    this.updateDropZoneBackground();

    // Actualizar la imagen del contenedor de vista previa
    this.updatePreviewContainerImage();

    // Detener todos los sonidos antes de cambiar al nuevo tema
    this.sound.stopAll();
  }

  // Método para actualizar las imágenes en la dropzone
  private updateDropZoneImages() {
    this.wordsInDropZone.forEach((word) => {
      const assignedImage =
        this.wordToImageMap.get(word) || getCurrentWordCardImages()[0];
      const wordElement = this.dropZoneContainer.node.querySelector(
        `[data-word="${word}"]`
      );
      if (wordElement) {
        const imgElement = wordElement.querySelector("img");
        if (imgElement) {
          imgElement.src = assignedImage;
        }
      }
    });
  }

  // Método para actualizar el fondo principal
  private updateBackground() {
    const currentTheme = getCurrentThemeName().toLowerCase();
    const backgroundKey = `${currentTheme}-bg-main`;

    // Intentar cargar el fondo específico del tema, si no existe usar el genérico
    const textureExists = this.textures.exists(backgroundKey);
    const finalBackgroundKey = textureExists ? backgroundKey : "bg-main";

    // Actualizar la textura del fondo existente
    this.bg.setTexture(finalBackgroundKey);
  }

  // Método para crear transiciones personalizadas por tema antes de ir a EndScene
  private createThemeTransition(theme: string) {
    // Primero eliminamos todos los elementos DOM
    this.cleanupDOMElements();

    // Importar GSAP dinámicamente
    import("gsap")
      .then((gsap) => {
        try {
          // Crear un rectángulo que cubrirá toda la pantalla para la transición
          const transitionRect = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000
          );
          transitionRect.setAlpha(0);
          transitionRect.setDepth(1000); // Asegurar que esté por encima de todo

          // Configurar la transición según el tema
          const duration = 2.5;
          const ease = "power2.inOut";

          // Elementos adicionales para la transición según el tema
          const transitionElements: Phaser.GameObjects.GameObject[] = [];

          switch (theme) {
            case "universo":
              // Transición con estrellas y planetas para el tema universo
              const stars = [];
              for (let i = 0; i < 20; i++) {
                const star = this.add.circle(
                  Math.random() * this.cameras.main.width,
                  Math.random() * this.cameras.main.height,
                  Math.random() * 3 + 1,
                  0xffffff
                );
                star.setAlpha(0);
                star.setDepth(1001);
                stars.push(star);
                transitionElements.push(star);
              }

              // Planeta que crece desde el centro
              const planet = this.add.circle(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                10,
                0x8040c0
              );
              planet.setAlpha(0);
              planet.setDepth(1001);
              transitionElements.push(planet);

              // Animación de las estrellas
              stars.forEach((star, index) => {
                gsap.default.to(star, {
                  alpha: 1,
                  delay: index * 0.05,
                  duration: duration * 0.35, // Proporcional a la duración configurada
                  ease: "power1.out",
                });
              });

              // Animación del planeta
              gsap.default.to(planet, {
                alpha: 0.8,
                scale: 30,
                duration: duration * 0.9, // Proporcional a la duración configurada
                delay: 0.5,
                ease: "power2.in",
              });

              // Fondo negro que se desvanece
              gsap.default.to(transitionRect, {
                alpha: 1,
                duration: duration, // Usar la variable duration
                delay: 0.3,
                ease: ease, // Usar la variable ease
                onComplete: () => {
                  // Limpiar elementos y cambiar a EndScene
                  transitionElements.forEach((element) => element.destroy());
                  this.scene.start("EndScene");
                },
              });
              break;

            case "halloween":
              // Transición con murciélagos y niebla para Halloween
              transitionRect.setFillStyle(0x000000);

              // Crear niebla (partículas)
              const fog = [];
              for (let i = 0; i < 15; i++) {
                const fogParticle = this.add.circle(
                  Math.random() * this.cameras.main.width,
                  this.cameras.main.height + 50,
                  Math.random() * 50 + 30,
                  0x663366
                );
                fogParticle.setAlpha(0);
                fogParticle.setDepth(1001);
                fog.push(fogParticle);
                transitionElements.push(fogParticle);
              }

              // Murciélagos (simplificados como triángulos)
              const bats = [];
              for (let i = 0; i < 8; i++) {
                const bat = this.add.triangle(
                  Math.random() * this.cameras.main.width,
                  this.cameras.main.height + 100,
                  0,
                  0,
                  15,
                  -10,
                  30,
                  0,
                  0x000000
                );
                bat.setAlpha(0);
                bat.setDepth(1002);
                bats.push(bat);
                transitionElements.push(bat);
              }

              // Animación de la niebla
              fog.forEach((fogParticle, index) => {
                gsap.default.to(fogParticle, {
                  y: "-=" + (Math.random() * 300 + 200),
                  alpha: 0.7,
                  delay: index * 0.1,
                  duration: 2.0, // Aumentado de 1.7 a 2.0
                  ease: "power1.out",
                });
              });

              // Animación de los murciélagos
              bats.forEach((bat, index) => {
                gsap.default.to(bat, {
                  y: "-=" + (Math.random() * 400 + 300),
                  x: "+=" + (Math.random() * 200 - 100),
                  alpha: 1,
                  delay: index * 0.15,
                  duration: 1.8, // Aumentado de 1.2 a 1.8
                  ease: "power1.out",
                  onUpdate: () => {
                    // Hacer que los murciélagos "aletéen"
                    bat.angle = Math.sin(Date.now() / 100 + index) * 15;
                  },
                });
              });

              // Fondo negro que se desvanece
              gsap.default.to(transitionRect, {
                alpha: 1,
                duration: 2.2, // Aumentado de 1.8 a 2.2
                ease: "power2.inOut",
                onComplete: () => {
                  // Limpiar elementos y cambiar a EndScene
                  transitionElements.forEach((element) => element.destroy());
                  this.scene.start("EndScene");
                },
              });
              break;

            case "cocina":
              // Transición con burbujas y vapor para el tema cocina
              transitionRect.setFillStyle(0xffffff);

              // Crear burbujas
              const bubbles = [];
              for (let i = 0; i < 25; i++) {
                const bubble = this.add.circle(
                  Math.random() * this.cameras.main.width,
                  this.cameras.main.height + 50,
                  Math.random() * 15 + 5,
                  0x88ccff
                );
                bubble.setAlpha(0);
                bubble.setDepth(10001);
                bubble.setStrokeStyle(2, 0xffffff);
                bubbles.push(bubble);
                transitionElements.push(bubble);
              }

              // Vapor (nubes simplificadas)
              const steam = [];
              for (let i = 0; i < 10; i++) {
                const steamCloud = this.add.circle(
                  Math.random() * this.cameras.main.width,
                  this.cameras.main.height,
                  Math.random() * 40 + 20,
                  0xffffff
                );
                steamCloud.setAlpha(0);
                steamCloud.setDepth(10001);
                steam.push(steamCloud);
                transitionElements.push(steamCloud);
              }

              // Animación de las burbujas
              bubbles.forEach((bubble, index) => {
                gsap.default.to(bubble, {
                  y: "-=" + (Math.random() * 400 + 200),
                  x: "+=" + (Math.random() * 100 - 50),
                  alpha: 0.8,
                  delay: index * 0.06,
                  duration: 2.0, // Aumentado de 1.8 a 2.0
                  ease: "power1.out",
                });
              });

              // Animación del vapor
              steam.forEach((steamCloud, index) => {
                gsap.default.to(steamCloud, {
                  y: "-=" + (Math.random() * 200 + 100),
                  alpha: 0.7,
                  scale: "+=" + (Math.random() * 1 + 0.5),
                  delay: index * 0.15,
                  duration: 2.0, // Aumentado de 1.8 a 2.0
                  ease: "power1.out",
                });
              });

              // Fondo blanco que se desvanece
              gsap.default.to(transitionRect, {
                alpha: 1,
                duration: 2.0, // Aumentado de 1.5 a 2.0
                ease: "power2.inOut",
                onComplete: () => {
                  // Limpiar elementos y cambiar a EndScene
                  transitionElements.forEach((element) => element.destroy());
                  this.scene.start("EndScene");
                },
              });
              break;

            default:
              // Transición simple para temas no específicos
              gsap.default.to(transitionRect, {
                alpha: 1,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => {
                  this.scene.start("EndScene");
                },
              });
              break;
          }
        } catch (error) {
          console.error("Error en la transición:", error);
          // En caso de error, ir directamente a EndScene
          this.scene.start("EndScene");
        }
      })
      .catch((error) => {
        console.error("Error al cargar GSAP:", error);
        // En caso de error al cargar GSAP, ir directamente a EndScene
        this.scene.start("EndScene");
      });
  }

  // Método para actualizar el fondo de la dropzone
  private updateDropZoneBackground() {
    if (this.dropZoneContainer) {
      const dropZoneDiv = this.dropZoneContainer.node as HTMLDivElement;

      // Obtener la ruta directa de la imagen de dropzone del tema actual
      const dropzoneImagePath = getBackgroundImage("bg-dropzone");

      if (dropzoneImagePath) {
        dropZoneDiv.style.backgroundImage = `url(${dropzoneImagePath})`;
      } else {
        console.warn("No dropzone image found for current theme");
      }
    }
  }

  // Método para actualizar la imagen del contenedor de vista previa
  private updatePreviewContainerImage() {
    if (this.imgContainerPreview) {
      const currentTheme = getCurrentThemeName().toLowerCase();
      const previewContainerKey = `${currentTheme}-bg-contain-previewOrder`;

      // Verificar si la textura existe en el cache de texturas
      const textureExists = this.textures.exists(previewContainerKey);
      const finalPreviewContainerKey = textureExists
        ? previewContainerKey
        : "bg-contain-previewOrder";

      try {
        // Actualizar la textura de la imagen existente
        this.imgContainerPreview.setTexture(finalPreviewContainerKey);
      } catch (error) {
        console.error(
          "Error al actualizar la textura del contenedor de vista previa:",
          error
        );
        // Intentar usar la textura genérica como fallback
        if (finalPreviewContainerKey !== "bg-contain-previewOrder") {
          try {
            this.imgContainerPreview.setTexture("bg-contain-previewOrder");
          } catch (fallbackError) {
            console.error("Error al usar textura genérica:", fallbackError);
          }
        }
      }
    } else {
      console.warn("imgContainerPreview no está inicializado");
    }
  }

  // Sobrescribimos el método shutdown para limpiar los elementos del DOM
  private cleanupDOMElements() {
    // Remover todos los elementos del DOM para evitar superposiciones con la animación
    if (this.optionsContainer) {
      this.optionsContainer.destroy();
      this.optionsContainer = undefined as any;
    }
    if (this.previewContainer) {
      this.previewContainer.destroy();
      this.previewContainer = undefined as any;
    }
    if (this.dropZoneContainer) {
      this.dropZoneContainer.destroy();
      this.dropZoneContainer = undefined as any;
    }
    if (this.imgContainerPreview) {
      this.imgContainerPreview.destroy();
      this.imgContainerPreview = undefined as any;
    }
    if (this.checkButton) {
      this.checkButton.destroy();
      this.checkButton = undefined as any;
    }
    if (this.scrollUpButton) {
      this.scrollUpButton.destroy();
      this.scrollUpButton = undefined as any;
    }
    if (this.scrollDownButton) {
      this.scrollDownButton.destroy();
      this.scrollDownButton = undefined as any;
    }
    if (this.textZone) {
      this.textZone.destroy();
      this.textZone = undefined as any;
    }
    if (this.wordContainer) {
      this.wordContainer.destroy();
      this.wordContainer = undefined;
    }

    // Limpiar elementos de efectos de éxito y error
    // Buscar y eliminar elementos con clase 'success-effect' y 'error-effect'
    const successElements = document.getElementsByClassName("success-effect");
    while (successElements.length > 0) {
      successElements[0].parentNode?.removeChild(successElements[0]);
    }

    const errorElements = document.getElementsByClassName("error-effect");
    while (errorElements.length > 0) {
      errorElements[0].parentNode?.removeChild(errorElements[0]);
    }

    // Limpiar botones de scroll-arrow-button
    const scrollArrowButtons = document.getElementsByClassName(
      "scroll-arrow-button"
    );
    while (scrollArrowButtons.length > 0) {
      scrollArrowButtons[0].parentNode?.removeChild(scrollArrowButtons[0]);
    }

    // Limpiar todos los listeners de Pragmatic Drag and Drop
    this.cleanupFunctions.forEach((cleanup) => cleanup());
    this.cleanupFunctions = []; // Resetear el array

    // Limpiar todos los listeners de drag and drop del slider
    this.sliderCleanupFunctions.forEach((cleanup) => cleanup());
    this.sliderCleanupFunctions = [];

    // Limpiar todos los listeners de drag and drop de la dropZone
    this.dropZoneCleanupFunctions.forEach((cleanup) => cleanup());
    this.dropZoneCleanupFunctions = [];
  }

  shutdown() {
    // Limpiar todos los elementos DOM
    this.cleanupDOMElements();

    // Limpiar el mapeo de palabras a imágenes
    this.wordToImageMap.clear();

    // Remover listener de cambio de tema
    const phaserGameInstance = this.game as PhaserGame;
    if (phaserGameInstance && phaserGameInstance.gameEvents) {
      phaserGameInstance.gameEvents.off(
        "themeChanged",
        this.handleThemeChange,
        this
      );
    }

    // Limpiar arrays de datos
    this.originalWords = [];
    this.shuffledWords = [];
    this.wordsInDropZone = [];
  }
}
