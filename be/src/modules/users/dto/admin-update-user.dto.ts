import { Role } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
