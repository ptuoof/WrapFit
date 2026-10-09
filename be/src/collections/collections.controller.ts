import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ACCESS_COOKIE } from '../auth/auth.constants';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

/** Projects are moved in and out with `PATCH /api/projects/:id { collectionId }`. */
@ApiTags('collections')
@ApiCookieAuth(ACCESS_COOKIE)
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List my collections with their project count (trash excluded)' })
  list(@CurrentUser('id') userId: string) {
    return this.collectionsService.list(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a collection' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of my collections' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.collectionsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename, describe or recolor a collection' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a collection; its projects are kept without a collection' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.collectionsService.remove(id, userId);
  }
}
