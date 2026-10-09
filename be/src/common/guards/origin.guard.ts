import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ConfigService } from '../providers/config.service';
import { allowedOrigins, isAllowedOrigin } from '../utils/cors.util';

/** Methods that never change state (GET routes must not: see AuthCookieService). */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defense on top of the `SameSite=Lax` cookies, which still travel on requests from any subdomain of the site
 * (a file opened on the CDN, a future subdomain). A state-changing request sent by a browser must come from an
 * allowed origin: CORS_ORIGINS, the frontend, or the API itself. Without `Origin`, the `Sec-Fetch-Site` header of
 * the browser decides; requests with neither (curl, other servers) pass, they carry no victim's cookies.
 * Off while CORS_ORIGINS is "*" (local development).
 */
@Injectable()
export class OriginGuard implements CanActivate {
  private readonly allowed: Set<string> | null;

  constructor(config: ConfigService) {
    this.allowed = allowedOrigins(config.get('app.corsOrigins'), config.get('app.frontendUrl'));
  }

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http' || !this.allowed) return true;

    const request = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(request.method)) return true;

    const origin = request.get('origin');
    const allowed = origin
      ? isAllowedOrigin(origin, this.allowed, request.get('host'))
      : !['cross-site', 'same-site'].includes(request.get('sec-fetch-site') ?? '');
    if (!allowed) {
      throw new ForbiddenException({
        code: 'ORIGIN_NOT_ALLOWED',
        message: 'This request must be sent from the WrapFit website',
      });
    }
    return true;
  }
}
