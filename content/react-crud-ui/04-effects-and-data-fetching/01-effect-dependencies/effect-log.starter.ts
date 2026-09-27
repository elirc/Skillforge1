// A dependency is a primitive or an object. JSON cannot carry object identity,
// so an object dep is written { ref: "id" }: two deps with the same ref are the
// SAME object; different refs are different objects, even with equal contents.
type Dep = string | number | boolean | null | { ref: string };

interface Options {
  strictMode: boolean; // development Strict Mode
  unmountAtEnd: boolean;
}

// `renders[i]` is the dependency array passed to one useEffect on render i + 1,
// or null when the effect has no dependency array at all.
// Return the log of what React does, as strings:
// - render 1 mounts: "run 1". In Strict Mode (dev only) mounting is followed by
//   an extra "cleanup 1", "run 1".
// - later renders: if the deps changed, log "cleanup <n>" for the render whose
//   effect last ran, then "run <this render>". Nothing otherwise.
//   Changed means: no array (null), or any element differs by Object.is
//   (object deps compare by ref). [] never changes.
//   Compare against the PREVIOUS RENDER's deps.
// - if unmountAtEnd, finish with "cleanup <n>" for the last effect that ran.
export function effectLog(renders: (Dep[] | null)[], options: Options) {
  const log: string[] = [];
  renders.forEach((deps, index) => {
    log.push(`run ${index + 1}`);
  });
  return log;
}
