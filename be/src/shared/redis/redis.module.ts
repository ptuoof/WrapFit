import { Global, Inject, Logger, Module, OnModuleDestroy } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';
import { ConfigService, redisConnection } from '../../common';

/** Injection token of the shared ioredis client: `@Inject(REDIS) private readonly redis: Redis`. */
export const REDIS = Symbol('REDIS');

/**
 * Redis client of the API for small counters (failed logins, view de-duplication). Commands fail fast while Redis
 * is down instead of queueing, so callers can fall back (a request never hangs on Redis). BullMQ keeps its own
 * connections (shared/queue).
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('Redis');
        const client = new Redis({
          ...(redisConnection(config.get('redis.url')) as RedisOptions),
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
        });
        // ioredis retries every few seconds while Redis is down: log the outage once, not every attempt.
        let down = false;
        client.on('error', (error: Error) => {
          if (!down) logger.warn(`Redis unavailable: ${error.message}`);
          down = true;
        });
        client.on('ready', () => (down = false));
        return client;
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit().catch(() => this.redis.disconnect());
  }
}
