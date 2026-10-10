import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ACCESS_COOKIE, CurrentUser } from '../../common';
import { SnapshotsService } from '../application/snapshots.service';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { ProjectOwnerGuard } from './project-owner.guard';

@ApiTags('projects')
@ApiCookieAuth(ACCESS_COOKIE)
@UseGuards(ProjectOwnerGuard)
@Controller('projects/:id/snapshots')
export class SnapshotsController {
  constructor(private readonly snapshotsService: SnapshotsService) {}

  @Get()
  @ApiOperation({ summary: 'Version history of a project, newest first (without the canvas)' })
  list(@Param('id') projectId: string) {
    return this.snapshotsService.list(projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Save the current canvas and dimensions as a named version' })
  create(@Param('id') projectId: string, @CurrentUser('id') userId: string, @Body() dto: CreateSnapshotDto) {
    return this.snapshotsService.create(projectId, userId, dto);
  }

  @Post(':snapshotId/restore')
  @HttpCode(200)
  @ApiOperation({ summary: 'Restore a version; the current state is saved first and returned as `backup`' })
  restore(@Param('id') projectId: string, @Param('snapshotId', ParseUUIDPipe) snapshotId: string) {
    return this.snapshotsService.restore(projectId, snapshotId);
  }

  @Delete(':snapshotId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a version' })
  remove(@Param('id') projectId: string, @Param('snapshotId', ParseUUIDPipe) snapshotId: string) {
    return this.snapshotsService.remove(projectId, snapshotId);
  }
}
