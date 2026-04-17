import type { Advice } from "./types/types";


export const globalState = {
    advices: [] as Advice[],
};

export function loadAdvices(advices: Advice[]) {
    globalState.advices = advices;
}

