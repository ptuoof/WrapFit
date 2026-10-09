import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsIn, IsOptional } from 'class-validator';
import type { Response } from 'express';
import { ACCESS_COOKIE, CurrentUser, Public, SlugPipe } from '../common';
import { ProjectOwnerGuard } from '../projects';
import { SaveUnboxingDto } from './dto/save-unboxing.dto';
import { UnboxingService } from './unboxing.service';

class QrQueryDto {
  @IsOptional()
  @IsIn(['png', 'svg'])
  format: 'png' | 'svg' = 'png';
}

@ApiTags('unboxing')
@ApiCookieAuth(ACCESS_COOKIE)
@UseGuards(ProjectOwnerGuard)
@Controller('projects/:id/unboxing')
export class UnboxingController {
  constructor(private readonly unboxing: UnboxingService) {}

  @Get()
  @ApiOperation({ summary: 'Unboxing experience of my project, with its QR code URLs' })
  find(@Param('id') projectId: string) {
    return this.unboxing.find(projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Create or replace the unboxing experience and generate its QR code (201 / 200)' })
  async save(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SaveUnboxingDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { created, experience } = await this.unboxing.save(projectId, userId, dto);
    res.status(created ? 201 : 200);
    return experience;
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove the unboxing experience and its QR code files' })
  remove(@Param('id') projectId: string) {
    return this.unboxing.remove(projectId);
  }

  @Get('qr')
  @ApiQuery({ name: 'format', enum: ['png', 'svg'], required: false })
  @ApiOperation({ summary: 'Download the QR code (PNG 1200 px or SVG), generated on the fly' })
  async qr(@Param('id') projectId: string, @Query() query: QrQueryDto) {
    const file = await this.unboxing.qrImage(projectId, query.format);
    return new StreamableFile(file.body, {
      type: file.contentType,
      disposition: `attachment; filename="${file.fileName}"`,
    });
  }
}

@ApiTags('unboxing')
@Controller('public/unboxing/:slug')
export class PublicUnboxingController {
  constructor(private readonly unboxing: UnboxingService) {}

  @Get()
  @Public()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Unboxing page data when the recipient scans the QR code (counts a view)' })
  view(@Param('slug', new SlugPipe('Unboxing not found')) slug: string) {
    return this.unboxing.publicView(slug);
  }
}
