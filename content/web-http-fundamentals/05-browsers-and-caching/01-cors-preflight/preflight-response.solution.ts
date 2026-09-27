interface CorsPolicy {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  allowCredentials: boolean;
  maxAgeSeconds: number;
}

type PreflightResult = { allowed: false; reason: string } | { allowed: true; status: 204; headers: Record<string, string> };

export function preflightResponse(policy: CorsPolicy, headers: Record<string, string>): PreflightResult {
  const wildcard = policy.allowedOrigins.includes("*");
  if (wildcard && policy.allowCredentials) {
    return { allowed: false, reason: "Wildcard origin cannot be combined with credentials" };
  }
  const origin = headers["origin"] ?? "";
  if (!wildcard && !policy.allowedOrigins.includes(origin)) return { allowed: false, reason: "Origin not allowed" };

  const method = (headers["access-control-request-method"] ?? "").toUpperCase();
  if (!policy.allowedMethods.map((m) => m.toUpperCase()).includes(method)) {
    return { allowed: false, reason: "Method not allowed" };
  }

  const requested = (headers["access-control-request-headers"] ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter((h) => h !== "");
  const allowedHeaders = policy.allowedHeaders.map((h) => h.toLowerCase());
  const rejected = requested.find((h) => !allowedHeaders.includes(h));
  if (rejected !== undefined) return { allowed: false, reason: `Header '${rejected}' not allowed` };

  const out: Record<string, string> = {
    "Access-Control-Allow-Origin": wildcard ? "*" : origin,
    "Access-Control-Allow-Methods": policy.allowedMethods.join(", "),
  };
  if (requested.length > 0) out["Access-Control-Allow-Headers"] = requested.join(", ");
  if (policy.allowCredentials) out["Access-Control-Allow-Credentials"] = "true";
  out["Access-Control-Max-Age"] = String(policy.maxAgeSeconds);
  if (!wildcard) out["Vary"] = "Origin";
  return { allowed: true, status: 204, headers: out };
}
