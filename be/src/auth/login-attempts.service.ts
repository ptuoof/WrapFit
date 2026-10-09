import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import type { Redis } from 'ioredis';
import { REDIS } from '../shared/redis';
import { FAILED_LOGIN_WINDOW_SECONDS, MAX_FAILED_LOGINS } from './auth.constants';

/**
 * Counts failed password logins per email address in Redis (MAX_FAILED_LOGINS per FAILED_LOGIN_WINDOW_SECONDS).
 * Addresses with and without an account are counted the same way, so the limit tells nothing about who has one.
 * Keys hold a hash of the address, not the address. While Redis is down the check is skipped (logins keep working,
 * the per-IP rate limit still applies).
 */
@Injectable()
export class LoginAttemptsService {
  private readonly logger = new Logger(LoginAttemptsService.name);

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  /** 429 LOGIN_RATE_LIMITED while the address has used up its failed attempts. */
  async assertAllowed(email: string): Promise<void> {
    const key = this.key(email);
    const state = await this.safely('read', async () => {
      const [failures, ttl] = await Promise.all([this.redis.get(key), this.redis.ttl(key)]);
      return { failures: Number(failures ?? 0), ttl };
    });
    if (state && state.failures >= MAX_FAILED_LOGINS) {
      throw new HttpException(
        {
          code: 'LOGIN_RATE_LIMITED',
          message: 'Too many failed logins for this address; try again later or reset the password',
          retryAfterSeconds: state.ttl > 0 ? state.ttl : FAILED_LOGIN_WINDOW_SECONDS,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async recordFailure(email: string): Promise<void> {
    const key = this.key(email);
    // The window starts at the first failure (NX): later failures do not extend it.
    await this.safely('write', () => this.redis.multi().incr(key).expire(key, FAILED_LOGIN_WINDOW_SECONDS, 'NX').exec());
  }

  /** After a successful login or a password reset. */
  async reset(email: string): Promise<void> {
    await this.safely('reset', () => this.redis.del(this.key(email)));
  }

  private key(email: string): string {
    return `wrapfit:login-fail:${createHash('sha256').update(email.trim().toLowerCase()).digest('hex')}`;
  }

  private async safely<T>(action: string, run: () => Promise<T>): Promise<T | null> {
    try {
      return await run();
    } catch (error) {
      this.logger.warn(`auth.login_attempts.${action}_skipped: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
}
