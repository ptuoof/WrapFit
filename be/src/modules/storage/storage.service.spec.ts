import { BadRequestException, ForbiddenException, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  const env = (overrides: Record<string, string> = {}) =>
    ({
      get: (key: string) =>
        ({
          STORAGE_ENDPOINT: 'http://127.0.0.1:8333',
          STORAGE_PUBLIC_ENDPOINT: 'http://cdn.local:8333',
          STORAGE_REGION: 'us-east-1',
          STORAGE_BUCKET: 'wrapfit',
          STORAGE_ACCESS_KEY_ID: 'key',
          STORAGE_SECRET_ACCESS_KEY: 'secret',
          STORAGE_PUBLIC_URL: 'https://cdn.wrapfit.vn/',
          STORAGE_FORCE_PATH_STYLE: 'true',
          ...overrides,
        })[key] ?? '',
    }) as unknown as ConfigService;

  let prisma: {
    storedFile: Record<string, jest.Mock>;
    user: Record<string, jest.Mock>;
    packagingProject: Record<string, jest.Mock>;
  };
  const build = (overrides?: Record<string, string>) => new StorageService(env(overrides), prisma as unknown as PrismaService);

  beforeEach(() => {
    prisma = {
      storedFile: {
        create: jest.fn().mockResolvedValue({ id: 'file-1' }),
        aggregate: jest.fn().mockResolvedValue({ _sum: { size: 10 * 1024 * 1024 }, _count: 3 }),
      },
      user: { findUniqueOrThrow: jest.fn().mockResolvedValue({ subscriptionTier: 'FREE' }) },
      packagingProject: { findUnique: jest.fn() },
    };
  });

  it('answers 503 while storage is not configured', async () => {
    const service = build({ STORAGE_BUCKET: '' });
    expect(service.enabled).toBe(false);
    await expect(service.presignUpload('u-1', { purpose: 'LOGO', contentType: 'image/png', size: 100 })).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('signs a PUT locked to the declared type and size, on the public endpoint', async () => {
    const result = await build().presignUpload('u-1', { purpose: 'LOGO', contentType: 'image/svg+xml', size: 2048 });

    expect(result.key).toMatch(/^users\/u-1\/logo\/[0-9a-f-]{36}\.svg$/);
    expect(result.fileUrl).toBe(`https://cdn.wrapfit.vn/${result.key}`);
    const url = new URL(result.uploadUrl);
    expect(url.origin).toBe('http://cdn.local:8333');
    expect(url.pathname).toBe(`/wrapfit/${result.key}`);
    expect(url.searchParams.get('X-Amz-SignedHeaders')).toBe('content-length;content-type;host');
    expect(url.searchParams.get('X-Amz-Expires')).toBe('300');
    expect(prisma.storedFile.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'u-1', size: 2048, purpose: 'LOGO' }) }),
    );
  });

  it('checks the format and the size of each kind of file', async () => {
    const service = build();
    await expect(service.presignUpload('u-1', { purpose: 'IMAGE', contentType: 'image/svg+xml', size: 1 })).rejects.toThrow(
      BadRequestException,
    );
    const tooBig = await service
      .presignUpload('u-1', { purpose: 'THUMBNAIL', contentType: 'image/webp', size: 3 * 1024 * 1024 })
      .catch((error) => error);
    expect(tooBig.getStatus()).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(prisma.storedFile.create).not.toHaveBeenCalled();
  });

  it('enforces the quota of the subscription tier', async () => {
    prisma.storedFile.aggregate.mockResolvedValue({ _sum: { size: 95 * 1024 * 1024 }, _count: 40 });
    await expect(
      build().presignUpload('u-1', { purpose: 'IMAGE', contentType: 'image/png', size: 6 * 1024 * 1024 }),
    ).rejects.toThrow(ForbiddenException);

    prisma.user.findUniqueOrThrow.mockResolvedValue({ subscriptionTier: 'STARTER' });
    await expect(
      build().presignUpload('u-1', { purpose: 'IMAGE', contentType: 'image/png', size: 6 * 1024 * 1024 }),
    ).resolves.toMatchObject({ fileId: 'file-1' });
  });
});
