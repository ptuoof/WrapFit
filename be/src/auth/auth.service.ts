import { ConflictException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../common/providers/config.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { GoogleProfile, JwtPayload, RefreshPayload, SessionMeta } from '../common/interfaces/auth.interfaces';
import { PrismaService } from '../shared/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { presentUser, SafeUser, toSafeUser, userSelect } from '../users/user.select';
import { UsersService } from '../users/users.service';
import { AccountRecoveryService } from './account-recovery.service';
import { AuthTokensService } from './auth-tokens.service';
import { REFRESH_REUSE_GRACE_MS } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** Access token lifetime in seconds. */
  expiresIn: number;
  /** Refresh token lifetime in seconds. */
  refreshExpiresIn: number;
}

export interface AuthResult extends TokenPair {
  user: SafeUser;
}

// Compared against when the email is unknown, so response time does not reveal whether an account exists.
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.4o0n0o1Yb1Uq8wq1jU1ZpU3dQ6vK';

/** 403 with a stable code: the frontend offers to resend the verification email. */
export const emailNotVerified = () =>
  new ForbiddenException({
    code: 'EMAIL_NOT_VERIFIED',
    message: 'Verify your email address before signing in: open the link we emailed you, or ask for a new one',
  });

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly authTokens: AuthTokensService,
    private readonly mail: MailService,
    private readonly recovery: AccountRecoveryService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Registration answers the same way whether the address is new or not, so it never tells who has an account; only
   * the email sent differs (see AccountRecoveryService.handleRepeatedSignup for an existing address). A new account
   * gets its verification link; no session is opened until the email is verified. A failure to queue the email does
   * not fail the registration (the user can ask for a resend).
   */
  async register(dto: RegisterDto): Promise<void> {
    // Hashed in every case: the time to answer does not tell an existing address either.
    const passwordHash = await bcrypt.hash(dto.password, this.config.get('auth.bcryptRounds'));
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) return this.recovery.handleRepeatedSignup(existing);

    let tokenId: string | null = null;
    try {
      await this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: { email: dto.email, passwordHash, fullName: dto.fullName },
          select: { id: true },
        });
        tokenId = await this.authTokens.issue(tx, created.id, 'VERIFY_EMAIL');
      });
    } catch (error) {
      // Two registrations of the same address at the same moment: the second one is a repeated registration.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const winner = await this.usersService.findByEmail(dto.email);
        if (winner) return this.recovery.handleRepeatedSignup(winner);
      }
      throw error;
    }
    if (tokenId) await this.mail.sendAuthEmail(tokenId);
  }

  async login(dto: LoginDto, meta: SessionMeta = {}): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    // Google-only accounts have no password hash: they are compared against the dummy hash and always fail.
    const passwordValid = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !user.passwordHash || !passwordValid || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Only told after the password matched: the answer reveals nothing to someone who does not know it.
    if (!user.emailVerifiedAt) throw emailNotVerified();

    const safeUser = toSafeUser(user);
    return { user: safeUser, ...(await this.issueTokens(safeUser, meta)) };
  }

  /**
   * Signs in with a Google identity: finds the account by Google id, otherwise links the Google identity to the
   * account with the same (Google-verified) email, otherwise creates a new password-less account.
   */
  async loginWithGoogle(profile: GoogleProfile, meta: SessionMeta = {}): Promise<AuthResult> {
    if (!profile.emailVerified) throw new UnauthorizedException('Google account email is not verified');

    let user = await this.usersService.findByGoogleId(profile.googleId);
    if (!user) {
      const existing = await this.usersService.findByEmail(profile.email);
      if (existing?.googleId) {
        throw new ConflictException('This email is already linked to another Google account');
      }
      user = existing
        ? await this.usersService.linkGoogleAccount(existing, profile)
        : await this.usersService.createFromGoogle(profile);
    }
    if (!user.isActive) throw new UnauthorizedException('Account is disabled');

    const safeUser = toSafeUser(user);
    return { user: safeUser, ...(await this.issueTokens(safeUser, meta)) };
  }

  /**
   * Rotates the refresh token: the presented one is revoked and a new pair is issued. Replaying a revoked token logs
   * the user out everywhere (it may have been stolen), except right after a rotation: tabs share the cookie and
   * refresh at the same moment, so the slower one gets its own new session (REFRESH_REUSE_GRACE_MS).
   */
  async refresh(refreshToken: string, meta: SessionMeta = {}): Promise<AuthResult> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const record = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    if (!record || record.userId !== payload.sub) throw new UnauthorizedException('Invalid refresh token');
    if (record.expiresAt <= new Date()) throw new UnauthorizedException('Refresh token expired');

    // Atomic claim: only one concurrent request can revoke the token and take its place.
    const replacementId = randomUUID();
    const claimed = await this.prisma.refreshToken.updateMany({
      where: { id: record.id, revokedAt: null },
      data: { revokedAt: new Date(), replacedById: replacementId },
    });
    if (claimed.count === 1) return this.startSession(record.userId, meta, replacementId);

    // Already revoked, possibly a moment ago by the request that won the claim above.
    const current = await this.prisma.refreshToken.findUnique({
      where: { id: record.id },
      select: { revokedAt: true, replacedById: true },
    });
    const justRotated =
      current?.replacedById && current.revokedAt && Date.now() - current.revokedAt.getTime() < REFRESH_REUSE_GRACE_MS;
    if (justRotated) return this.startSession(record.userId, meta);

    // A revoked token being replayed means it may have been stolen: kill every session of this user.
    await this.revokeAllForUser(record.userId);
    throw new UnauthorizedException('Refresh token reuse detected');
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { id: payload.jti, userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Logging out with an invalid/expired token is a no-op.
    }
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async verifyRefreshToken(token: string): Promise<RefreshPayload> {
    try {
      return await this.jwtService.verifyAsync<RefreshPayload>(token, {
        secret: this.config.get('auth.jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /** New token pair for an active, verified user (refresh). */
  private async startSession(userId: string, meta: SessionMeta, refreshId?: string): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { ...userSelect },
    });
    if (!user || !user.isActive || !user.emailVerifiedAt) throw new UnauthorizedException('Invalid refresh token');
    return { user: presentUser(user), ...(await this.issueTokens(user, meta, refreshId)) };
  }

  private async issueTokens(
    user: Pick<SafeUser, 'id' | 'email' | 'role'>,
    meta: SessionMeta,
    refreshId: string = randomUUID(),
  ): Promise<TokenPair> {
    const accessTtl = this.config.get('auth.jwt.accessTtlSeconds');
    const refreshTtl = this.config.get('auth.jwt.refreshTtlSeconds');

    await this.prisma.refreshToken.create({
      data: {
        id: refreshId,
        userId: user.id,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt: new Date(Date.now() + refreshTtl * 1000),
      },
    });

    const accessPayload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const refreshPayload: RefreshPayload = { sub: user.id, jti: refreshId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.config.get('auth.jwt.accessSecret'),
        expiresIn: accessTtl,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.config.get('auth.jwt.refreshSecret'),
        expiresIn: refreshTtl,
      }),
    ]);

    return { accessToken, refreshToken, expiresIn: accessTtl, refreshExpiresIn: refreshTtl };
  }
}
