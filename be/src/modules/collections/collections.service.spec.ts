import { ConflictException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { CollectionsService, MAX_COLLECTIONS_PER_USER } from './collections.service';

describe('CollectionsService', () => {
  const row = {
    id: 'c-1',
    title: 'Tết',
    description: null,
    colorTag: '#D4A373',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { projects: 3 },
  };
  let collection: Record<string, jest.Mock>;
  let service: CollectionsService;

  beforeEach(() => {
    collection = {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockResolvedValue(row),
      findFirst: jest.fn().mockResolvedValue(row),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    };
    service = new CollectionsService({ projectCollection: collection } as unknown as PrismaService);
  });

  it('exposes the project count as `projectCount`', async () => {
    const view = await service.findOne('c-1', 'user-1');
    expect(view).toMatchObject({ id: 'c-1', projectCount: 3 });
    expect(view).not.toHaveProperty('_count');
    expect(collection.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'c-1', userId: 'user-1' } }));
  });

  it('limits the number of collections per user', async () => {
    collection.count.mockResolvedValueOnce(MAX_COLLECTIONS_PER_USER);
    await expect(service.create('user-1', { title: 'one too many' })).rejects.toThrow(ConflictException);
    expect(collection.create).not.toHaveBeenCalled();
  });

  it('stores an empty description as null', async () => {
    await service.create('user-1', { title: 'x', description: '' });
    expect(collection.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'user-1', title: 'x', description: null, colorTag: undefined } }),
    );
  });

  it('answers 404 for collections of other users', async () => {
    collection.count.mockResolvedValueOnce(0);
    await expect(service.update('c-1', 'user-2', { title: 'x' })).rejects.toThrow(NotFoundException);
    expect(collection.update).not.toHaveBeenCalled();

    collection.deleteMany.mockResolvedValueOnce({ count: 0 });
    await expect(service.remove('c-1', 'user-2')).rejects.toThrow(NotFoundException);
  });
});
