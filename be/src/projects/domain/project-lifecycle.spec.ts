import { changeStatus, duplicateTitle, purgeCutoff, TRASH_RETENTION_DAYS } from './project-lifecycle';

describe('project lifecycle', () => {
  const now = new Date('2026-10-02T02:00:00.000Z');
  const earlier = new Date('2026-09-20T10:00:00.000Z');

  it('archives and un-archives without touching deletedAt', () => {
    expect(changeStatus({ status: 'ACTIVE', deletedAt: null }, 'ARCHIVED', now)).toEqual({
      status: 'ARCHIVED',
      deletedAt: null,
    });
    expect(changeStatus({ status: 'ARCHIVED', deletedAt: null }, 'ACTIVE', now)).toEqual({
      status: 'ACTIVE',
      deletedAt: null,
    });
  });

  it('starts the trash countdown when a project enters the trash', () => {
    expect(changeStatus({ status: 'ACTIVE', deletedAt: null }, 'DELETED', now)).toEqual({
      status: 'DELETED',
      deletedAt: now,
    });
    expect(changeStatus({ status: 'ARCHIVED', deletedAt: null }, 'DELETED', now)?.deletedAt).toBe(now);
  });

  it('clears the countdown when a project is restored', () => {
    expect(changeStatus({ status: 'DELETED', deletedAt: earlier }, 'ACTIVE', now)).toEqual({
      status: 'ACTIVE',
      deletedAt: null,
    });
    expect(changeStatus({ status: 'DELETED', deletedAt: earlier }, 'ARCHIVED', now)?.deletedAt).toBeNull();
  });

  it('changes nothing when the status is already the target (keeps the original deletedAt)', () => {
    expect(changeStatus({ status: 'DELETED', deletedAt: earlier }, 'DELETED', now)).toBeNull();
    expect(changeStatus({ status: 'ACTIVE', deletedAt: null }, 'ACTIVE', now)).toBeNull();
  });

  it('purges what entered the trash more than 30 days ago', () => {
    expect(TRASH_RETENTION_DAYS).toBe(30);
    expect(purgeCutoff(now)).toEqual(new Date('2026-09-02T02:00:00.000Z'));
  });

  it('names a duplicate "[Bản sao] <title>" within the title limit', () => {
    expect(duplicateTitle('Hộp nến', 120)).toBe('[Bản sao] Hộp nến');
    expect(duplicateTitle('x'.repeat(120), 120)).toHaveLength(120);
  });
});
