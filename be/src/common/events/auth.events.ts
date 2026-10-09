/**
 * Every session of a user was revoked: logout on all devices, refresh token reuse, password reset, account disabled
 * or deleted, unproven password removed. The WebSocket gateway disconnects the user's sockets, which were
 * authenticated once at the handshake and would otherwise stay open.
 */
export const SESSIONS_REVOKED = 'auth.sessions_revoked';

export interface SessionsRevokedEvent {
  userId: string;
}
