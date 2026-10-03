import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { BrandKit } from '@wrapfit/shared';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { trim } from '../../../common/utils/transform.util';

/** Saves the whole brand kit (UC-02): omitted optional fields are cleared. */
export class UpdateBrandKitDto implements BrandKit {
  @ApiPropertyOptional({ nullable: true, description: 'https URL of the logo uploaded with purpose LOGO' })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  logoUrl: string | null = null;

  @ApiProperty({
    type: [String],
    example: ['#2D5A27', '#D4AF37', '#FAEDCD'],
    description: '3 to 5 colors #RRGGBB: primary, accent, background, then extras',
  })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(5)
  @Matches(/^#[0-9a-fA-F]{6}$/, { each: true, message: 'colors must be #RRGGBB colors' })
  colors: string[];

  @ApiPropertyOptional({ type: [String], example: ['Playfair Display', 'DM Sans'], description: 'Headings first' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(100, { each: true })
  fonts: string[] = [];

  @ApiPropertyOptional({ nullable: true, example: 'Gói trọn yêu thương' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(150)
  slogan: string | null = null;
}
