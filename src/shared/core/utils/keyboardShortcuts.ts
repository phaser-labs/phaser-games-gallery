const KEY_CODES = {
  D: 68,
  S: 83,
  C: 67,
  A: 65,
  H: 72
} as const;

/**
 * Función que simula un clic en el elemento especificado por el selector
 * @param selector - El selector CSS del elemento al que se hará clic
 */
const handleShortCut = (selector: string) => {
  const element = document.querySelector(selector) as HTMLElement | null;
  if (!element) return;
  element.click();
};

/**
 * Función que maneja los atajos de teclado
 * @param event - El evento de teclado de React
 */
export const keyboardShortcuts = (event: KeyboardEvent) => {
  const { ctrlKey, altKey, keyCode, which } = event;
  const KEY = keyCode || which;

  // Verificar si se presionan las teclas ctrl y alt simultáneamente
  if (ctrlKey && altKey) {
    // Ejecutar diferentes acciones dependiendo de la tecla presionada
    switch (KEY) {
      case KEY_CODES.D:
        handleShortCut('.js-pagination-link-next');
        break;
      case KEY_CODES.S:
        handleShortCut('.js-pagination-link-previous');
        break;
      case KEY_CODES.C:
        handleShortCut('.js-link-home');
        break;
      case KEY_CODES.A:
        handleShortCut('.js-button-a11y');
        break;
      case KEY_CODES.H:
        handleShortCut('.js-button-help');
        break;
      default:
        break;
    }
  }
};
