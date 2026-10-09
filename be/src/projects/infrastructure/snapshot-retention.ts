import { Prisma } from '@prisma/client';
import { syncProjectFileRefs } from './project-file-refs';

/**
 * Automatic snapshots (one per print export, one per restore backup) kept per project. Each one copies the whole
 * canvas; without a cap a project exported every day would grow its history forever. Manual snapshots have their
 * own limit (MAX_SNAPSHOTS_PER_PROJECT) and are never removed here.
 */
export const MAX_AUTOMATIC_SNAPSHOTS = 20;

/**
 * Call in the transaction that just added an automatic snapshot: deletes the automatic snapshots of the project beyond
 * the newest MAX_AUTOMATIC_SNAPSHOTS, then recomputes the project's file refs. Always: the new snapshot copies a
 * canvas read earlier (the export reads it when rendering starts), which may show files the saved canvas dropped since.
 */
export async function pruneAutomaticSnapshots(tx: Prisma.TransactionClient, projectId: string): Promise<void> {
  await tx.$executeRaw`
    DELETE FROM project_snapshots WHERE id IN (
      SELECT id FROM project_snapshots
      WHERE project_id = ${projectId}::uuid AND is_automatic
      ORDER BY created_at DESC, id DESC
      OFFSET ${MAX_AUTOMATIC_SNAPSHOTS})`;
  await syncProjectFileRefs(tx, projectId);
}
