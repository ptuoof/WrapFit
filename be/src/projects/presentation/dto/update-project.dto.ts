import { ApiPropertyOptional } from '@nestjs/swagger';
import { Industry, Occasion } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsOptionalNotNull } from '../../../common/decorators/optional-not-null.decorator';
import { trim } from '../../../common/utils/transform.util';
import { normalizeTags } from './create-project.dto';
import { MAX_TITLE_LENGTH } from '../../domain/project.types';
import { BoxDimensionsDto, CanvasStateDto, MaterialSpecDto } from './project-spec.dto';

/**
 * Every field is optional; omitted fields stay unchanged. `null` clears `collectionId` / `thumbnailUrl`.
 * The template cannot change (create a new project instead). Status has its own endpoint (`PATCH /:id/status`),
 * visibility and sharing too (IT3-06).
 */
export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 7,
    description:
      '`version` of the project as last loaded or saved. When another save changed the project since, the request ' +
      'answers 409 PROJECT_VERSION_CONFLICT instead of overwriting it. Omit it to save over any version.',
  })
  @IsOptionalNotNull()
  @IsInt()
  @Min(1)
  version?: number;

  @ApiPropertyOptional()
  @IsOptionalNotNull()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TITLE_LENGTH)
  title?: string;

  @ApiPropertyOptional({ type: BoxDimensionsDto, description: 'Replaces the whole object' })
  @IsOptionalNotNull()
  @ValidateNested()
  @Type(() => BoxDimensionsDto)
  dimensions?: BoxDimensionsDto;

  @ApiPropertyOptional({ type: MaterialSpecDto })
  @IsOptionalNotNull()
  @ValidateNested()
  @Type(() => MaterialSpecDto)
  materialSpec?: MaterialSpecDto;

  @ApiPropertyOptional({ type: CanvasStateDto, description: 'Replaces the whole canvas' })
  @IsOptionalNotNull()
  @ValidateNested()
  @Type(() => CanvasStateDto)
  canvasState?: CanvasStateDto;

  @ApiPropertyOptional({ format: 'uuid', nullable: true, description: '`null` removes the project from its collection' })
  @IsOptional()
  @IsUUID()
  collectionId?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'URL of a preview image you uploaded (purpose THUMBNAIL or IMAGE); 400 FILE_URL_NOT_ALLOWED / FILE_NOT_OWNED otherwise',
  })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
  @MaxLength(2048)
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptionalNotNull()
  @Transform(normalizeTags)
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: Occasion, nullable: true, description: 'Template hub filter (UC-12)' })
  @IsOptional()
  @IsEnum(Occasion)
  occasion?: Occasion | null;

  @ApiPropertyOptional({ enum: Industry, nullable: true, description: 'Template hub filter (UC-12)' })
  @IsOptional()
  @IsEnum(Industry)
  industry?: Industry | null;
}
