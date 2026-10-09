/**
 * Auth cookies, set by the auth module and read by every authenticated route (the Swagger docs of each controller name
 * ACCESS_COOKIE). Kept in common/ so feature modules do not depend on the auth module for a cookie name.
 */

/** Short-lived access token. Path `/api` so every API route (and the Socket.IO endpoint `/api/socket.io`) receives it. */
export const ACCESS_COOKIE = 'wf_access';

/** Long-lived refresh token. Path `/api/auth` so it is only sent to refresh / logout routes. */
export const REFRESH_COOKIE = 'wf_refresh';
export const REFRESH_COOKIE_PATH = '/api/auth';
