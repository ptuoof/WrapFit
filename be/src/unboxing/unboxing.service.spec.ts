import { ConflictException } from '@nestjs/common';
import type { Redis } from 'ioredis';
import type { ConfigService } from '../common';
import type { PrismaService } from '../shared/prisma';
import { configureAssetBase } from '../storage';
import type { StorageService } from '../storage';
import { QR_PNG_WIDTH, qrPng, qrSvg } from './qr-code';
import { UnboxingService } from './unboxing.service';

jest.setTimeout(30000);

describe('QR code', () => {
  it(
    'renders a print-size PNG and a vector SVG',
    async () => {
      const png = await qrPng('https://wrapfit.vn/unbox/abc');
      expect(png.subarray(1, 4).toString()).toBe('PNG');
      expect(png.readUInt32BE(16)).toBe(QR_PNG_WIDTH); // IHDR width
      expect(await qrSvg('https://wrapfit.vn/unbox/abc')).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    },
    30000,
  );
});

describe('UnboxingService', () => {
  beforeAll(() => configureAssetBase('https://cdn.wrapfit.vn'));
  afterAll(() => configureAssetBase(''));

  const row = {
    projectId: 'p-1',
    slug: 'AbCdEfGhIjKl',
    recipientName: 'Mẹ',
    giftNote: 'Chúc mẹ',
    audioTrackUrl: null,
    particleEffect: 'confetti',
    viewsCount: 0,
    createdAt: new Date(),
  };
  let prisma: {
    packagingProject: { findUniqueOrThrow: jest.Mock };
    unboxingExperience: Record<string, jest.Mock>;
  };
  let storage: { enabled: boolean; putGeneratedFile: jest.Mock };
  const config = { get: () => 'https://wrapfit.vn/' } as unknown as ConfigService;
  const redis = { set: jest.fn().mockResolvedValue('OK') } as unknown as Redis;
  const service = () =>
    new UnboxingService(prisma as unknown as PrismaService, storage as unknown as StorageService, config, redis);

  beforeEach(() => {
    prisma = {
      packagingProject: { findUniqueOrThrow: jest.fn().mockResolvedValue({ status: 'ACTIVE' }) },
      unboxingExperience: {
        count: jest.fn().mockResolvedValue(0),
        upsert: jest.fn().mockResolvedValue({ ...row }),
        update: jest.fn(),
      },
    };
    storage = {
      enabled: true,
      putGeneratedFile: jest.fn().mockResolvedValue(true),
    };
  });

  it(
    'points the QR code at the frontend page and stores PNG + SVG with the project',
    async () => {
      const { created, experience } = await service().save('p-1', 'u-1', { recipientName: 'Mẹ', giftNote: 'Chúc mẹ' });

      expect(created).toBe(true);
      expect(experience.unboxUrl).toBe('https://wrapfit.vn/unbox/AbCdEfGhIjKl');
      expect(experience.qrCodeUrl).toBe('https://cdn.wrapfit.vn/projects/p-1/unboxing/qr-AbCdEfGhIjKl.png');
      expect(experience.qrCodeSvgUrl).toBe('https://cdn.wrapfit.vn/projects/p-1/unboxing/qr-AbCdEfGhIjKl.svg');
      expect(storage.putGeneratedFile).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u-1', projectId: 'p-1', purpose: 'QR_CODE', contentType: 'image/svg+xml' }),
      );
      expect(prisma.unboxingExperience.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: expect.objectContaining({ particleEffect: 'confetti', audioTrackUrl: null }) }),
      );
    },
    30000,
  );

  it('still works without object storage (QR available through the download endpoint)', async () => {
    storage.enabled = false;
    const { experience } = await service().save('p-1', 'u-1', { recipientName: 'Mẹ', giftNote: 'Chúc mẹ' });
    expect(experience).toMatchObject({ qrCodeUrl: null, qrCodeSvgUrl: null });
    expect(storage.putGeneratedFile).not.toHaveBeenCalled();
  });

  it('refuses projects in the trash', async () => {
    prisma.packagingProject.findUniqueOrThrow.mockResolvedValueOnce({ status: 'DELETED' });
    await expect(service().save('p-1', 'u-1', { recipientName: 'Mẹ', giftNote: 'x' })).rejects.toThrow(
      ConflictException,
    );
  });
});
