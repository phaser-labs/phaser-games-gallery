import gsap from 'gsap';
const AnimationsGsap = () => {
  const buttons = document.querySelectorAll('#tapReveal__actions button');

  // Animación en hover
  buttons.forEach((btn) => {
    const img = btn.querySelector('img');

    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        duration: 0.3,
        scale: 1.1,
        backgroundColor: '#0cf365ff',
        boxShadow: '0 6px 16px rgba(0,0,0,0.5)'
      });
      gsap.to(img, {
        duration: 0.5,
        rotate: 360,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        duration: 0.3,
        scale: 1,
        backgroundColor: '#ffffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      });
      gsap.to(btn, {});
      gsap.to(img, {
        duration: 0.5,
        rotate: 0,
        ease: 'power2.inOut'
      });
    });

    // Efecto clic
    btn.addEventListener('click', () => {
      gsap.fromTo(btn, { scale: 1.1 }, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
    });
  });
};
const breakButtonAnimation = (button: HTMLElement) => {
  if (!button) return;
  const rect = button.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // Crear un contenedor para los fragmentos
  const fragmentContainer = document.createElement('div');
  fragmentContainer.style.position = 'absolute';
  fragmentContainer.style.top = rect.top + 'px';
  fragmentContainer.style.left = rect.left + 'px';
  fragmentContainer.style.width = width + 'px';
  fragmentContainer.style.height = height + 'px';
  fragmentContainer.style.pointerEvents = 'none';
  document.body.appendChild(fragmentContainer);

  // Dividir el botón en 4 fragmentos
  for (let i = 0; i < 4; i++) {
    const fragment = document.createElement('div');
    fragment.style.position = 'absolute';
    fragment.style.width = width / 2 + 'px';
    fragment.style.height = height / 2 + 'px';
    fragment.style.background = getComputedStyle(button).backgroundColor;
    fragment.style.top = i < 2 ? '0px' : height / 2 + 'px';
    fragment.style.left = i % 2 === 0 ? '0px' : width / 2 + 'px';
    fragment.style.borderRadius = '5px';
    fragmentContainer.appendChild(fragment);
    gsap.to(fragment, {
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300,
      rotation: Math.random() * 720,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      onComplete: () => {
        fragment.remove();
      }
    });
    // Ocultar el botón original
    button.style.display = 'none';
    gsap.to(button, { opacity: 0, duration: 0.2 });
  }
  setTimeout(() => {
    fragmentContainer.remove();
  }, 1500);
};

const shakingAnimation = (indicator: HTMLElement, rotation: number) => {
  gsap.to(indicator, {
    keyframes: [
      { rotation: rotation + 5, duration: 0.05 },
      { rotation: rotation - 5, duration: 0.05 },
      { rotation: rotation + 4, duration: 0.05 },
      { rotation: rotation - 4, duration: 0.05 },
      { rotation: rotation, duration: 0.05 }
    ],
    ease: 'power1.inOut'
  });
};
const bounceAnimation = (trophy: HTMLElement) => {
  if (!trophy) return; // seguridad

  gsap.fromTo(
    trophy,
    { scale: 0.8 }, // estado inicial
    {
      scale: 1, // estado final
      transformOrigin: 'center center',
      duration: 1,
      ease: 'elastic.out(1, 0.3)' // rebote tipo bounce
    }
  );
};
const showTitleAnimation = (title: NodeListOf<HTMLSpanElement>) => {
  if (!title) return;
  gsap.from(title, {
    x: -100,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    ease: 'bounce.out'
  });
};
const moveContainerAnimation = (divContainer: HTMLElement, rotateY: number, rotateX: number, scaleHover: number) => {
  gsap.to(divContainer, {
    rotateY: rotateY,
    rotateX: rotateX,
    scale: scaleHover,
    transformPerspective: 1000,
    transformOrigin: 'center',
    duration: 0.4,
    ease: 'power2.out'
  });
};
const animationsButtonsMenu = (btn: HTMLElement, ripple: HTMLElement) => {
  gsap.fromTo(
    btn,
    {
      scale: 1,
      rotation: 0,
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    },
    {
      scale: 1.2,
      rotation: 10,
      boxShadow: '0 0 25px rgba(255,255,255,0.8)',
      duration: 0.3,
      ease: 'elastic.out(1, 0.4)',
      yoyo: true,
      repeat: 1
    }
  );
  gsap.fromTo(
    ripple,
    { scale: 0, opacity: 1 },
    { scale: 10, opacity: 0, duration: 0.6, onComplete: () => ripple.remove() }
  );
};
const animationsWarningMessage = (
  divMessage: HTMLElement,
  duration: number,
  bounceIntensity: number,
  autoHide: boolean
) => {
  const tl = gsap.timeline();
  tl.fromTo(
    divMessage,
    { y: -40, scale: 0.6, opacity: 0 },
    { y: 0, scale: 1, opacity: 1, duration: 0.6 * bounceIntensity, ease: 'bounce.out' }
  );

  // Pulso / glow (usa filter para brillo)
  tl.to(divMessage, {
    duration: 0.45,
    scale: 1.06,
    filter: 'drop-shadow(0 8px 20px rgba(255,78,80,0.45))',
    ease: 'power2.out'
  });

  // Regresa a normal
  tl.to(divMessage, { duration: 0.25, scale: 1, filter: 'none', ease: 'power2.out' });

  // Pequeño shake (temblor) para reforzar la alerta
  tl.to(divMessage, {
    keyframes: [
      { x: -6, duration: 0.06 },
      { x: 6, duration: 0.06 },
      { x: -4, duration: 0.06 },
      { x: 4, duration: 0.06 },
      { x: 0, duration: 0.06 }
    ],
    ease: 'power1.inOut',
    delay: 0.05
  });

  // Si no se oculta automáticamente, detenemos la timeline aquí
  if (!autoHide) return;

  // Mantener visible el tiempo (duration - margen para fade out)
  tl.to(divMessage, { duration: Math.max(0, (duration - 600) / 1000), opacity: 1 });

  // Salida suave: escala hacia arriba + fade
  tl.to(divMessage, {
    duration: 0.6,
    opacity: 0,
    scale: 1.08,
    ease: 'power2.in',
    onComplete: () => {
      divMessage.remove();
    }
  });
};
const animationLostGame = () => {
  gsap.fromTo(
    '.title span',
    { opacity: 0, y: 80 }, // estado inicial
    {
      opacity: 1,
      y: 0,
      ease: 'back.out(1.7)',
      duration: 0.5,
      stagger: 0.05
    }
  );
};
const animations = {
  AnimationsGsap,
  breakButtonAnimation,
  shakingAnimation,
  bounceAnimation,
  showTitleAnimation,
  moveContainerAnimation,
  animationsButtonsMenu,
  animationsWarningMessage,
  animationLostGame
};
export { animations };
