import { Prisma } from '@prisma/client';
import type { ProjectDetail, ProjectSummary, SnapshotSummary } from '../domain/project.types';

export const summarySelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  visibility: true,
  template: { select: { id: true, name: true } },
  collection: { select: { id: true, title: true, colorTag: true } },
  dimensions: true,
  materialSpec: true,
  fitcheckScore: true,
  thumbnailUrl: true,
  tags: true,
  occasion: true,
  industry: true,
  viewsCount: true,
  likesCount: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PackagingProjectSelect;

export const detailSelect = {
  ...summarySelect,
  version: true,
  allowFork: true,
  forkedFromId: true,
  canvasState: true,
  fitcheckState: true,
} satisfies Prisma.PackagingProjectSelect;

export const snapshotSummarySelect = {
  id: true,
  name: true,
  previewUrl: true,
  dimensions: true,
  createdAt: true,
} satisfies Prisma.ProjectSnapshotSelect;

type SummaryRow = Prisma.PackagingProjectGetPayload<{ select: typeof summarySelect }>;
type DetailRow = Prisma.PackagingProjectGetPayload<{ select: typeof detailSelect }>;
type SnapshotRow = Prisma.ProjectSnapshotGetPayload<{ select: typeof snapshotSummarySelect }>;

// JSON columns are only written through validated DTOs, so their shape is trusted when read back.
export const toSummary = (row: SummaryRow) => row as unknown as ProjectSummary;
export const toDetail = (row: DetailRow) => row as unknown as ProjectDetail;
export const toSnapshotSummary = (row: SnapshotRow) => row as unknown as SnapshotSummary;

/** DTO class instances -> plain JSON for Prisma. */
export const json = (value: object) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;

/** Optional JSON column: `null` must be written as `Prisma.DbNull`. */
export const nullableJson = (value: unknown) =>
  value === null || value === undefined ? Prisma.DbNull : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);
