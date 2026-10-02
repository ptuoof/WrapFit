import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ACCESS_COOKIE } from '../auth/auth.constants';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiCookieAuth(ACCESS_COOKIE)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current user' })
  me(@CurrentUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the current user profile' })
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List users (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a user by id (admin)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Change role / active status of a user (admin)' })
  adminUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.usersService.adminUpdate(id, dto, actorId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a user (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') actorId: string) {
    return this.usersService.remove(id, actorId);
  }
}
