import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenPurpose } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppConfigService } from '../../config/app-config.type';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuthTokensService } from './auth-tokens.service';

/** Stable error codes of the one-time links, read by the frontend to pick its message. */
export type AuthTokenErrorCode = 'AUTH_TOKEN_INVALID' | 'AUTH_TOKEN_EXPIRED' | 'AUTH_TOKEN_CONSUMED';

const TOKEN_ERRORS: Record<AuthTokenErrorCode, string> = {
  AUTH_TOKEN_INVALID: 'This link is not valid (it may have been replaced by a newer email)',
  AUTH_TOKEN_EXPIRED: 'This link has expired; ask for a new email',
  AUTH_TOKEN_CONSUMED: 'This link was already used; ask for a new email if needed',
};

const tokenError = (code: AuthTokenErrorCode) => new BadRequestException({ code, message: TOKEN_ERRORS[code] });

/**
 * Email verification and password reset. The public "send me an email" routes answer the same way whether the
 * address has an account or not (no account enumeration); rate limits skip silently for the same reason.
 */
@Injectable()
export class AccountRecoveryService {
  private readonly logger = new Logger(AccountRecoveryService.name);
  private readonly bcryptRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: AuthTokensService,
    private readonly mail: MailService,
    config: ConfigService,
  ) {
    this.bcryptRounds = (config as unknown as AppConfigService).get('BCRYPT_ROUNDS', { infer: true });
  }

  /** Marks the email as verified. Opening the same link again succeeds as long as the account is verified. */
  async verifyEmail(rawToken: string): Promise<void> {
    const now = new Date();
    const result = await this.prisma.$transaction(async (tx) => {
      const outcome = await this.tokens.consume(tx, rawToken, 'VERIFY_EMAIL', now);
      if (outcome.status === 'ok') {
        await tx.user.updateMany({ where: { id: outcome.userId, emailVerifiedAt: null }, data: { emailVerifiedAt: now } });
      }
      return outcome;
    });

    if (result.status === 'ok') {
      this.logger.log(`auth.verify_email.ok userId=${result.userId}`);
      return;
    }
    if (result.status === 'consumed') {
      const user = await this.prisma.user.findUnique({ where: { id: result.userId }, select: { emailVerifiedAt: true } });
      if (user?.emailVerifiedAt) return; // second click on the link
      throw tokenError('AUTH_TOKEN_INVALID'); // replaced by a newer link before it was used
    }
    throw tokenError(result.status === 'expired' ? 'AUTH_TOKEN_EXPIRED' : 'AUTH_TOKEN_INVALID');
  }

  /** Sends a new verification link to an unverified account. Silent for unknown or already verified addresses. */
  async resendVerification(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, isActive: true, emailVerifiedAt: true },
    });
    if (!user || !user.isActive || user.emailVerifiedAt) return;
    await this.sendLink(user.id, 'VERIFY_EMAIL');
  }

  /**
   * Sends a password reset link. Also works for an account created with Google only: the email proves ownership, so
   * it may add a password.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email }, select: { id: true, isActive: true } });
    if (!user || !user.isActive) return;
    await this.sendLink(user.id, 'RESET_PASSWORD');
  }

  /**
   * Sets a new password and signs the account out everywhere (whoever knew the old password loses access). The link
   * came from the mailbox, so the email counts as verified too. The user then signs in with the new password.
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, this.bcryptRounds);
    const now = new Date();
    const result = await this.prisma.$transaction(async (tx) => {
      const outcome = await this.tokens.consume(tx, rawToken, 'RESET_PASSWORD', now);
      if (outcome.status !== 'ok') return { outcome, sessionsRevoked: 0 };
      await tx.user.update({ where: { id: outcome.userId }, data: { passwordHash } });
      await tx.user.updateMany({ where: { id: outcome.userId, emailVerifiedAt: null }, data: { emailVerifiedAt: now } });
      const { count } = await tx.refreshToken.updateMany({
        where: { userId: outcome.userId, revokedAt: null },
        data: { revokedAt: now },
      });
      return { outcome, sessionsRevoked: count };
    });

    const { outcome } = result;
    if (outcome.status === 'ok') {
      this.logger.log(`auth.password_reset.ok userId=${outcome.userId} sessionsRevoked=${result.sessionsRevoked}`);
      return;
    }
    throw tokenError(
      outcome.status === 'consumed'
        ? 'AUTH_TOKEN_CONSUMED'
        : outcome.status === 'expired'
          ? 'AUTH_TOKEN_EXPIRED'
          : 'AUTH_TOKEN_INVALID',
    );
  }

  private async sendLink(userId: string, purpose: AuthTokenPurpose): Promise<void> {
    if (!(await this.tokens.canSend(userId, purpose))) {
      this.logger.log(`auth.email_rate_limited purpose=${purpose} userId=${userId}`);
      return;
    }
    const tokenId = await this.prisma.$transaction((tx) => this.tokens.issue(tx, userId, purpose));
    if (tokenId) await this.mail.sendAuthEmail(tokenId);
  }
}
