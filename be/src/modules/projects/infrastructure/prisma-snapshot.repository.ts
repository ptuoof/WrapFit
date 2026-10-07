import { Injectable } from '@nestjs/common';
import type { FitCheckReport } from '@wrapfit/shared';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  ISnapshotRepository,
  NewSnapshot,
  SnapshotContent,
} from '../application/ports/snapshot.repository.port';
import type { ProjectDetail, SnapshotSummary } from '../domain/project.types';
import { detailSelect, json, nullableJson, snapshotSummarySelect, toDetail, toSnapshotSummary } from './project.select';

@Injectable()
export class PrismaSnapshotRepository implements ISnapshotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(projectId: string): Promise<SnapshotSummary[]> {
    const rows = await this.prisma.projectSnapshot.findMany({
      where: { projectId },
      select: snapshotSummarySelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
    return rows.map(toSnapshotSummary);
  }

  countManual(projectId: string): Promise<number> {
    return this.prisma.projectSnapshot.count({ where: { projectId, isAutomatic: false } });
  }

  async create(projectId: string, snapshot: NewSnapshot): Promise<SnapshotSummary> {
    const row = await this.prisma.projectSnapshot.create({
      data: this.toData(projectId, snapshot),
      select: snapshotSummarySelect,
    });
    return toSnapshotSummary(row);
  }

  async findContent(projectId: string, snapshotId: string): Promise<SnapshotContent | null> {
    const row = await this.prisma.projectSnapshot.findFirst({
      where: { id: snapshotId, projectId },
      select: { id: true, name: true, canvasState: true, dimensions: true },
    });
    return row as unknown as SnapshotContent | null;
  }

  async delete(projectId: string, snapshotId: string): Promise<boolean> {
    const { count } = await this.prisma.projectSnapshot.deleteMany({ where: { id: snapshotId, projectId } });
    return count > 0;
  }

  async restore(
    projectId: string,
    snapshot: SnapshotContent,
    backup: NewSnapshot,
    fitCheck: FitCheckReport | null,
  ): Promise<{ project: ProjectDetail; backup: SnapshotSummary }> {
    const [backupRow, projectRow] = await this.prisma.$transaction([
      this.prisma.projectSnapshot.create({
        data: { ...this.toData(projectId, backup), isAutomatic: true },
        select: snapshotSummarySelect,
      }),
      this.prisma.packagingProject.update({
        where: { id: projectId },
        data: {
          canvasState: json(snapshot.canvasState),
          dimensions: json(snapshot.dimensions),
          fitcheckState: nullableJson(fitCheck),
          fitcheckScore: fitCheck?.score ?? null,
          version: { increment: 1 }, // an editor still showing the old design must reload, not save over it
        },
        select: detailSelect,
      }),
    ]);
    return { project: toDetail(projectRow), backup: toSnapshotSummary(backupRow) };
  }

  private toData(projectId: string, snapshot: NewSnapshot) {
    return {
      projectId,
      name: snapshot.name,
      previewUrl: snapshot.previewUrl,
      canvasState: json(snapshot.canvasState),
      dimensions: json(snapshot.dimensions),
    };
  }
}
