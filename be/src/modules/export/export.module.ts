import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { EXPORT_QUEUE } from './export.constants';
import { ExportController } from './export.controller';
import { ExportProcessor } from './export.processor';
import { ExportService } from './export.service';

/** API side: endpoints + queue producer. Imported by AppModule (HTTP process). */
@Module({
  imports: [ProjectsModule, BullModule.registerQueue({ name: EXPORT_QUEUE })],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}

/** Worker side: the BullMQ processor only. Imported by WorkerModule (src/worker.ts), never by the API. */
@Module({
  imports: [BullModule.registerQueue({ name: EXPORT_QUEUE })],
  providers: [ExportProcessor],
})
export class ExportWorkerModule {}
