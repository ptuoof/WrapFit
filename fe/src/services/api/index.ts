/**
 * HTTP client of the WrapFit NestJS 11 API: JSON requests with the HttpOnly JWT session cookie.
 * Endpoint functions live in `src/api/<module>`.
 */

import { API_BASE_URL } from "@/config";

/** Error of a failed API call, with the HTTP status and the error body (e.g. `code: "PROJECT_VERSION_CONFLICT"`). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: Record<string, unknown> | null,
  ) {
    super(message);
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // send/receive HttpOnly JWT cookies
    });

    if (!res.ok) {
      let errMessage = `HTTP Error ${res.status}`;
      let errData: Record<string, unknown> | null = null;
      try {
        errData = await res.json();
        errMessage = String(errData?.message || errData?.error || errMessage);
      } catch {
        // ignore
      }
      throw new ApiError(errMessage, res.status, errData);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  } catch (err: any) {
    console.warn(`[WrapFit API] Request to ${url} failed:`, err.message);
    throw err;
  }
}
