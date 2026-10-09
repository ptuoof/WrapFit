import { ExecutionContext, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '../../common/providers/config.service';
import { AuthGuard } from '@nestjs/passport';

/**
 * Starts the Google consent redirect (`GET /auth/google`) and completes it (`GET /auth/google/callback`).
 * Failures (cancelled consent, bad state, unverified email...) do not throw: `req.user` is left empty
 * so the controller can send the browser back to the frontend with an error instead of a JSON 401.
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleOAuthGuard.name);
  private readonly enabled: boolean;

  constructor(config: ConfigService) {
    super({ session: false, prompt: 'select_account' });
    this.enabled = !!config.get('auth.google.clientId');
  }

  canActivate(context: ExecutionContext) {
    if (!this.enabled) {
      throw new ServiceUnavailableException('Google login is not configured on this server');
    }
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: unknown, user: TUser | false, info: unknown): TUser | null {
    if (err) this.logger.warn(`Google login failed: ${err instanceof Error ? err.message : String(err)}`);
    else if (!user) this.logger.warn(`Google login rejected: ${JSON.stringify(info ?? null)}`);
    return user || null;
  }
}
