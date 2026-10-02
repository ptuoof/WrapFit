import { ConflictException, NotFoundException } from '@nestjs/common';
import type { ProjectDetail } from '../domain/project.types';
import type { ISnapshotRepository } from './ports/snapshot.repository.port';
import type { ProjectsService } from './projects.service';
import { MAX_SNAPSHOTS_PER_PROJECT, SnapshotsService } from './snapshots.service';

describe('SnapshotsService', () => {
  const current = {
    id: 'project-1',
    status: 'ACTIVE',
    thumbnailUrl: 'https://cdn/now.png',
    dimensions: { length: 120, width: 80, height: 60, paperThickness: 0.35 },
    canvasState: { elements: [] },
  } as unknown as ProjectDetail;
  const saved = {
    id: 'snap-1',
    name: 'Mốc 1',
    dimensions: { length: 100, width: 70, height: 50, paperThickness: 0.35 },
    canvasState: { elements: [] },
  };

  let projects: { findOne: jest.Mock };
  let repo: jest.Mocked<ISnapshotRepository>;
  let service: SnapshotsService;

  beforeEach(() => {
    projects = { findOne: jest.fn().mockResolvedValue(current) };
    repo = {
      list: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      findContent: jest.fn().mockResolvedValue(saved),
      delete: jest.fn().mockResolvedValue(true),
      restore: jest.fn(),
    };
    service = new SnapshotsService(projects as unknown as ProjectsService, repo);
  });

  it('saves the current canvas and dimensions under the given name', async () => {
    await service.create('project-1', { name: 'Mốc 2' });
    expect(repo.create).toHaveBeenCalledWith('project-1', {
      name: 'Mốc 2',
      previewUrl: null,
      canvasState: current.canvasState,
      dimensions: current.dimensions,
    });
  });

  it('caps manual snapshots per project', async () => {
    repo.count.mockResolvedValueOnce(MAX_SNAPSHOTS_PER_PROJECT);
    await expect(service.create('project-1', { name: 'one too many' })).rejects.toThrow(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('refuses to snapshot or restore a project in the trash', async () => {
    projects.findOne.mockResolvedValue({ ...current, status: 'DELETED' });
    await expect(service.create('project-1', { name: 'x' })).rejects.toThrow(ConflictException);
    await expect(service.restore('project-1', 'snap-1')).rejects.toThrow(ConflictException);
  });

  it('backs up the current state before restoring', async () => {
    await service.restore('project-1', 'snap-1');
    expect(repo.findContent).toHaveBeenCalledWith('project-1', 'snap-1');
    expect(repo.restore).toHaveBeenCalledWith('project-1', saved, {
      name: 'Trước khi khôi phục: Mốc 1',
      previewUrl: 'https://cdn/now.png',
      canvasState: current.canvasState,
      dimensions: current.dimensions,
    });
  });

  it('answers 404 for snapshots of other projects', async () => {
    repo.findContent.mockResolvedValueOnce(null);
    await expect(service.restore('project-1', 'snap-x')).rejects.toThrow(NotFoundException);
    repo.delete.mockResolvedValueOnce(false);
    await expect(service.remove('project-1', 'snap-x')).rejects.toThrow(NotFoundException);
  });
});
