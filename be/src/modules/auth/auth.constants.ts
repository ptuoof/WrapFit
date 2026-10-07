/** Short-lived access token. Path `/api` so every API route (and the Socket.IO endpoint `/api/socket.io`) receives it. */
export const ACCESS_COOKIE = 'wf_access';

/** Long-lived refresh token. Path `/api/auth` so it is only sent to refresh / logout routes. */
export const REFRESH_COOKIE = 'wf_refresh';
export const REFRESH_COOKIE_PATH = '/api/auth';

/**
 * A refresh token replayed within this window after it was rotated is another tab of the same browser refreshing at
 * the same moment (they share the cookie), not a stolen token: it gets its own new session instead of a logout.
 */
export const REFRESH_REUSE_GRACE_MS = 30_000;

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
  // eslint-disable-next-line no-control-regex -- rejecting control characters is the point of this check
  if (/[\u0000-\u001f\u007f]/.test(value)) return DEFAULT_LOGIN_REDIRECT;
  return value;
}
