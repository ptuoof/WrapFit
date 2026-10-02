import { ApiPropertyOptional } from '@nestjs/swagger';
import { Industry, Occasion } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { trim } from '../../../common/utils/transform.util';

export const HUB_SECTIONS = ['curated', 'community'] as const;
export type HubSection = (typeof HUB_SECTIONS)[number];

// Same values as MaterialType in @wrapfit/shared.
const MATERIALS = ['ivory', 'kraft', 'duplex'];

export class QueryHubDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: HUB_SECTIONS,
    default: 'curated',
    description: 'curated = WrapFit Curated designs, community = PUBLIC projects, most liked first',
  })
  @IsOptional()
  @IsIn(HUB_SECTIONS)
  section: HubSection = 'curated';

  @ApiPropertyOptional({ example: 'tuck-top', description: 'Box structure (box template id)' })
  @IsOptional()
  @Matches(/^[a-z0-9-]{1,64}$/)
  structure?: string;

  @ApiPropertyOptional({ enum: Occasion })
  @IsOptional()
  @IsEnum(Occasion)
  occasion?: Occasion;

  @ApiPropertyOptional({ enum: Industry })
  @IsOptional()
  @IsEnum(Industry)
  industry?: Industry;

  @ApiPropertyOptional({ enum: MATERIALS })
  @IsOptional()
  @IsIn(MATERIALS)
  material?: string;

  @ApiPropertyOptional({ description: 'Search in the title (contains) or an exact tag' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  q?: string;
}
