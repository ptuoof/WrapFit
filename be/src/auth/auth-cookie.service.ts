import { Injectable } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { ACCESS_COOKIE, ConfigService, REFRESH_COOKIE, REFRESH_COOKIE_PATH } from '../common';
import { OAUTH_STATE_COOKIE, OAUTH_STATE_COOKIE_PATH, OAUTH_STATE_TTL_MS } from './auth.constants';

export interface CookieTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

/**
 * Auth tokens live only in HttpOnly cookies, so page scripts (and XSS) cannot read them.
 * `SameSite=Lax` keeps cookies off cross-site POST/PATCH/DELETE requests, which is the CSRF
 * protection for every state-changing route — GET routes must therefore never change state
 * (the only exception is the anonymous view counter of the public project page).
 */
@Injectable()
export class AuthCookieService {
  private readonly secure: boolean;

  constructor(config: ConfigService) {
    // COOKIE_SECURE, or on by default in production (src/config/envs/production.ts).
    this.secure = config.get('auth.cookieSecure');
  }

  setAuthCookies(res: Response, tokens: CookieTokens): void {
    res.cookie(ACCESS_COOKIE, tokens.accessToken, {
      ...this.base('/api'),
      maxAge: tokens.expiresIn * 1000,
    });
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...this.base(REFRESH_COOKIE_PATH),
      maxAge: tokens.refreshExpiresIn * 1000,
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_COOKIE, this.base('/api'));
    res.clearCookie(REFRESH_COOKIE, this.base(REFRESH_COOKIE_PATH));
  }

  setOAuthState(res: Response, value: string): void {
    res.cookie(OAUTH_STATE_COOKIE, value, { ...this.base(OAUTH_STATE_COOKIE_PATH), maxAge: OAUTH_STATE_TTL_MS });
  }

  clearOAuthState(res: Response): void {
    res.clearCookie(OAUTH_STATE_COOKIE, this.base(OAUTH_STATE_COOKIE_PATH));
  }

  private base(path: string): CookieOptions {
    return { httpOnly: true, secure: this.secure, sameSite: 'lax', path };
  }
}
