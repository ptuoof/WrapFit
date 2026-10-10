/** Parses the CORS_ORIGINS env value: "*" or a comma-separated list of origins. */
export function parseCorsOrigins(raw: string): '*' | string[] {
  const value = raw.trim();
  if (value === '*') return '*';
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Origins a browser request may come from: CORS_ORIGINS and the frontend (FRONTEND_URL). `null` when CORS_ORIGINS is
 * "*" (local development): any origin is accepted.
 */
export function allowedOrigins(corsOrigins: string, frontendUrl: string): Set<string> | null {
  const origins = parseCorsOrigins(corsOrigins);
  return origins === '*' ? null : new Set([...origins, new URL(frontendUrl).origin]);
}

/** True when `origin` is in `allowed`, or is the host the request was sent to (same origin, e.g. Swagger UI). */
export function isAllowedOrigin(origin: string, allowed: Set<string>, host: string | undefined): boolean {
  if (allowed.has(origin)) return true;
  try {
    return host !== undefined && new URL(origin).host === host;
  } catch {
    return false; // "null" (sandboxed frames, file://) or garbage
  }
}
