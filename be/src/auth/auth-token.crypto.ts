import { createHash, createHmac } from 'crypto';

/**
 * One-time email tokens (verify email, reset password) are derived from their row id with a server secret, so neither
 * the database (it stores SHA-256 of the token only) nor the mail queue (it carries the row id only) holds a usable
 * link. The token is shown to nobody but the recipient of the email.
 */
export function rawAuthToken(secret: string, authTokenId: string): string {
  return createHmac('sha256', secret).update(`wrapfit:auth-token:${authTokenId}`).digest('base64url');
}

export function hashAuthToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
