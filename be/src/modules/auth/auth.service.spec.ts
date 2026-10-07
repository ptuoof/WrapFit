import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, SubscriptionTier } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const env: Record<string, unknown> = {
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  JWT_ACCESS_TTL_SECONDS: 900,
  JWT_REFRESH_TTL_SECONDS: 604800,
  BCRYPT_ROUNDS: 4,
};

describe('AuthService', () => {
  let service: AuthService;
  let jwt: JwtService;
  const users = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findByGoogleId: jest.fn(),
    linkGoogleAccount: jest.fn(),
    createFromGoogle: jest.fn(),
  };
  const prisma = {
    refreshToken: { create: jest.fn(), findUnique: jest.fn(), updateMany: jest.fn() },
    user: { findUnique: jest.fn() },
  };

  const safeUser = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'user@example.com',
    fullName: 'User',
    avatarUrl: null,
    shopName: null,
    subscriptionTier: SubscriptionTier.FREE,
    brandKit: null,
    referralCode: null,
    role: Role.MAKER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    prisma.refreshToken.create.mockResolvedValue({});

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        { provide: UsersService, useValue: users },
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: (key: string) => env[key] } },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    jwt = moduleRef.get(JwtService);
  });

  describe('register', () => {
    it('rejects an email that is already registered', async () => {
      users.findByEmail.mockResolvedValue({ ...safeUser, passwordHash: 'hash' });
      await expect(
        service.register({ email: safeUser.email, password: 'Passw0rd123' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(users.create).not.toHaveBeenCalled();
    });

    it('hashes the password and returns a token pair', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockResolvedValue(safeUser);

      const result = await service.register({ email: safeUser.email, password: 'Passw0rd123' });

      const { passwordHash } = users.create.mock.calls[0][0];
      expect(passwordHash).not.toBe('Passw0rd123');
      expect(await bcrypt.compare('Passw0rd123', passwordHash)).toBe(true);
      expect(result.user).toEqual(safeUser);
      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      users.findByEmail.mockResolvedValue(null);
      await expect(service.login({ email: 'x@example.com', password: 'whatever1' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a wrong password', async () => {
      users.findByEmail.mockResolvedValue({ ...safeUser, passwordHash: await bcrypt.hash('right-pass1', 4) });
      await expect(service.login({ email: safeUser.email, password: 'wrong-pass1' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a deactivated user', async () => {
      users.findByEmail.mockResolvedValue({
        ...safeUser,
        isActive: false,
        passwordHash: await bcrypt.hash('right-pass1', 4),
      });
      await expect(service.login({ email: safeUser.email, password: 'right-pass1' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects password login for a Google-only account', async () => {
      users.findByEmail.mockResolvedValue({ ...safeUser, passwordHash: null, googleId: 'google-sub' });
      await expect(service.login({ email: safeUser.email, password: 'whatever1' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('returns the user without secret fields and a token pair', async () => {
      users.findByEmail.mockResolvedValue({
        ...safeUser,
        passwordHash: await bcrypt.hash('right-pass1', 4),
        googleId: 'google-sub',
        referredById: null,
      });

      const result = await service.login({ email: safeUser.email, password: 'right-pass1' });

      expect(result.user).toEqual(safeUser);
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('googleId');
      expect(result.expiresIn).toBe(900);
      expect(result.refreshExpiresIn).toBe(604800);
    });
  });

  describe('loginWithGoogle', () => {
    const profile = {
      googleId: 'google-sub-1',
      email: safeUser.email,
      emailVerified: true,
      fullName: 'Google Name',
      avatarUrl: 'https://lh3.googleusercontent.com/a/photo',
    };
    const row = (overrides = {}) => ({
      ...safeUser,
      passwordHash: null,
      googleId: null,
      referredById: null,
      ...overrides,
    });

    it('rejects a Google account whose email is not verified', async () => {
      await expect(service.loginWithGoogle({ ...profile, emailVerified: false })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(users.findByGoogleId).not.toHaveBeenCalled();
    });

    it('signs in a user already linked to the Google account', async () => {
      users.findByGoogleId.mockResolvedValue(row({ googleId: profile.googleId }));

      const result = await service.loginWithGoogle(profile, { userAgent: 'jest', ipAddress: '127.0.0.1' });

      expect(result.user).toEqual(safeUser);
      expect(users.createFromGoogle).not.toHaveBeenCalled();
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: safeUser.id, userAgent: 'jest', ipAddress: '127.0.0.1' }),
      });
    });

    it('links the Google account to an existing account with the same email', async () => {
      users.findByGoogleId.mockResolvedValue(null);
      const existing = row({ passwordHash: 'hash' });
      users.findByEmail.mockResolvedValue(existing);
      users.linkGoogleAccount.mockResolvedValue({ ...existing, googleId: profile.googleId });

      const result = await service.loginWithGoogle(profile);

      expect(users.linkGoogleAccount).toHaveBeenCalledWith(existing, profile);
      expect(result.user).not.toHaveProperty('googleId');
    });

    it('refuses to link an email that already belongs to another Google account', async () => {
      users.findByGoogleId.mockResolvedValue(null);
      users.findByEmail.mockResolvedValue(row({ googleId: 'another-google-sub' }));

      await expect(service.loginWithGoogle(profile)).rejects.toBeInstanceOf(ConflictException);
      expect(users.linkGoogleAccount).not.toHaveBeenCalled();
    });

    it('creates a password-less account for a new Google user', async () => {
      users.findByGoogleId.mockResolvedValue(null);
      users.findByEmail.mockResolvedValue(null);
      users.createFromGoogle.mockResolvedValue(row({ googleId: profile.googleId, fullName: profile.fullName }));

      const result = await service.loginWithGoogle(profile);

      expect(users.createFromGoogle).toHaveBeenCalledWith(profile);
      expect(result.user.fullName).toBe(profile.fullName);
    });

    it('rejects a deactivated account', async () => {
      users.findByGoogleId.mockResolvedValue(row({ googleId: profile.googleId, isActive: false }));
      await expect(service.loginWithGoogle(profile)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const sign = (jti: string) =>
      jwt.signAsync({ sub: safeUser.id, jti }, { secret: env.JWT_REFRESH_SECRET as string, expiresIn: 60 });

    it('rejects a token that is not a valid JWT for the refresh secret', async () => {
      await expect(service.refresh('not-a-token')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    const record = (jti: string, revokedAt: Date | null = null) => ({
      id: jti,
      userId: safeUser.id,
      revokedAt,
      expiresAt: new Date(Date.now() + 60_000),
    });
    const revokeAll = {
      where: { userId: safeUser.id, revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    };

    it('rotates a valid token and links it to its replacement', async () => {
      const jti = '33333333-3333-4333-8333-333333333333';
      prisma.refreshToken.findUnique.mockResolvedValue(record(jti));
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      prisma.user.findUnique.mockResolvedValue(safeUser);

      const result = await service.refresh(await sign(jti));

      expect(result.user).toEqual(safeUser);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { id: jti, revokedAt: null },
        data: { revokedAt: expect.any(Date), replacedById: expect.any(String) },
      });
      // The new refresh token is the replacement recorded on the old one.
      const { replacedById } = prisma.refreshToken.updateMany.mock.calls[0][0].data;
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({ data: expect.objectContaining({ id: replacedById }) });
    });

    it('gives a second tab that refreshed at the same moment its own session instead of a logout', async () => {
      const jti = '44444444-4444-4444-8444-444444444444';
      prisma.refreshToken.findUnique
        .mockResolvedValueOnce(record(jti))
        .mockResolvedValueOnce({ revokedAt: new Date(Date.now() - 2_000), replacedById: 'replacement-id' });
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 0 }); // the other tab won the claim
      prisma.user.findUnique.mockResolvedValue(safeUser);

      const result = await service.refresh(await sign(jti));

      expect(result.user).toEqual(safeUser);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledTimes(1); // no revoke-all
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
    });

    it('revokes every session when a token rotated long ago is replayed (possibly stolen)', async () => {
      const jti = '22222222-2222-4222-8222-222222222222';
      const rotatedAt = new Date(Date.now() - 5 * 60_000);
      prisma.refreshToken.findUnique
        .mockResolvedValueOnce(record(jti, rotatedAt))
        .mockResolvedValueOnce({ revokedAt: rotatedAt, replacedById: 'replacement-id' });
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.refresh(await sign(jti))).rejects.toThrow('Refresh token reuse detected');
      expect(prisma.refreshToken.updateMany).toHaveBeenLastCalledWith(revokeAll);
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('revokes every session when a logged-out token is replayed, even right away', async () => {
      const jti = '55555555-5555-4555-8555-555555555555';
      const loggedOutAt = new Date();
      prisma.refreshToken.findUnique
        .mockResolvedValueOnce(record(jti, loggedOutAt))
        .mockResolvedValueOnce({ revokedAt: loggedOutAt, replacedById: null });
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.refresh(await sign(jti))).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.refreshToken.updateMany).toHaveBeenLastCalledWith(revokeAll);
    });
  });
});
