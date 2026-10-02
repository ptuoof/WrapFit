import { Body, Controller, Get, HttpCode, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { GoogleProfile, SessionMeta } from '../../common/interfaces/auth.interfaces';
import { AppConfigService } from '../../config/app-config.type';
import { SafeUser } from '../users/user.select';
import { AuthCookieService } from './auth-cookie.service';
import { ACCESS_COOKIE, DEFAULT_LOGIN_REDIRECT, REFRESH_COOKIE } from './auth.constants';
import { AuthResult, AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { readOAuthState } from './strategies/oauth-state.store';

// Stricter limit than the global default to slow down brute force / credential stuffing.
const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

/** Tokens are never returned in the body: they are set as HttpOnly cookies (`wf_access`, `wf_refresh`). */
export interface AuthSessionResponse {
  user: SafeUser;
  /** Access token lifetime in seconds — refresh shortly before it expires. */
  expiresIn: number;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly cookies: AuthCookieService,
    config: ConfigService,
  ) {
    const env = config as unknown as AppConfigService;
    this.frontendUrl = env.get('FRONTEND_URL', { infer: true }).replace(/\/+$/, '');
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('register')
  @ApiOperation({ summary: 'Create an account (sets the auth cookies)' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponse> {
    return this.startSession(res, await this.authService.register(dto, sessionMeta(req)));
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password (sets the auth cookies)' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponse> {
    return this.startSession(res, await this.authService.login(dto, sessionMeta(req)));
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(200)
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate the refresh token cookie and issue a new access token cookie' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthSessionResponse> {
    try {
      const result = await this.authService.refresh(req.cookies?.[REFRESH_COOKIE] ?? '', sessionMeta(req));
      return this.startSession(res, result);
    } catch (error) {
      // A dead session must not linger in the browser.
      this.cookies.clearAuthCookies(res);
      throw error;
    }
  }

  @Public()
  @HttpCode(204)
  @Post('logout')
  @ApiOperation({ summary: 'Revoke the current session and clear the auth cookies' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (refreshToken) await this.authService.logout(refreshToken);
    this.cookies.clearAuthCookies(res);
  }

  @ApiCookieAuth(ACCESS_COOKIE)
  @HttpCode(204)
  @Post('logout-all')
  @ApiOperation({ summary: 'Revoke every session of the current user (all devices)' })
  async logoutAll(@CurrentUser('id') userId: string, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.authService.revokeAllForUser(userId);
    this.cookies.clearAuthCookies(res);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @UseGuards(GoogleOAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Start "Sign in with Google" (browser redirect, not callable from fetch/XHR)' })
  @ApiQuery({
    name: 'redirect',
    required: false,
    description: 'Frontend path to open after login, e.g. `/p/8f92a1` (default `/dashboard`)',
  })
  googleLogin(): void {
    // GoogleOAuthGuard redirects to Google's consent screen before this runs.
  }

  @Public()
  @UseGuards(GoogleOAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback: sets the auth cookies and redirects to the frontend' })
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const redirect = readOAuthState(req)?.redirect;
    this.cookies.clearOAuthState(res);

    const profile = req.user as GoogleProfile | null | undefined;
    if (!profile) return res.redirect(`${this.frontendUrl}/login?error=google_auth_failed`);

    try {
      this.startSession(res, await this.authService.loginWithGoogle(profile, sessionMeta(req)));
    } catch (error) {
      this.logger.warn(`Google login refused (google id ${profile.googleId}): ${(error as Error).message}`);
      return res.redirect(`${this.frontendUrl}/login?error=google_account_rejected`);
    }
    res.redirect(`${this.frontendUrl}${redirect ?? DEFAULT_LOGIN_REDIRECT}`);
  }

  private startSession(res: Response, result: AuthResult): AuthSessionResponse {
    this.cookies.setAuthCookies(res, result);
    return { user: result.user, expiresIn: result.expiresIn };
  }
}

function sessionMeta(req: Request): SessionMeta {
  return { userAgent: req.get('user-agent')?.slice(0, 512), ipAddress: req.ip };
}
