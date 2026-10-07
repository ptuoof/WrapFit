import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

/** Rows deleted per statement, so one run never holds long locks on the auth tables. */
const CLEANUP_BATCH = 5000;

/** One-time email tokens are kept a week after they expire (support: "my link does not work"). */
const AUTH_TOKEN_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Every day at 03:00 (Vietnam time), deletes refresh tokens and email tokens nobody can use any more, so the auth
 * tables do not grow forever. Running it twice, or on several instances at once, is harmless.
 *
 * Revoked refresh tokens are kept until they expire: replaying one is how token theft is detected (AuthService.refresh).
 * Once expired, its JWT no longer verifies, so the row is useless.
 */
@Injectable()
export class AuthMaintenanceTask {
  private readonly logger = new Logger(AuthMaintenanceTask.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 3 * * *', { name: 'auth-maintenance', timeZone: 'Asia/Ho_Chi_Minh' })
  async run(): Promise<void> {
    try {
      const startedAt = Date.now();
      const { refreshTokens, authTokens } = await this.cleanup();
      if (refreshTokens || authTokens) {
        this.logger.log(
          `auth.cleanup refreshTokens=${refreshTokens} authTokens=${authTokens} ms=${Date.now() - startedAt}`,
        );
      }
    } catch (error) {
      // A failed run is retried by the next day's run; never let it crash the process.
      this.logger.error('auth.cleanup failed', error instanceof Error ? error.stack : String(error));
    }
  }

  async cleanup(now = new Date()): Promise<{ refreshTokens: number; authTokens: number }> {
    const refreshTokens = await this.deleteInBatches(
      (limit) => this.prisma.$executeRaw`
        DELETE FROM refresh_tokens WHERE id IN (
          SELECT id FROM refresh_tokens WHERE expires_at < ${now.toISOString()}::timestamptz
          LIMIT ${limit} FOR UPDATE SKIP LOCKED)`,
    );
    const cutoff = new Date(now.getTime() - AUTH_TOKEN_RETENTION_MS).toISOString();
    const authTokens = await this.deleteInBatches(
      (limit) => this.prisma.$executeRaw`
        DELETE FROM auth_tokens WHERE id IN (
          SELECT id FROM auth_tokens WHERE expires_at < ${cutoff}::timestamptz
          LIMIT ${limit} FOR UPDATE SKIP LOCKED)`,
    );
    return { refreshTokens, authTokens };
  }

  private async deleteInBatches(deleteBatch: (limit: number) => Promise<number>): Promise<number> {
    let total = 0;
    for (;;) {
      const deleted = await deleteBatch(CLEANUP_BATCH);
      total += deleted;
      if (deleted < CLEANUP_BATCH) return total;
    }
  }
}
