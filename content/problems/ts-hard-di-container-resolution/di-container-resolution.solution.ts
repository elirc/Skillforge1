type Lifetime = "singleton" | "transient";
type Registration = { token: string; deps: string[]; lifetime: Lifetime };
type Resolution = { ok: true; created: string[] } | { ok: false; error: string };

class ResolveError extends Error {}

export function resolve(registrations: Registration[], root: string): Resolution {
  // Later registrations override earlier ones, like most DI containers.
  const byToken = new Map<string, Registration>();
  for (const registration of registrations) byToken.set(registration.token, registration);

  const created: string[] = [];
  const counts = new Map<string, number>();
  const singletons = new Set<string>();
  const stack: string[] = [];

  const build = (token: string, requiredBy: string | null): void => {
    const registration = byToken.get(token);
    if (!registration) {
      throw new ResolveError(
        requiredBy ? `Missing registration: ${token} (required by ${requiredBy})` : `Missing registration: ${token}`,
      );
    }
    if (registration.lifetime === "singleton" && singletons.has(token)) return;

    const cycleStart = stack.indexOf(token);
    if (cycleStart >= 0) {
      throw new ResolveError(`Circular dependency: ${[...stack.slice(cycleStart), token].join(" -> ")}`);
    }

    stack.push(token);
    for (const dep of registration.deps) build(dep, token);
    stack.pop();

    const count = (counts.get(token) ?? 0) + 1;
    counts.set(token, count);
    created.push(`${token}#${count}`);
    if (registration.lifetime === "singleton") singletons.add(token);
  };

  try {
    build(root, null);
    return { ok: true, created };
  } catch (error) {
    if (error instanceof ResolveError) return { ok: false, error: error.message };
    throw error;
  }
}
