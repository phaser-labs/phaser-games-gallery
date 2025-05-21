
/**
 * Hook que genera un rango de números para la paginación.
 * 
 * @param {number} params.count - Número total de páginas.
 * @param {number} params.currentPage - Página actual.
 * @returns {number[]} Array con el rango de números de páginas.
 */

export const usePaginationRange = ({ count, currentPage }: { count: number; currentPage: number }) => {
  const boundaryCount = 1; // Número de páginas al inicio y al final del rango
  const siblingCount = 1; // Número de páginas a mostrar a cada lado de la página actual

  /**
   * Función que genera un array a partir de un rango
   * de valores.
   *
   * @param {Number} start
   * @param {Number} end
   * @returns {Number[]} Array con el rango de números
   */
  const range = (start: number, end: number): number[] => {
    const length = end - start + 1;
    // Genera un array utilizando un Array-like
    return Array.from({ length }, (_, i) => start + i);
  };

  // Array de las páginas del inicio. e.g. [1,2]
  const startPages = range(1, Math.min(boundaryCount, count));
  // Array de las páginas del final. e.g. [9,10]
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(
      // Inicio natural
      currentPage - siblingCount,
      // Limite inferior cuando la página es mayor
      count - boundaryCount - siblingCount * 2 - 1
    ),
    // Mayor que el startPages
    boundaryCount + 2
  );

  const siblingsEnd = Math.min(
    Math.max(
      // Final natural
      currentPage + siblingCount,
      // Limite superior cuando la página es menor
      boundaryCount + siblingCount * 2 + 2
    ),
    // Menor que el endPages
    endPages.length > 0 ? endPages[0] - 2 : count - 1
  );

  return [
    ...startPages,

    ...(boundaryCount + 1 < count - boundaryCount ? [boundaryCount + 1] : []),

    ...range(siblingsStart, siblingsEnd),

    ...(count - boundaryCount > boundaryCount ? [count - boundaryCount] : []),

    ...endPages
  ];
};
