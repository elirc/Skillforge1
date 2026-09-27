interface Subscriber {
  name: string;
  keys: string[]; // [] = useStore() with no selector
}

export function runStore(
  initial: Record<string, unknown>,
  subscribers: Subscriber[],
  updates: Record<string, unknown>[],
): { state: Record<string, unknown>; renders: Record<string, number> } {
  let state = initial;
  const renders: Record<string, number> = {};
  for (const subscriber of subscribers) renders[subscriber.name] = 0;

  for (const patch of updates) {
    // set(patch) merges shallowly and always produces a new state object.
    const next = { ...state, ...patch };
    for (const subscriber of subscribers) {
      const changed =
        subscriber.keys.length === 0
          ? true // the whole state object is new, so a selector-less hook re-renders
          : subscriber.keys.some((key) => !Object.is(state[key], next[key]));
      if (changed) renders[subscriber.name] += 1;
    }
    state = next;
  }

  return { state, renders };
}
