export function createSlider(sliderData: { title: string; image: string; audio: string; description: string }[]) {
  const carousel = document.getElementById('carousel');
  if (!carousel) return;

  // Limpia contenido previo
  carousel.innerHTML = '';

  // Crea cada slide dinámicamente
  sliderData.forEach((item, index) => {
    const slide = document.createElement('div');

    // Asigna clase inicial
    if (index === 0) slide.className = 'selected';
    else if (index === 1) slide.className = 'next';
    else if (index === 2) slide.className = 'nextRightSecond';
    else slide.className = 'hideRight';

    slide.innerHTML = `
      <h3>${item.title}</h3>
      <img src="${item.image}" alt="${item.title}" />
      <p>${item.description}</p>
      <audio controls src="${item.audio}"></audio>
    `;

    carousel.appendChild(slide);
  });

  // Función para cambiar la selección
  function moveToSelected(element: HTMLElement | string) {
    let selected;

    if (element === 'next') {
      selected = document.querySelector('.selected')?.nextElementSibling as HTMLElement;
    } else if (element === 'prev') {
      selected = document.querySelector('.selected')?.previousElementSibling as HTMLElement;
    } else {
      selected = element as HTMLElement;
    }

    if (!selected) return;

    const next = selected.nextElementSibling as HTMLElement;
    const prev = selected.previousElementSibling as HTMLElement;
    const prevSecond = prev?.previousElementSibling as HTMLElement;
    const nextSecond = next?.nextElementSibling as HTMLElement;

    document.querySelectorAll('#carousel div').forEach((el) => (el.className = ''));

    selected.classList.add('selected');
    if (prev) prev.classList.add('prev');
    if (next) next.classList.add('next');
    if (prevSecond) prevSecond.classList.add('prevLeftSecond');
    if (nextSecond) nextSecond.classList.add('nextRightSecond');

    let el = nextSecond?.nextElementSibling as HTMLElement;
    while (el) {
      el.className = 'hideRight';
      el = el.nextElementSibling as HTMLElement;
    }

    el = prevSecond?.previousElementSibling as HTMLElement;
    while (el) {
      el.className = 'hideLeft';
      el = el.previousElementSibling as HTMLElement;
    }
  }

  // // Teclas izquierda/derecha
  // document.addEventListener('keydown', (e) => {
  //   if (e.key === 'ArrowLeft') moveToSelected('prev');
  //   else if (e.key === 'ArrowRight') moveToSelected('next');
  // });

  // Clic en slides
  document.querySelectorAll('#carousel div').forEach((el) => {
    el.addEventListener('click', () => moveToSelected(el as HTMLElement));
  });

  // Botones
  document.getElementById('prev')?.addEventListener('click', () => moveToSelected('prev'));
  document.getElementById('next')?.addEventListener('click', () => moveToSelected('next'));
}
