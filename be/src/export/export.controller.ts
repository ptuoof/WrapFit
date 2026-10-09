import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ACCESS_COOKIE } from '../auth/auth.constants';
import { ProjectOwnerGuard } from '../projects/presentation/project-owner.guard';
import { CreateExportDto } from './dto/create-export.dto';
import { ExportService } from './export.service';

@ApiTags('export')
@ApiCookieAuth(ACCESS_COOKIE)
@Controller()
export class ExportController {
  constructor(private readonly exports: ExportService) {}

  @Post('projects/:id/exports')
  @HttpCode(202)
  @UseGuards(ProjectOwnerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Request a print file (FitCheck runs first); poll GET /api/exports/:jobId' })
  request(@Param('id') projectId: string, @Body() dto: CreateExportDto) {
    return this.exports.request(projectId, dto.fileType);
  }

  @Get('projects/:id/exports')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Last 20 exports of my project' })
  list(@Param('id') projectId: string) {
    return this.exports.list(projectId);
  }

  @Get('exports/:jobId')
  @ApiOperation({ summary: 'Export status; COMPLETED includes a download link valid for 15 minutes' })
  status(@Param('jobId', ParseUUIDPipe) jobId: string, @CurrentUser('id') userId: string) {
    return this.exports.status(jobId, userId);
  }
}
