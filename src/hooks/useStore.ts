import { useSyncExternalStore } from "react";
import { store } from "../domain/store";
import type { State } from "../domain/types";

export function useStore(): State {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}
