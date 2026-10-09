import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectVisibility } from '@prisma/client';
import { IsBoolean, IsEnum } from 'class-validator';
import { IsOptionalNotNull } from '../../../common';

/** Omitted fields stay unchanged. */
export class ChangeVisibilityDto {
  @ApiPropertyOptional({
    enum: ProjectVisibility,
    description: 'PRIVATE = only me, UNLISTED = anyone with the /p/<slug> link, PUBLIC = also in the community',
  })
  @IsOptionalNotNull()
  @IsEnum(ProjectVisibility)
  visibility?: ProjectVisibility;

  @ApiPropertyOptional({ description: 'Let other users remix (fork) the design; default true' })
  @IsOptionalNotNull()
  @IsBoolean()
  allowFork?: boolean;
}
