import { Role } from '@prisma/client';
import { IsBoolean, IsEnum } from 'class-validator';
import { IsOptionalNotNull } from '../../../common/decorators/optional-not-null.decorator';

export class AdminUpdateUserDto {
  @IsOptionalNotNull()
  @IsEnum(Role)
  role?: Role;

  @IsOptionalNotNull()
  @IsBoolean()
  isActive?: boolean;
}
