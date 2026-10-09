import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { IsOptionalNotNull } from '../../common/decorators/optional-not-null.decorator';
import { trim } from '../../common/utils/transform.util';
import { HEX_COLOR } from './create-collection.dto';

/** Omitted fields stay unchanged; `null` clears `description`. */
export class UpdateCollectionDto {
  @ApiPropertyOptional()
  @IsOptionalNotNull()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({ example: '#2D5A27' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: 'colorTag must be a hex color like #D4A373' })
  colorTag?: string;
}
