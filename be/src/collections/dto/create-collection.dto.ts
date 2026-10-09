import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { trim } from '../../common';

export const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export class CreateCollectionDto {
  @ApiProperty({ example: 'Bộ Hộp Quà Tết Bính Ngọ 2026' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'Chiến dịch 15/12 – 10/02, giao trước 25 tháng Chạp' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '#C0392B', description: 'Hex color #RRGGBB (default #D4A373, kraft)' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: 'colorTag must be a hex color like #D4A373' })
  colorTag?: string;
}
