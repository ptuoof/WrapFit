import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenPurpose, Prisma } from '@prisma/client';
import { uuidv7 } from '../../common/utils/uuidv7';
import { AppConfigService } from '../../config/app-config.type';
import { PrismaService } from '../../prisma/prisma.service';
import { authTokenSecret, hashAuthToken, rawAuthToken } from './auth-token.crypto';
import {
  AUTH_EMAIL_MIN_INTERVAL_MS,
  AUTH_EMAILS_PER_DAY,
  RESET_PASSWORD_TTL_MS,
  VERIFY_EMAIL_TTL_MS,
} from './auth.constants';

const TTL_MS: Record<AuthTokenPurpose, number> = {
  VERIFY_EMAIL: VERIFY_EMAIL_TTL_MS,
  RESET_PASSWORD: RESET_PASSWORD_TTL_MS,
  COMPLETE_SIGNUP: RESET_PASSWORD_TTL_MS, // also sets the password
};

/** Outcome of presenting a token. `consumed` also covers a token replaced by a newer one. */
export type ConsumeResult =
  | { status: 'ok'; userId: string }
  | { status: 'consumed'; userId: string }
  | { status: 'expired' }
  | { status: 'invalid' };

type Tx = Prisma.TransactionClient;

/** One-time email tokens (auth_tokens): issue, rate limits, consume. */
@Injectable()
export class AuthTokensService {
  private readonly secret: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.secret = authTokenSecret(config as unknown as AppConfigService);
  }

  /**
   * Issues a token inside the caller's transaction and returns its id (what the mail job needs). The previous usable
   * token of the same purpose is consumed first, so only the newest link works. Returns null when a concurrent
   * request issued one at the same moment (unique index on the usable token).
   */
  async issue(tx: Tx, userId: string, purpose: AuthTokenPurpose, now = new Date()): Promise<string | null> {
    await tx.authToken.updateMany({ where: { userId, purpose, consumedAt: null }, data: { consumedAt: now } });
    // The token is derived from the row id, so the id is chosen here. ON CONFLICT instead of catching a unique
    // violation: an error would abort the caller's transaction.
    const id = uuidv7(now.getTime());
    const inserted = await tx.$executeRaw`
      INSERT INTO auth_tokens (id, user_id, purpose, token_hash, expires_at, created_at)
      VALUES (${id}::uuid, ${userId}::uuid, ${purpose}::"AuthTokenPurpose", ${hashAuthToken(rawAuthToken(this.secret, id))},
              ${new Date(now.getTime() + TTL_MS[purpose]).toISOString()}::timestamptz, ${now.toISOString()}::timestamptz)
      ON CONFLICT DO NOTHING`;
    return inserted ? id : null;
  }

  /**
   * Whether another email of this kind may be sent now: one per minute and AUTH_EMAILS_PER_DAY per day and user.
   * Counted on the issued tokens, so it holds across API instances.
   */
  async canSend(userId: string, purpose: AuthTokenPurpose, now = new Date()): Promise<boolean> {
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recent = await this.prisma.authToken.findMany({
      where: { userId, purpose, createdAt: { gt: dayAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: AUTH_EMAILS_PER_DAY,
    });
    if (recent.length >= AUTH_EMAILS_PER_DAY) return false;
    return !recent.length || now.getTime() - recent[0].createdAt.getTime() >= AUTH_EMAIL_MIN_INTERVAL_MS;
  }

  /**
   * Uses a token inside the caller's transaction. The claim is a single conditional UPDATE, so two requests with the
   * same link cannot both succeed.
   */
  async consume(
    tx: Tx,
    rawToken: string,
    purposes: AuthTokenPurpose[],
    now = new Date(),
  ): Promise<ConsumeResult> {
    const row = await tx.authToken.findUnique({
      where: { tokenHash: hashAuthToken(rawToken) },
      select: { id: true, userId: true, purpose: true, expiresAt: true, consumedAt: true },
    });
    if (!row || !purposes.includes(row.purpose)) return { status: 'invalid' };
    if (row.consumedAt) return { status: 'consumed', userId: row.userId };
    if (row.expiresAt <= now) return { status: 'expired' };

    const { count } = await tx.authToken.updateMany({
      where: { id: row.id, consumedAt: null },
      data: { consumedAt: now },
    });
    return count ? { status: 'ok', userId: row.userId } : { status: 'consumed', userId: row.userId };
  }

  /** Makes the usable links of these purposes stop working (a newer kind of link replaces them). */
  async revoke(tx: Tx, userId: string, purposes: AuthTokenPurpose[], now = new Date()): Promise<void> {
    await tx.authToken.updateMany({ where: { userId, purpose: { in: purposes }, consumedAt: null }, data: { consumedAt: now } });
  }
}
