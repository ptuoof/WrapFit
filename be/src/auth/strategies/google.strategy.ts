import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';
import type { StateStore } from 'passport-oauth2';
import { AppConfigService } from '../../config/config.interface';
import { GoogleProfile } from '../../common/interfaces/auth.interfaces';
import { OAuthStateStore } from './oauth-state.store';

// passport-oauth2 throws at construction without a client id; GoogleOAuthGuard rejects requests while unconfigured.
const NOT_CONFIGURED = 'google-login-not-configured';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService, stateStore: OAuthStateStore) {
    const env = config as unknown as AppConfigService;
    const options: StrategyOptions = {
      clientID: env.get('GOOGLE_CLIENT_ID', { infer: true }) || NOT_CONFIGURED,
      clientSecret: env.get('GOOGLE_CLIENT_SECRET', { infer: true }) || NOT_CONFIGURED,
      callbackURL: env.get('GOOGLE_CALLBACK_URL', { infer: true }),
      scope: ['email', 'profile'],
      // passport-oauth2 dispatches on the method arity at runtime; the typings only describe the overloads.
      store: stateStore as unknown as StateStore,
    };
    super(options);
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): GoogleProfile {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new UnauthorizedException('Google account has no email address');

    return {
      googleId: profile.id,
      email: email.trim().toLowerCase(),
      emailVerified: profile._json.email_verified === true,
      fullName: profile.displayName || undefined,
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}
