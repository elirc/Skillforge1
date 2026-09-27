type Lifetime = "singleton" | "transient";
type Registration = { token: string; deps: string[]; lifetime: Lifetime };
type Resolution = { ok: true; created: string[] } | { ok: false; error: string };

export function resolve(registrations: Registration[], root: string) {
  // 1. Index registrations by token; a later registration replaces an earlier one.
  // 2. Resolve root depth-first: build each dependency (in listed order) before
  //    the service itself, then record "<token>#<n>" (n counts instances per token).
  // 3. A singleton is built at most once; a transient is built every time it is needed.
  // 4. Errors (stop at the first one):
  //    "Missing registration: X (required by Y)", or "Missing registration: X" for the root
  //    "Circular dependency: A -> B -> A"
}
