interface OutgoingRequest {
  method: string;
  headers: Record<string, string>;
}

const SAFE = ["GET", "HEAD", "OPTIONS", "TRACE"];
const IDEMPOTENT = [...SAFE, "PUT", "DELETE"];

export function retryPolicy(request: OutgoingRequest): { safe: boolean; idempotent: boolean; autoRetry: boolean } {
  const method = request.method.toUpperCase();
  const safe = SAFE.includes(method);
  const idempotent = IDEMPOTENT.includes(method);
  const hasKey = Object.entries(request.headers).some(
    ([name, value]) => name.toLowerCase() === "idempotency-key" && value.trim() !== "",
  );
  const autoRetry = idempotent || ((method === "POST" || method === "PATCH") && hasKey);
  return { safe, idempotent, autoRetry };
}
