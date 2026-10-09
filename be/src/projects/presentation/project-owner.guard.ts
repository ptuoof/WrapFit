import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { isUUID } from 'class-validator';
import type { Request } from 'express';
import type { AuthUser } from '../../common';
import { ProjectsService } from '../application/projects.service';

/**
 * Lets the request through only when `:id` is a project of the current user; answers 404 otherwise,
 * so nobody can probe which project ids exist. Export it for other routes on `/projects/:id/...`
 * (snapshots, unboxing, exports).
 *
 * Guards run before pipes, so `:id` is validated here and not by ParseUUIDPipe.
 */
@Injectable()
export class ProjectOwnerGuard implements CanActivate {
  constructor(private readonly projects: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: AuthUser }>();
    const projectId = request.params.id;
    if (typeof projectId !== 'string' || !isUUID(projectId)) {
      throw new BadRequestException('Validation failed (uuid is expected)');
    }
    await this.projects.assertOwner(projectId, request.user.id);
    return true;
  }
}
