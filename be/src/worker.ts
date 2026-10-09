import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { createAppLogger } from './config/logger.config';
import { queueRootModule } from './shared/queue/queue.module';
import { validateEnv } from './config/env.validation';
import { ExportWorkerModule } from './export/export.module';
import { MailWorkerModule } from './mail/mail.module';
import { StorageModule } from './storage/storage.module';
import { PrismaModule } from './shared/prisma/prisma.module';

/**
 * Worker process (docs 07, section 1.3): runs the BullMQ processors only, no HTTP port. Same image as the API,
 * started with `node dist/worker.js` (docker compose service `worker`). Scale it independently of the API.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    StorageModule,
    queueRootModule('worker'),
    ExportWorkerModule,
    MailWorkerModule,
  ],
})
export class WorkerModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: createAppLogger(),
  });
  app.enableShutdownHooks(); // finishes the running jobs on SIGTERM
  new Logger('Worker').log('WrapFit worker started: queues "export", "mail"');
}

if (require.main === module) bootstrap();
