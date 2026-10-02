/** Short-lived access token. Path `/api` so every API route (and the Socket.IO endpoint `/api/socket.io`) receives it. */
export const ACCESS_COOKIE = 'wf_access';

/** Long-lived refresh token. Path `/api/auth` so it is only sent to refresh / logout routes. */
export const REFRESH_COOKIE = 'wf_refresh';
export const REFRESH_COOKIE_PATH = '/api/auth';

/** OAuth `state` (CSRF protection) + where to send the user after Google login. */
export const OAUTH_STATE_COOKIE = 'wf_oauth_state';
export const OAUTH_STATE_COOKIE_PATH = '/api/auth/google';
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

/** Frontend page opened after a successful login when no `redirect` was requested (UC-01). */
export const DEFAULT_LOGIN_REDIRECT = '/dashboard';

/** Only same-site relative paths are accepted as a post-login redirect (prevents open redirects). */
export function safeRedirectPath(value: unknown): string {
  if (typeof value !== 'string' || value.length > 512) return DEFAULT_LOGIN_REDIRECT;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return DEFAULT_LOGIN_REDIRECT;
  if (/[\u0000-\u001f\u007f]/.test(value)) return DEFAULT_LOGIN_REDIRECT;
  return value;
}
