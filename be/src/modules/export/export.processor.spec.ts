import type { ConfigService } from '@nestjs/config';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { Job } from 'bullmq';
import type { PrismaService } from '../../prisma/prisma.service';
import type { StorageService } from '../storage/storage.service';
import type { ExportJobData } from './export.constants';
import { EXPORT_COMPLETED, ExportProcessor } from './export.processor';

describe('ExportProcessor', () => {
  const project = {
    id: 'p-1',
    userId: 'u-1',
    title: 'Hộp nến',
    templateId: 'tuck-top',
    dimensions: { length: 120, width: 80, height: 60, paperThickness: 0.4 },
    canvasState: { elements: [] },
  };
  let prisma: { exportJob: { update: jest.Mock }; projectSnapshot: { create: jest.Mock }; $transaction: jest.Mock };
  let storage: { putGeneratedFile: jest.Mock };
  let events: { emit: jest.Mock };
  let processor: ExportProcessor;
  const job = (attemptsMade: number) =>
    ({ data: { exportJobId: 'job-1' }, attemptsMade, opts: { attempts: 3 } }) as unknown as Job<ExportJobData>;

  beforeEach(() => {
    prisma = {
      exportJob: { update: jest.fn().mockResolvedValue({ fileType: 'DXF', project }) },
      projectSnapshot: { create: jest.fn() },
      $transaction: jest.fn(),
    };
    storage = { putGeneratedFile: jest.fn().mockResolvedValue('https://cdn/x.dxf') };
    events = { emit: jest.fn() };
    processor = new ExportProcessor(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
      events as unknown as EventEmitter2,
      { get: () => 2 } as unknown as ConfigService,
    );
    jest.spyOn(processor['logger'], 'warn').mockImplementation(() => undefined);
    jest.spyOn(processor['logger'], 'log').mockImplementation(() => undefined);
  });

  it('renders, stores the file, completes the job with a snapshot and emits an event', async () => {
    await expect(processor.process(job(0))).resolves.toEqual({ storageKey: 'projects/p-1/exports/job-1.dxf' });

    expect(prisma.exportJob.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'PROCESSING', errorLog: null } }));
    expect(storage.putGeneratedFile).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'projects/p-1/exports/job-1.dxf', purpose: 'EXPORT', contentType: 'application/dxf', projectId: 'p-1' }),
    );
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.exportJob.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED', storageKey: 'projects/p-1/exports/job-1.dxf' }) }),
    );
    expect(prisma.projectSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ projectId: 'p-1', name: expect.stringMatching(/^Bản xuất in DXF /) }) }),
    );
    expect(events.emit).toHaveBeenCalledWith(EXPORT_COMPLETED, { exportJobId: 'job-1', projectId: 'p-1', userId: 'u-1' });
  });

  it('lets BullMQ retry, and marks the job FAILED only after the last attempt', async () => {
    storage.putGeneratedFile.mockRejectedValue(new Error('bucket unreachable'));

    await expect(processor.process(job(0))).rejects.toThrow('bucket unreachable');
    await expect(processor.process(job(1))).rejects.toThrow('bucket unreachable');
    expect(prisma.exportJob.update).not.toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED' }) }));

    await expect(processor.process(job(2))).rejects.toThrow('bucket unreachable');
    expect(prisma.exportJob.update).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { status: 'FAILED', errorLog: 'bucket unreachable' },
    });
  });
});
