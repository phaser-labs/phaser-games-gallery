export const announce = (message: string) => {
  const announcer = document.getElementById('game-announcer');
  if (announcer) {
    announcer.textContent = message;
  } else {
    console.warn('Announcer element #game-announcer not found in DOM.');
  }
};

export const announceGuardian = (title: string, bodyHtml: string) => {
  // Convierte HTML a texto plano (para SR)
  const tmp = document.createElement('div');
  tmp.innerHTML = bodyHtml;

  const bodyText = (tmp.textContent || tmp.innerText || '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  announce(`${title}. ${bodyText}`);
}

