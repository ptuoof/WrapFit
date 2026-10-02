import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { BoxDimensions, CanvasElement } from '@wrapfit/shared';
import { Job } from 'bullmq';
import { AppConfigService } from '../../config/app-config.type';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EXPORT_QUEUE, ExportJobData, FILE_FORMATS } from './export.constants';
import { buildPrintLayout } from './rendering/print-layout';
import { renderDxf, renderPdf, renderSvg } from './rendering/print-renderers';

export const EXPORT_COMPLETED = 'export.completed';

/**
 * Renders print files in the worker process (src/worker.ts). BullMQ retries a failed job 3 times; the ExportJob
 * row is marked FAILED only after the last attempt. Concurrency is set by EXPORT_CONCURRENCY.
 */
@Processor(EXPORT_QUEUE)
export class ExportProcessor extends WorkerHost implements OnApplicationBootstrap {
  private readonly logger = new Logger(ExportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly events: EventEmitter2,
    private readonly config: ConfigService,
  ) {
    super();
  }

  onApplicationBootstrap(): void {
    this.worker.concurrency = (this.config as unknown as AppConfigService).get('EXPORT_CONCURRENCY', { infer: true });
  }

  async process(job: Job<ExportJobData>): Promise<{ storageKey: string }> {
    const { exportJobId } = job.data;
    try {
      return await this.render(exportJobId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const lastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      this.logger.warn(`Export ${exportJobId} attempt ${job.attemptsMade + 1} failed: ${message}`);
      if (lastAttempt) {
        await this.prisma.exportJob.update({
          where: { id: exportJobId },
          data: { status: 'FAILED', errorLog: message.slice(0, 2000) },
        });
      }
      throw error; // lets BullMQ schedule the next attempt
    }
  }

  private async render(exportJobId: string): Promise<{ storageKey: string }> {
    const job = await this.prisma.exportJob.update({
      where: { id: exportJobId },
      data: { status: 'PROCESSING', errorLog: null },
      select: {
        fileType: true,
        project: {
          select: { id: true, userId: true, title: true, templateId: true, dimensions: true, canvasState: true },
        },
      },
    });
    const { project } = job;
    const dimensions = project.dimensions as unknown as BoxDimensions;
    const canvasState = project.canvasState as { elements?: CanvasElement[] };
    const layout = buildPrintLayout({
      title: project.title,
      structure: project.templateId,
      dimensions,
      elements: canvasState.elements ?? [],
    });

    const format = FILE_FORMATS[job.fileType];
    const body =
      job.fileType === 'PDF_CMYK'
        ? await renderPdf(layout)
        : Buffer.from(job.fileType === 'SVG' ? renderSvg(layout) : renderDxf(layout));

    const storageKey = `projects/${project.id}/exports/${exportJobId}.${format.extension}`;
    const stored = await this.storage.putGeneratedFile({
      userId: project.userId,
      projectId: project.id,
      key: storageKey,
      purpose: 'EXPORT',
      contentType: format.contentType,
      body,
    });
    if (!stored) throw new Error('File storage is not configured');

    const completedAt = new Date();
    await this.prisma.$transaction([
      this.prisma.exportJob.update({
        where: { id: exportJobId },
        data: { status: 'COMPLETED', storageKey, completedAt },
      }),
      // UC-07: every print export leaves a version the user can come back to.
      this.prisma.projectSnapshot.create({
        data: {
          projectId: project.id,
          name: `Bản xuất in ${job.fileType} ${completedAt.toISOString().slice(0, 16).replace('T', ' ')} UTC`,
          canvasState: project.canvasState as object,
          dimensions: project.dimensions as object,
        },
      }),
    ]);
    this.events.emit(EXPORT_COMPLETED, { exportJobId, projectId: project.id, userId: project.userId });
    this.logger.log(`Export ${exportJobId} (${job.fileType}, ${body.length} bytes) completed`);
    return { storageKey };
  }
}
