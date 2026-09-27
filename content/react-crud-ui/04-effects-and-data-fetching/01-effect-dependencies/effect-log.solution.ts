type Dep = string | number | boolean | null | { ref: string };

interface Options {
  strictMode: boolean;
  unmountAtEnd: boolean;
}

function isRef(value: Dep): value is { ref: string } {
  return typeof value === "object" && value !== null;
}

// Object.is for primitives; objects are equal only when they are the same reference.
function sameDep(a: Dep, b: Dep): boolean {
  if (isRef(a) && isRef(b)) return a.ref === b.ref;
  if (isRef(a) || isRef(b)) return false;
  return Object.is(a, b);
}

function depsChanged(prev: Dep[] | null, next: Dep[] | null): boolean {
  if (next === null || prev === null) return true; // no array: run after every render
  if (prev.length !== next.length) return true;
  return next.some((dep, i) => !sameDep(dep, prev[i]));
}

export function effectLog(renders: (Dep[] | null)[], options: Options): string[] {
  const log: string[] = [];
  let lastRun = 0;
  let prevDeps: Dep[] | null = null;

  renders.forEach((deps, index) => {
    const render = index + 1;
    if (render === 1) {
      log.push("run 1");
      // Development Strict Mode stress-tests cleanup with an extra cleanup + setup on mount.
      if (options.strictMode) log.push("cleanup 1", "run 1");
      lastRun = 1;
    } else if (depsChanged(prevDeps, deps)) {
      log.push(`cleanup ${lastRun}`, `run ${render}`);
      lastRun = render;
    }
    // React compares against the previous render's deps, not the last run's.
    prevDeps = deps;
  });

  if (options.unmountAtEnd && renders.length > 0) log.push(`cleanup ${lastRun}`);
  return log;
}
