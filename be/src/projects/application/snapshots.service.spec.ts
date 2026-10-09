import { ConflictException, NotFoundException } from '@nestjs/common';
import { configureAssetBase } from '../../storage';
import type { ProjectDetail } from '../domain/project.types';
import type { IProjectFiles } from './ports/project-files.port';
import type { ISnapshotRepository } from './ports/snapshot.repository.port';
import type { ProjectsService } from './projects.service';
import { MAX_SNAPSHOTS_PER_PROJECT, SnapshotsService } from './snapshots.service';

describe('SnapshotsService', () => {
  const thumbnailKey = 'users/0192a4c0-0000-7000-8000-000000000001/thumbnail/now.png';
  beforeAll(() => configureAssetBase('https://cdn'));
  afterAll(() => configureAssetBase(''));

  const current = {
    id: 'project-1',
    status: 'ACTIVE',
    thumbnailUrl: `https://cdn/${thumbnailKey}`,
    template: { id: 'tuck-top', name: 'Tuck top' },
    formulaVersion: 1,
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
  let files: { resolveUpload: jest.Mock };
  let service: SnapshotsService;

  beforeEach(() => {
    projects = { findOne: jest.fn().mockResolvedValue(current) };
    repo = {
      list: jest.fn(),
      countManual: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      findContent: jest.fn().mockResolvedValue(saved),
      delete: jest.fn().mockResolvedValue(true),
      restore: jest.fn(),
    };
    files = { resolveUpload: jest.fn().mockResolvedValue('users/u-1/thumbnail/p.png') };
    service = new SnapshotsService(projects as unknown as ProjectsService, repo, files as unknown as IProjectFiles);
  });

  it('saves the current canvas and dimensions under the given name', async () => {
    await service.create('project-1', 'user-1', { name: 'Mốc 2' });
    expect(repo.create).toHaveBeenCalledWith('project-1', {
      name: 'Mốc 2',
      previewKey: null,
      canvasState: current.canvasState,
      dimensions: current.dimensions,
    });
  });

  it('stores the key of an uploaded preview, checked to be an upload of the caller', async () => {
    await service.create('project-1', 'user-1', { name: 'Mốc 3', previewUrl: 'https://cdn/users/u-1/thumbnail/p.png' });
    expect(files.resolveUpload).toHaveBeenCalledWith('https://cdn/users/u-1/thumbnail/p.png', 'user-1', ['THUMBNAIL', 'IMAGE']);
    expect(repo.create).toHaveBeenCalledWith('project-1', expect.objectContaining({ previewKey: 'users/u-1/thumbnail/p.png' }));
  });

  it('caps manual snapshots per project', async () => {
    repo.countManual.mockResolvedValueOnce(MAX_SNAPSHOTS_PER_PROJECT);
    await expect(service.create('project-1', 'user-1', { name: 'one too many' })).rejects.toThrow(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('refuses to snapshot or restore a project in the trash', async () => {
    projects.findOne.mockResolvedValue({ ...current, status: 'DELETED' });
    await expect(service.create('project-1', 'user-1', { name: 'x' })).rejects.toThrow(ConflictException);
    await expect(service.restore('project-1', 'snap-1')).rejects.toThrow(ConflictException);
  });

  it('backs up the current state before restoring, and re-runs FitCheck on the restored design', async () => {
    await service.restore('project-1', 'snap-1');
    expect(repo.findContent).toHaveBeenCalledWith('project-1', 'snap-1');
    expect(repo.restore).toHaveBeenCalledWith(
      'project-1',
      saved,
      {
        name: 'Trước khi khôi phục: Mốc 1',
        previewKey: thumbnailKey,
        canvasState: current.canvasState,
        dimensions: current.dimensions,
      },
      expect.objectContaining({ isValidForProduction: true, score: 100 }),
    );
  });

  it('answers 404 for snapshots of other projects', async () => {
    repo.findContent.mockResolvedValueOnce(null);
    await expect(service.restore('project-1', 'snap-x')).rejects.toThrow(NotFoundException);
    repo.delete.mockResolvedValueOnce(false);
    await expect(service.remove('project-1', 'snap-x')).rejects.toThrow(NotFoundException);
  });
});
