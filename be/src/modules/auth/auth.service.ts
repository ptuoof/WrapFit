import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { AppConfigService } from '../../config/app-config.type';
import { GoogleProfile, JwtPayload, RefreshPayload, SessionMeta } from '../../common/interfaces/auth.interfaces';
import { PrismaService } from '../../prisma/prisma.service';
import { SafeUser, toSafeUser, userSelect } from '../users/user.select';
import { UsersService } from '../users/users.service';
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

@Injectable()
export class AuthService {
  private readonly config: AppConfigService;

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    this.config = config as unknown as AppConfigService;
  }

  async register(dto: RegisterDto, meta: SessionMeta = {}): Promise<AuthResult> {
    if (await this.usersService.findByEmail(dto.email)) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.config.get('BCRYPT_ROUNDS', { infer: true }));
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
    });

    return { user, ...(await this.issueTokens(user, meta)) };
  }

  async login(dto: LoginDto, meta: SessionMeta = {}): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    // Google-only accounts have no password hash: they are compared against the dummy hash and always fail.
    const passwordValid = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !user.passwordHash || !passwordValid || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

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

  /** Rotates the refresh token: the presented one is revoked and a new pair is issued. */
  async refresh(refreshToken: string, meta: SessionMeta = {}): Promise<AuthResult> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const record = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    if (!record || record.userId !== payload.sub) throw new UnauthorizedException('Invalid refresh token');

    if (record.revokedAt) {
      // A revoked token being replayed means it may have been stolen: kill every session of this user.
      await this.revokeAllForUser(record.userId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }
    if (record.expiresAt <= new Date()) throw new UnauthorizedException('Refresh token expired');

    // Atomic claim: only one concurrent request can revoke the token and succeed.
    const claimed = await this.prisma.refreshToken.updateMany({
      where: { id: record.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (claimed.count !== 1) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.prisma.user.findUnique({ where: { id: record.userId }, select: { ...userSelect } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid refresh token');

    return { user, ...(await this.issueTokens(user, meta)) };
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
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async issueTokens(user: Pick<SafeUser, 'id' | 'email' | 'role'>, meta: SessionMeta): Promise<TokenPair> {
    const accessTtl = this.config.get('JWT_ACCESS_TTL_SECONDS', { infer: true });
    const refreshTtl = this.config.get('JWT_REFRESH_TTL_SECONDS', { infer: true });
    const refreshId = randomUUID();

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
        secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
        expiresIn: accessTtl,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
        expiresIn: refreshTtl,
      }),
    ]);

    return { accessToken, refreshToken, expiresIn: accessTtl, refreshExpiresIn: refreshTtl };
  }
}
