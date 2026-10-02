import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ExportFileType, Prisma } from '@prisma/client';
import { type BoxDimensions, type CanvasElement, runFitCheck } from '@wrapfit/shared';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  DOWNLOAD_URL_TTL_SECONDS,
  EXPORT_JOB_OPTIONS,
  EXPORT_QUEUE,
  ExportJobData,
  FILE_FORMATS,
  RENDER_JOB,
} from './export.constants';
import { dielinePieces } from './rendering/print-layout';

const jobSelect = {
  id: true,
  projectId: true,
  fileType: true,
  status: true,
  errorLog: true,
  storageKey: true,
  createdAt: true,
  completedAt: true,
  project: { select: { userId: true, title: true } },
} satisfies Prisma.ExportJobSelect;

type JobRow = Prisma.ExportJobGetPayload<{ select: typeof jobSelect }>;

/** Turns a project title into a safe file name: "Hộp nến Tết" -> "hop-nen-tet". */
export function fileNameFor(title: string, fileType: ExportFileType): string {
  const base =
    title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'wrapfit';
  return `${base}-${fileType.toLowerCase().replace('_', '-')}.${FILE_FORMATS[fileType].extension}`;
}

/**
 * API side of the print export (docs 07, section 3.1): checks the design, records an ExportJob and queues it.
 * The heavy rendering runs in the separate worker process (ExportProcessor), never in an HTTP request.
 */
@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    @InjectQueue(EXPORT_QUEUE) private readonly queue: Queue<ExportJobData>,
  ) {}

  async request(projectId: string, fileType: ExportFileType) {
    if (!this.storage.enabled) throw new ServiceUnavailableException('File storage is not configured');

    const project = await this.prisma.packagingProject.findUniqueOrThrow({
      where: { id: projectId },
      select: { status: true, templateId: true, dimensions: true, canvasState: true },
    });
    if (project.status === 'DELETED') {
      throw new ConflictException('Restore the project from the trash before exporting it');
    }

    // FitCheck again on the server: the client's result is never trusted for production files.
    const elements = (project.canvasState as { elements?: CanvasElement[] }).elements ?? [];
    const pieces = dielinePieces(project.templateId, project.dimensions as unknown as BoxDimensions);
    const reports = pieces.map((piece) => runFitCheck(elements, piece.geometry));
    const fitCheck = {
      isValidForProduction: reports.every((r) => r.isValidForProduction),
      score: Math.min(...reports.map((r) => r.score)),
      violations: reports.flatMap((r) => r.violations),
      auditedAt: new Date().toISOString(),
    };
    await this.prisma.packagingProject.update({
      where: { id: projectId },
      data: { fitcheckState: fitCheck as unknown as Prisma.InputJsonObject },
    });
    if (!fitCheck.isValidForProduction) {
      throw new UnprocessableEntityException({
        message: 'FitCheck found errors that would ruin the print; fix them before exporting',
        fitCheck,
      });
    }

    const job = await this.prisma.exportJob.create({ data: { projectId, fileType }, select: jobSelect });
    try {
      await this.queue.add(RENDER_JOB, { exportJobId: job.id }, { ...EXPORT_JOB_OPTIONS, jobId: job.id });
    } catch (error) {
      this.logger.error('Could not queue the export', error instanceof Error ? error.stack : String(error));
      await this.prisma.exportJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', errorLog: 'The export queue is unavailable' },
      });
      throw new ServiceUnavailableException('The export queue is unavailable, try again in a moment');
    }
    return { jobId: job.id, status: job.status, fitCheck };
  }

  /** Job status; a COMPLETED job includes a download link valid for 15 minutes. */
  async status(jobId: string, userId: string) {
    const job = await this.prisma.exportJob.findUnique({ where: { id: jobId }, select: jobSelect });
    // 404 for jobs of other users' projects, like ProjectOwnerGuard.
    if (job?.project.userId !== userId) throw new NotFoundException('Export not found');
    return this.view(job);
  }

  async list(projectId: string) {
    const jobs = await this.prisma.exportJob.findMany({
      where: { projectId },
      select: jobSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      take: 20,
    });
    return Promise.all(jobs.map((job) => this.view(job)));
  }

  private async view(job: JobRow) {
    const fileName = fileNameFor(job.project.title, job.fileType);
    const ready = job.status === 'COMPLETED' && job.storageKey !== null;
    return {
      id: job.id,
      projectId: job.projectId,
      fileType: job.fileType,
      status: job.status,
      error: job.status === 'FAILED' ? job.errorLog : null,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      fileName: ready ? fileName : null,
      downloadUrl: ready ? await this.storage.presignDownload(job.storageKey!, fileName, DOWNLOAD_URL_TTL_SECONDS) : null,
      downloadExpiresIn: ready ? DOWNLOAD_URL_TTL_SECONDS : null,
    };
  }
}
