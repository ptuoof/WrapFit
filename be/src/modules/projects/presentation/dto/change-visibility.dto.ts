import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectVisibility } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

/** Omitted fields stay unchanged. */
export class ChangeVisibilityDto {
  @ApiPropertyOptional({
    enum: ProjectVisibility,
    description: 'PRIVATE = only me, UNLISTED = anyone with the /p/<slug> link, PUBLIC = also in the community',
  })
  @IsOptional()
  @IsEnum(ProjectVisibility)
  visibility?: ProjectVisibility;

  @ApiPropertyOptional({ description: 'Let other users remix (fork) the design; default true' })
  @IsOptional()
  @IsBoolean()
  allowFork?: boolean;
}
