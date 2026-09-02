import type { State } from "./types";

export function initialState(): State {
  return {
    player: { aisleId: "entrada" },
    stand: null,
    focusSkuId: null,
    basket: [],
    lastWitness: null,
    pendingNeed: null,
  };
}

type Listener = () => void;

function createStore(initial: State) {
  let state = initial;
  const listeners = new Set<Listener>();

  return {
    getState(): State {
      return state;
    },
    setState(updater: State | ((current: State) => State)): void {
      state = typeof updater === "function" ? updater(state) : updater;
      for (const listener of listeners) listener();
    },
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const store = createStore(initialState());

export function resetStore(): void {
  store.setState(initialState());
}
