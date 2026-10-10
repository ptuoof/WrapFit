import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { MAX_TITLE_LENGTH } from '../../domain/project.types';
import { trim } from '../../../common';

export class CreateSnapshotDto {
  @ApiProperty({ example: 'Mốc 1: Logo vàng ép kim' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TITLE_LENGTH)
  name: string;

  @ApiPropertyOptional({ description: 'URL of a preview image of this version you uploaded (purpose THUMBNAIL or IMAGE)' })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
  @MaxLength(2048)
  previewUrl?: string;
}
