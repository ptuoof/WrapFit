import { Module } from '@nestjs/common';
import { ConfigService } from '../common/providers/config.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { AccountRecoveryService } from './account-recovery.service';
import { AuthMaintenanceTask } from './auth-maintenance.task';
import { AuthTokensService } from './auth-tokens.service';
import { AuthCookieService } from './auth-cookie.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OAuthStateStore } from './strategies/oauth-state.store';

@Module({
  imports: [
    UsersModule,
    MailModule,
    PassportModule,
    // Global so the WebSocket gateway can verify tokens too. Tokens are signed with explicit secrets in AuthService.
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('auth.jwt.accessSecret'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokensService,
    AccountRecoveryService,
    AuthMaintenanceTask,
    AuthCookieService,
    JwtStrategy,
    GoogleStrategy,
    GoogleOAuthGuard,
    OAuthStateStore,
  ],
})
export class AuthModule {}
