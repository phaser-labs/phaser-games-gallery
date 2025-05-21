/**
 * Carga un módulo CSS dinámicamente, intentando primero desde una URL remota y, si falla, usando un archivo local.
 *
 * @param {Object} param - Configuración para las rutas CSS.
 * @param {string} param.ui - URL remota del archivo CSS.
 * @param {string} param.local - Ruta local del archivo CSS.
 * @returns {Promise<CSSModuleClasses>} - Promesa que resuelve las clases del módulo CSS.
 *
 * @example
 * const css = await loadCSS({
 *   ui: 'modal-feedback-ui/modal-feedback.module.css',
 *   local: 'modal-feedback-local/modal-feedback.module.css',
 * });
 */
export async function loadCSS({ ui, local }: { ui: string; local: string }): Promise<CSSModuleClasses> {
  // Cargar todos los módulos CSS remotos y locales en tiempo de compilación
  const remoteModules = import.meta.glob('../../ui/components/styles/**/*.css');
  const localModules = import.meta.glob('../components/**/*.css');

  try {
    // Intentar cargar el CSS desde la ruta remota
    const remotePath = `../../ui/components/styles/${ui}`;
    return await loadModule(remotePath, remoteModules, `La ruta remota no existe: ${remotePath}`);
  } catch (error) {
    console.error(' Error al cargar CSS remoto:', error);
    console.log(
      '%c Intentando cargar CSS local... ',
      'background-color: transparent; color: #9d4613; border: 1px solid #9d4613; font-weight: bold; padding: 4px; border-radius: 4px;'
    );
    try {
      // Intentar cargar el CSS desde la ruta local
      const localPath = `../components/${local}`;
      return await loadModule(localPath, localModules, `La ruta local no existe: ${localPath}`);
    } catch (localError) {
      console.error('Error al cargar CSS local:', localError);
      throw new Error('No se pudo cargar el CSS ni de forma remota ni local.');
    }
  }
}


const loadModule = async (
  path: string,
  modules: Record<string, () => Promise<unknown>>,
  errorMessage: string
): Promise<CSSModuleClasses> => {
  if (modules[path]) {
    const module = await modules[path]();
    console.log(
      `%c CSS cargado exitosamente desde: ${path} `,
      'background-color: transparent; color: #14644e; border: 1px solid #14644e; font-weight: bold; padding: 4px; border-radius: 4px;'
    );
    return (module as { default: CSSModuleClasses }).default;
  } else {
    throw new Error(errorMessage);
  }
};
