import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfigService } from '../../config/app-config.type';
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
        secret: (config as unknown as AppConfigService).get('JWT_ACCESS_SECRET', { infer: true }),
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
