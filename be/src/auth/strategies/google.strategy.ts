import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../../common/providers/config.service';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';
import type { StateStore } from 'passport-oauth2';
import { GoogleProfile } from '../../common/interfaces/auth.interfaces';
import { OAuthStateStore } from './oauth-state.store';

// passport-oauth2 throws at construction without a client id; GoogleOAuthGuard rejects requests while unconfigured.
const NOT_CONFIGURED = 'google-login-not-configured';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService, stateStore: OAuthStateStore) {
    const options: StrategyOptions = {
      clientID: config.get('auth.google.clientId') || NOT_CONFIGURED,
      clientSecret: config.get('auth.google.clientSecret') || NOT_CONFIGURED,
      callbackURL: config.get('auth.google.callbackUrl'),
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
