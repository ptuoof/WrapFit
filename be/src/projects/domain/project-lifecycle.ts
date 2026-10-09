// Lifecycle of a project: ACTIVE <-> ARCHIVED, any state -> trash (DELETED), trash -> restore,
// and the 30-day trash retention. Plain TypeScript (docs 08: State / Policy pattern in domain/).
import type { ProjectStatus } from './project.types';

export const TRASH_RETENTION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface LifecycleState {
  status: ProjectStatus;
  deletedAt: Date | null;
}

/**
 * Moves a project to `target`. `deletedAt` is set only when the project enters the trash and cleared when it
 * leaves it, so the purge countdown always starts from the latest move to the trash.
 * Returns `null` when nothing changes (same status), which keeps the endpoint idempotent.
 */
export function changeStatus(current: LifecycleState, target: ProjectStatus, now: Date): LifecycleState | null {
  if (current.status === target) return null;
  return { status: target, deletedAt: target === 'DELETED' ? now : null };
}

/** Projects moved to the trash before this instant are purged. */
export function purgeCutoff(now: Date): Date {
  return new Date(now.getTime() - TRASH_RETENTION_DAYS * DAY_MS);
}

/** Title of a duplicate: `[Bản sao] <title>` (UC-06), cut to the maximum title length. */
export function duplicateTitle(title: string, maxLength: number): string {
  return `[Bản sao] ${title}`.slice(0, maxLength);
}
