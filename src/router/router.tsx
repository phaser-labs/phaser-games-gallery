import { useRef } from 'react';
import { Route, Router } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';

import { OvaProvider } from '@/context/ova-context';

import type { Language, PathType } from '../types/types'; 

import { paths } from './paths';

/**
 * Genera un array con los titulos de los paths.
 *
 * @param paths - Array de objetos PathType
 * @returns Array de string con los titulos de las páginas.
 */
const getTitles = (paths: PathType[]): string[] => paths.map(({ title }) => title);

/**
 * Obtiene los strings de las rutas directamente de los objetos PathType.
 *
 * @param pathsArray - Array de objetos PathType
 * @returns Array de strings con las rutas.
 */
const getStringPaths = (pathsArray: PathType[]): string[] => pathsArray.map(({ path }) => path);


const App = () => {
  const refPageTitle = useRef<string | null>(null);

  // Usamos las rutas directamente de tu array `paths`
  const actualRouteStrings = getStringPaths(paths);
  const titles = getTitles(paths);
  const baseTitle = getBasePageTitle();
  const language = getPageLanguage();

  /**
   * Obtiene el titulo inicial de la página.
   */
  function getBasePageTitle() {
    if (refPageTitle.current === null) {
      refPageTitle.current = document.title;
    }
    return refPageTitle.current;
  }

  /**
   * Obtiene el lenguaje de la página
   */
  function getPageLanguage() {
    const lang = document.documentElement?.lang;
    return lang as Language; // Asegúrate que Language esté definido o usa string
  }

  /**
   * Genera las rutas provenientes del archivo paths.
   * Ahora usa `item.path` directamente.
   */
  const createRoutes = (pathsArray: PathType[]): JSX.Element[] =>
    pathsArray.map((item) => (
      // Usamos item.path directamente.
      // La key puede ser item.path si son únicos, o seguir con randomUUID
      <Route key={item.path || window.crypto.randomUUID()} path={item.path}>
         {item.component}
      </Route>
    ));

  return (
    <OvaProvider value={{ routes: actualRouteStrings, baseTitle, lang: language, titles: titles }}>
      <Router hook={useHashLocation}>
       
          {createRoutes(paths)}
       
      </Router>
    </OvaProvider>
  );
};

export default App;