/** Runtime configuration read from the environment. */

/** Base URL of the NestJS API. Defaults to `/api`, which next.config.mjs proxies to the backend. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
