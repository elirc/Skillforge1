interface Subscriber {
  name: string;
  keys: string[]; // [] = useStore() with no selector
}

// A Zustand-style store. Components subscribe with a selector:
//   useStore((s) => s.filter)                                  -> keys ["filter"]
//   useStore(useShallow((s) => ({ page: s.page, sort: s.sort }))) -> keys ["page", "sort"]
//   useStore()                                                  -> keys []
// Each update is set(patch): the new state is { ...state, ...patch }, a NEW object.
// After each update, a subscriber re-renders when:
// - keys is []: always (it selected the whole state object, which is new)
// - otherwise: any selected key's value changed by Object.is (objects compare by
//   reference, so a patch with a fresh object counts as a change)
// Return { state, renders } where renders maps each subscriber name (in
// subscriber order) to how many times it re-rendered.
export function runStore(initial: Record<string, unknown>, subscribers: Subscriber[], updates: Record<string, unknown>[]) {
  let state = initial;
  const renders: Record<string, number> = {};
  for (const subscriber of subscribers) renders[subscriber.name] = 0;
  for (const patch of updates) {
    state = { ...state, ...patch };
    // Like a context value: every consumer re-renders on every change.
    for (const subscriber of subscribers) renders[subscriber.name] += 1;
  }
  return { state, renders };
}
