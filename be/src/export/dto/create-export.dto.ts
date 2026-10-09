import { ApiProperty } from '@nestjs/swagger';
import { ExportFileType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateExportDto {
  @ApiProperty({
    enum: ExportFileType,
    description: 'PDF_CMYK = print shop, SVG = Cricut / laser cutter, DXF = CNC die-cutting machine',
  })
  @IsEnum(ExportFileType)
  fileType: ExportFileType;
}
