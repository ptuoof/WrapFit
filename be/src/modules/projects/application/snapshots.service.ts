import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { fitCheckOf } from '../domain/project-fitcheck';
import { canEdit } from '../domain/project.policy';
import { MAX_TITLE_LENGTH, ProjectDetail, SnapshotSummary } from '../domain/project.types';
import { CreateSnapshotDto } from '../presentation/dto/create-snapshot.dto';
import { ISnapshotRepository, SNAPSHOT_REPOSITORY } from './ports/snapshot.repository.port';
import { ProjectsService } from './projects.service';

/** Manual save points per project. Automatic snapshots (export, restore backups) are not counted against it. */
export const MAX_SNAPSHOTS_PER_PROJECT = 50;

/** Version history of a project (UC-07). Ownership is checked before by ProjectOwnerGuard. */
@Injectable()
export class SnapshotsService {
  constructor(
    private readonly projects: ProjectsService,
    @Inject(SNAPSHOT_REPOSITORY) private readonly snapshots: ISnapshotRepository,
  ) {}

  list(projectId: string): Promise<SnapshotSummary[]> {
    return this.snapshots.list(projectId);
  }

  /** Saves the current canvas and dimensions under a name. */
  async create(projectId: string, dto: CreateSnapshotDto): Promise<SnapshotSummary> {
    const project = await this.editableProject(projectId);
    if ((await this.snapshots.countManual(projectId)) >= MAX_SNAPSHOTS_PER_PROJECT) {
      throw new ConflictException(
        `A project keeps at most ${MAX_SNAPSHOTS_PER_PROJECT} manual snapshots; delete old ones first`,
      );
    }
    return this.snapshots.create(projectId, {
      name: dto.name,
      previewUrl: dto.previewUrl ?? null,
      canvasState: project.canvasState,
      dimensions: project.dimensions,
    });
  }

  /**
   * Puts the snapshot's canvas and dimensions back into the project. The current state is saved first as a
   * new snapshot (`backup`), so a restore can always be undone.
   */
  async restore(
    projectId: string,
    snapshotId: string,
  ): Promise<{ project: ProjectDetail; backup: SnapshotSummary }> {
    const project = await this.editableProject(projectId);
    const snapshot = await this.snapshots.findContent(projectId, snapshotId);
    if (!snapshot) throw new NotFoundException('Snapshot not found');

    return this.snapshots.restore(
      projectId,
      snapshot,
      {
        name: `Trước khi khôi phục: ${snapshot.name}`.slice(0, MAX_TITLE_LENGTH),
        previewUrl: project.thumbnailUrl,
        canvasState: project.canvasState,
        dimensions: project.dimensions,
      },
      fitCheckOf(project.template.id, snapshot.dimensions, snapshot.canvasState.elements),
    );
  }

  async remove(projectId: string, snapshotId: string): Promise<void> {
    if (!(await this.snapshots.delete(projectId, snapshotId))) {
      throw new NotFoundException('Snapshot not found');
    }
  }

  private async editableProject(projectId: string): Promise<ProjectDetail> {
    const project = await this.projects.findOne(projectId);
    if (!canEdit(project.status)) {
      throw new ConflictException('Restore the project from the trash before editing it');
    }
    return project;
  }
}
