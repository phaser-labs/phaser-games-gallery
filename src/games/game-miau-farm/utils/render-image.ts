import { Advice } from '../types/types';

export function renderImage(
  imgEl: HTMLImageElement,
  advice: Advice,
  imgTitleEl?: HTMLElement,
  imgAltEl?: HTMLElement
) {
  if (!imgEl) return;

  if (advice.img?.src) {
    imgEl.src = advice.img.src;
    imgEl.alt = advice.img.alt;
    imgEl.title = advice.img.title ?? 'Imagen.';

    imgEl.style.maxWidth = advice.img.width
      ? `${advice.img.width}px`
      : '10rem';

    imgEl.style.width = '100%';
    imgEl.style.display = 'block';

    if (imgTitleEl) {
      imgTitleEl.textContent = advice.img.title ?? 'Imagen.';
    }

    if (imgAltEl) {
      imgAltEl.textContent = advice.img.alt;
    }
  } else {
    imgEl.removeAttribute('src');
    imgEl.style.display = 'none';

    // Limpiar texto aunque no haya imagen
    if (imgTitleEl) imgTitleEl.textContent = '';
    if (imgAltEl) imgAltEl.textContent = '';
  }
}