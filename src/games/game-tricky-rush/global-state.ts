import type { SceneConfig, TypeWord } from "./types/types";


export const globalState = {
  words: [] as TypeWord[],
  scene: null as SceneConfig | null,
};

export function loadQuestions(words: TypeWord[]) {
  globalState.words = words;
}

export function setTheme(theme: SceneConfig) {
  globalState.scene = theme;
}
