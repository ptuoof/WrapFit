import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Queue } from 'bullmq';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { EXPORT_QUEUE, WORKER_HEARTBEAT_KEY } from '../../export/export.constants';

type Check = 'up' | 'down';

/** A health check must answer quickly even when a dependency hangs. */
const CHECK_TIMEOUT_MS = 2000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), CHECK_TIMEOUT_MS).unref()),
  ]);
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(EXPORT_QUEUE) private readonly exportQueue: Queue,
  ) {}

  /**
   * 503 only when the database is down (the API cannot serve anything). Redis down = `degraded`: everything works
   * except print exports. The worker and the export queue are reported for monitoring, the worker being a separate
   * process with its own health check.
   */
  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({
    summary: 'Liveness/readiness probe: database, Redis, export worker and export queue',
  })
  async check() {
    // Reading the worker heartbeat doubles as the Redis probe.
    let heartbeat: string | null = null;
    const [database, redis] = await Promise.all([
      this.probe(() => this.prisma.$queryRaw`SELECT 1`),
      this.probe(async () => {
        heartbeat = await (await this.exportQueue.getBackend().client).get(WORKER_HEARTBEAT_KEY);
      }),
    ]);
    if (database === 'down') {
      throw new ServiceUnavailableException({
        status: 'error',
        database,
        redis,
      });
    }

    let exportQueue: Record<string, number> | null = null;
    if (redis === 'up') {
      exportQueue = await withTimeout(this.exportQueue.getJobCounts('waiting', 'active', 'delayed', 'failed')).catch(
        () => null, // Redis answered the first read but not this one: report the counts as unknown.
      );
    }

    return {
      status: redis === 'up' ? 'ok' : 'degraded',
      database,
      redis,
      worker: redis === 'up' ? (heartbeat ? 'up' : 'down') : 'unknown',
      exportQueue,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  private async probe(check: () => Promise<unknown>): Promise<Check> {
    try {
      await withTimeout(check());
      return 'up';
    } catch {
      return 'down';
    }
  }
}
