import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';
import { trim } from '../../../../common/utils/transform.util';

/** Value of `collectionId` that selects the projects outside any collection. */
export const NO_COLLECTION = 'none';

export class QueryProjectsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.ACTIVE, description: 'DELETED = trash' })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status: ProjectStatus = ProjectStatus.ACTIVE;

  @ApiPropertyOptional({ description: `A collection id, or "${NO_COLLECTION}" for projects outside any collection` })
  @IsOptional()
  @ValidateIf((query: QueryProjectsDto) => query.collectionId !== NO_COLLECTION)
  @IsUUID()
  collectionId?: string;

  @ApiPropertyOptional({ description: 'Search in the title (contains, case-insensitive) or an exact tag' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ enum: ['updatedAt', 'createdAt', 'title'], default: 'updatedAt' })
  @IsOptional()
  @IsIn(['updatedAt', 'createdAt', 'title'])
  sortBy: 'updatedAt' | 'createdAt' | 'title' = 'updatedAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
