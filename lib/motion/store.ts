"use client";

import { useSyncExternalStore } from "react";

export type Store<T> = {
  get: () => T;
  set: (patch: Partial<T>) => void;
  subscribe: (fn: () => void) => () => void;
};

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const subs = new Set<() => void>();
  return {
    get: () => state,
    set: (patch) => {
      let changed = false;
      for (const k in patch) {
        if (state[k as keyof T] !== patch[k as keyof T]) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = { ...state, ...patch };
      subs.forEach((fn) => fn());
    },
    subscribe: (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

export function useStore<T extends object, S>(store: Store<T>, selector: (s: T) => S, serverValue?: S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => (serverValue !== undefined ? serverValue : selector(store.get())),
  );
}

/** Global UI state shared between the intro, header, cursor and application overlay. */
export const ui = createStore({
  headerVisible: false,
  introDone: false,
  applicationOpen: false,
  menuOpen: false,
});
