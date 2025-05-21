// Constantes para las etiquetas de navegación en múltiples idiomas
export const i18n = {
  es: {
    nav: 'Menú principal',
    skipToMain: 'Ir a contenido',
    audioPause: 'Activar audio',
    audioActive: 'Desactivar audio',
    a11y: 'Accesibilidad',
    home: 'Inicio',
    menu: 'Menú',
    help: 'Ayuda',
    shortcuts: 'Atajos de teclado',
    specifications: 'Especificaciones técnicas',
    btnCloseMenu: 'Cerrar modal'
  },
  en: {
    nav: 'Main menu',
    skipToMain: 'Skip to main content',
    audioPause: 'To activate audio',
    audioActive: 'Deactivate audio',
    a11y: 'Accessibility',
    home: 'Home',
    menu: 'Menu',
    help: 'Help',
    shortcuts: 'Keyboard shortcuts',
    specifications: 'Technical specifications',
    btnCloseMenu: 'Close modal'
  }
};

export const i18nTour = {
  es: {
    a11yAudio: 'Activa los audios descriptivos del OVA para una mejor comprensión del contenido visual.',
    a11y: 'Muestra todas las opciones de accesibilidad disponibles.',
    home: 'Ir a la página de inicio.',
    menu: 'Visualiza y navega por todas las páginas del OVA.',
    help: 'Accede a las opciones de ayuda del OVA para obtener asistencia.',
    previous: 'Navega a la página anterior del OVA.',
    next: 'Navega a la siguiente página del OVA.',
    navigation: 'Utiliza esta barra para moverte por el OVA.'
  },
  en: {
    a11yAudio: 'Enable descriptive audio for the OVA to better understand the visual content.',
    a11y: 'Displays all available accessibility options.',
    home: 'Navigate to the homepage of the OVA.',
    menu: 'View and navigate through all pages of the OVA.',
    help: 'Access the OVA help options for assistance.',
    previous: 'Navigate to the previous page of the OVA.',
    next: 'Navigate to the next page of the OVA.',
    navigation: 'Use this bar to navigate through the OVA.'
  }
};

// Expresión regular para extraer el número de la página de la URL
export const PATH_REGEX = /\/page-(\d+)/;

export const HOME_PATH = '/';

export const SPANISH_LANGUAGE = 'es';

export const MODAL = Object.freeze({
  ESPECIFICATION: 'especification'
});

export const KEYCODE = {
  TAB: 9,
  ESC: 27,
  SPACE: 32
};
