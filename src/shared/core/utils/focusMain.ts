/**
 * Enfoca en el elemento principal (main)
 */
export const focusMainElement = () => {
  const mainElement = document.querySelector('main#main') as HTMLDivElement;
  if (!mainElement) return;
  mainElement.focus();
};
