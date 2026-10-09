import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { UPLOAD_PURPOSES, UploadPurpose } from '../storage.rules';

export class PresignUploadDto {
  @ApiProperty({ enum: UPLOAD_PURPOSES, description: 'Decides the allowed formats and the maximum size' })
  @IsIn(UPLOAD_PURPOSES)
  purpose: UploadPurpose;

  @ApiProperty({ example: 'image/png', description: 'MIME type; the upload must send exactly this Content-Type' })
  @IsString()
  contentType: string;

  @ApiProperty({ example: 524288, description: 'File size in bytes; the upload must have exactly this size' })
  @IsInt()
  @Min(1)
  @Max(1024 * 1024 * 1024)
  size: number;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Attach the file to one of my projects: it is deleted together with the project',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
