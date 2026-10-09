import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ACCESS_COOKIE, CurrentUser, OptionalAuth, SlugPipe } from '../common';
import { PublicProjectsService } from './public-projects.service';

const projectSlug = new SlugPipe('Project not found');

/** Routes by slug live under /public so they never collide with `/projects/:id` (docs 07, section 4.2). */
@ApiTags('public-showcase')
@Controller('public/projects/:slug')
export class PublicProjectsController {
  constructor(private readonly publicProjects: PublicProjectsService) {}

  @Get()
  @OptionalAuth()
  @ApiOperation({ summary: 'Public 3D page / embed data of a PUBLIC or UNLISTED project (counts a view)' })
  view(@Param('slug', projectSlug) slug: string, @CurrentUser('id') viewerId?: string) {
    return this.publicProjects.view(slug, viewerId);
  }

  @Post('fork')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiCookieAuth(ACCESS_COOKIE)
  @ApiOperation({ summary: 'Remix: copy the design into my workspace (needs allowFork)' })
  fork(@Param('slug', projectSlug) slug: string, @CurrentUser('id') userId: string) {
    return this.publicProjects.fork(slug, userId);
  }

  @Post('like')
  @HttpCode(200)
  @ApiCookieAuth(ACCESS_COOKIE)
  @ApiOperation({ summary: 'Like (idempotent)' })
  like(@Param('slug', projectSlug) slug: string, @CurrentUser('id') userId: string) {
    return this.publicProjects.like(slug, userId);
  }

  @Delete('like')
  @ApiCookieAuth(ACCESS_COOKIE)
  @ApiOperation({ summary: 'Remove my like (idempotent)' })
  unlike(@Param('slug', projectSlug) slug: string, @CurrentUser('id') userId: string) {
    return this.publicProjects.unlike(slug, userId);
  }
}
