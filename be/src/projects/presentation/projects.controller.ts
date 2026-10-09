import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ACCESS_COOKIE } from '../../auth/auth.constants';
import { ProjectsService } from '../application/projects.service';
import { ChangeStatusDto } from './dto/change-status.dto';
import { ChangeVisibilityDto } from './dto/change-visibility.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectOwnerGuard } from './project-owner.guard';

@ApiTags('projects')
@ApiCookieAuth(ACCESS_COOKIE)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project from a box template' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my projects (filter by status, collection, search; paginated)' })
  list(@CurrentUser('id') userId: string, @Query() query: QueryProjectsDto) {
    return this.projectsService.list(userId, query);
  }

  @Get(':id')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Get one of my projects with its canvas' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Update title, dimensions, material, canvas, collection, thumbnail or tags' })
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, userId, dto);
  }

  @Patch(':id/status')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Archive, move to the trash (30 days) or restore a project' })
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.projectsService.changeStatus(id, dto.status);
  }

  @Patch(':id/visibility')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Share a project: PRIVATE, UNLISTED (secret link) or PUBLIC, and allow remixing' })
  changeVisibility(@Param('id') id: string, @Body() dto: ChangeVisibilityDto) {
    return this.projectsService.changeVisibility(id, dto);
  }

  @Post(':id/duplicate')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Copy a project into a new, independent project' })
  duplicate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.projectsService.duplicate(id, userId);
  }

  @Delete(':id')
  @UseGuards(ProjectOwnerGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a project permanently (it must be in the trash)' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
