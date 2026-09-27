interface VersionedRequest {
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
}

interface VersionPolicy {
  supported: string[];
  deprecated: string[];
  defaultVersion: string;
}

type VersionResult =
  | { status: 400; error: string }
  | { status: 200; version: string; deprecated: boolean; path: string };

export function resolveVersion(request: VersionedRequest, policy: VersionPolicy): VersionResult {
  const match = /^\/v(\d+)(\/.*)?$/.exec(request.path);
  const fromPath = match ? match[1] : "";
  const path = match ? match[2] ?? "/" : request.path;
  const given = [fromPath, (request.headers["api-version"] ?? "").trim(), (request.query["api-version"] ?? "").trim()].filter(
    (value) => value !== "",
  );
  if (new Set(given).size > 1) return { status: 400, error: "Conflicting API versions" };

  const version = given[0] ?? policy.defaultVersion;
  if (!policy.supported.includes(version)) {
    return { status: 400, error: `Unsupported API version '${version}'. Supported: ${policy.supported.join(", ")}` };
  }
  return { status: 200, version, deprecated: policy.deprecated.includes(version), path };
}
