/**
 * Anunciar mensajes a lectores de pantalla usando ARIA Live Region
 */
export function announce(message: string): void {
  const announcer = document.getElementById('game-announcer');
  
  if (!announcer) {
    console.warn('Game announcer element not found');
    return;
  }
  
  // Limpiar el elemento con un pequeño delay para asegurar que el lector de pantalla detecte el cambio
  announcer.textContent = '';
  
  // Usar requestAnimationFrame para asegurar que el DOM se actualice antes del anuncio
  requestAnimationFrame(() => {
    announcer.textContent = message;
    
    // Limpiar después de 3 segundos
    setTimeout(() => {
      announcer.textContent = '';
    }, 3000);
  });
}
