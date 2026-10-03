import { Role } from '@prisma/client';

/** Payload of the access token. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/** Payload of the refresh token. `jti` is the id of the RefreshToken row. */
export interface RefreshPayload {
  sub: string;
  jti: string;
}

/** The user object attached to `request.user` / `socket.data.user`. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

/** Identity returned by GoogleStrategy after a successful consent. */
export interface GoogleProfile {
  googleId: string;
  email: string;
  emailVerified: boolean;
  fullName?: string;
  avatarUrl?: string;
}

/** Device information stored with each refresh token (one row per session). */
export interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
}
