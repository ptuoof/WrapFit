import type { JobsOptions } from 'bullmq';

export const EXPORT_QUEUE = 'export';
export const RENDER_JOB = 'render';

/** Data of a BullMQ job; the job id is the ExportJob id. */
export interface ExportJobData {
  exportJobId: string;
}

/** 3 attempts with exponential backoff (2 s, 4 s); finished jobs are trimmed from Redis, the DB keeps the history. */
export const EXPORT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { age: 24 * 3600, count: 1000 },
  removeOnFail: { age: 7 * 24 * 3600 },
};

/** Lifetime of a download link (docs 07: 15 minutes). */
export const DOWNLOAD_URL_TTL_SECONDS = 15 * 60;

export const FILE_FORMATS = {
  PDF_CMYK: { extension: 'pdf', contentType: 'application/pdf' },
  SVG: { extension: 'svg', contentType: 'image/svg+xml' },
  DXF: { extension: 'dxf', contentType: 'application/dxf' },
} as const;
