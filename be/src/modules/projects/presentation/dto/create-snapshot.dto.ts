import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { MAX_TITLE_LENGTH } from '../../domain/project.types';
import { trim } from '../../../../common/utils/transform.util';

export class CreateSnapshotDto {
  @ApiProperty({ example: 'Mốc 1: Logo vàng ép kim' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TITLE_LENGTH)
  name: string;

  @ApiPropertyOptional({ description: 'https URL of an uploaded preview image of this version' })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  previewUrl?: string;
}
