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

/** Lifetime of the link in the "verify your email" message. */
export const VERIFY_EMAIL_TTL_MS = 24 * 60 * 60 * 1000;

/** Lifetime of the link in the "reset your password" message (short: it grants access to the account). */
export const RESET_PASSWORD_TTL_MS = 30 * 60 * 1000;

/** At most one email of each kind per user per minute, and this many per day (resend / forgot password). */
export const AUTH_EMAIL_MIN_INTERVAL_MS = 60 * 1000;
export const AUTH_EMAILS_PER_DAY = 5;
