/** Parses the CORS_ORIGINS env value: "*" or a comma-separated list of origins. */
export function parseCorsOrigins(raw: string): '*' | string[] {
  const value = raw.trim();
  if (value === '*') return '*';
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
