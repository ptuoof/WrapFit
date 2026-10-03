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
import { buildPrintLayout, PrintLayout } from './rendering/print-layout';
import { Artwork, canEmbedInPdf, renderDxf, renderPdf, renderSvg } from './rendering/print-renderers';

export const EXPORT_COMPLETED = 'export.completed';

/** Images embedded in one print file, in total (300 elements x 15 MB would exhaust the worker's memory). */
export const MAX_ARTWORK_BYTES = 100 * 1024 * 1024;

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
    // DXF holds the cutting lines only: no artwork to load.
    const artwork = job.fileType === 'DXF' ? new Map() : await this.loadArtwork(layout, job.fileType === 'PDF_CMYK');
    const body =
      job.fileType === 'PDF_CMYK'
        ? await renderPdf(layout, artwork)
        : Buffer.from(job.fileType === 'SVG' ? renderSvg(layout, artwork) : renderDxf(layout));

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
          isAutomatic: true,
        },
      }),
    ]);
    this.events.emit(EXPORT_COMPLETED, { exportJobId, projectId: project.id, userId: project.userId });
    this.logger.log(`Export ${exportJobId} (${job.fileType}, ${body.length} bytes) completed`);
    return { storageKey };
  }

  /**
   * Downloads the images of the layout from storage. Only files uploaded to our bucket are used (never an arbitrary
   * URL: no requests to other hosts from the worker). A missing file fails the export rather than print without it.
   */
  private async loadArtwork(layout: PrintLayout, forPdf: boolean): Promise<Artwork> {
    const artwork: Artwork = new Map();
    let total = 0;
    for (const { url } of layout.images) {
      if (artwork.has(url)) continue;
      const key = this.storage.uploadedKeyOf(url);
      if (!key) {
        this.logger.warn(`Export leaves out an image that is not an upload of this platform: ${url}`);
        continue;
      }
      const file = await this.storage.getObject(key).catch((error: Error) => {
        throw new Error(`Could not read the image ${url}: ${error.message}`);
      });
      total += file.body.length;
      if (total > MAX_ARTWORK_BYTES) {
        throw new Error(`The images of this design exceed ${MAX_ARTWORK_BYTES / 1024 / 1024} MB; use smaller files`);
      }
      if (forPdf && !canEmbedInPdf(file.body)) {
        this.logger.warn(`The PDF leaves out ${url} (${file.contentType}): only PNG and JPEG can be embedded`);
      }
      artwork.set(url, file);
    }
    return artwork;
  }
}
