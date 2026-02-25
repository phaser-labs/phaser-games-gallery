import { dataGames } from "@/data/data-games";

export const getGamesByAccessibility = (accessibility: 'reduced' | 'full') => {
  return dataGames.filter(game => game.accesibility === accessibility);
};

export const getFullAccessibilityGames = () => getGamesByAccessibility('full');

export const getReducedAccessibilityGames = () => getGamesByAccessibility('reduced');