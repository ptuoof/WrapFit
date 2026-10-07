import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  EXPORT_QUEUE,
  WORKER_HEARTBEAT_INTERVAL_MS,
  WORKER_HEARTBEAT_KEY,
  WORKER_HEARTBEAT_TTL_SECONDS,
} from './export.constants';

/** Touched on every beat; the worker's Docker health check fails when it is older than a minute. */
export const WORKER_HEARTBEAT_FILE = join(tmpdir(), 'wrapfit-worker-heartbeat');

/**
 * Liveness of the worker process (it has no HTTP port): a timestamp in Redis for GET /api/health, and a file for the
 * Docker health check. A worker whose event loop is stuck stops beating, which is the point.
 */
@Injectable()
export class WorkerHeartbeat implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(WorkerHeartbeat.name);
  private timer?: NodeJS.Timeout;
  private beating = false;

  constructor(@InjectQueue(EXPORT_QUEUE) private readonly queue: Queue) {}

  onApplicationBootstrap(): void {
    void this.beat();
    this.timer = setInterval(() => void this.beat(), WORKER_HEARTBEAT_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    clearInterval(this.timer);
  }

  private async beat(): Promise<void> {
    // While Redis is down the worker connection queues commands: never pile beats up behind it.
    if (this.beating) return;
    this.beating = true;
    const now = new Date().toISOString();
    try {
      await writeFile(WORKER_HEARTBEAT_FILE, now);
      const redis = await this.queue.getBackend().client;
      await redis.set(WORKER_HEARTBEAT_KEY, now, {
        EX: WORKER_HEARTBEAT_TTL_SECONDS,
      });
    } catch (error) {
      this.logger.warn(`Heartbeat failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.beating = false;
    }
  }
}
