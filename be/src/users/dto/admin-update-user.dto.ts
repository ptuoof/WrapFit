import { Role } from '@prisma/client';
import { IsBoolean, IsEnum } from 'class-validator';
import { IsOptionalNotNull } from '../../common';

export class AdminUpdateUserDto {
  @IsOptionalNotNull()
  @IsEnum(Role)
  role?: Role;

  @IsOptionalNotNull()
  @IsBoolean()
  isActive?: boolean;
}
