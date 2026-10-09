import { BadRequestException, ExecutionContext } from '@nestjs/common';
import type { ProjectsService } from '../application/projects.service';
import { ProjectOwnerGuard } from './project-owner.guard';

describe('ProjectOwnerGuard', () => {
  const projectId = '7d0c3f6e-2f1a-4c55-9a43-2a0f5a7c9b11';
  const assertOwner = jest.fn();
  const guard = new ProjectOwnerGuard({ assertOwner } as unknown as ProjectsService);
  const context = (id: string) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ params: { id }, user: { id: 'user-1' } }) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => assertOwner.mockReset());

  it('rejects a malformed id before touching the database', async () => {
    await expect(guard.canActivate(context('not-a-uuid'))).rejects.toThrow(BadRequestException);
    expect(assertOwner).not.toHaveBeenCalled();
  });

  it('checks that the current user owns the project', async () => {
    await expect(guard.canActivate(context(projectId))).resolves.toBe(true);
    expect(assertOwner).toHaveBeenCalledWith(projectId, 'user-1');
  });
});
