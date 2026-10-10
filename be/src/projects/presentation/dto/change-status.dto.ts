import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeStatusDto {
  @ApiProperty({
    enum: ProjectStatus,
    description: 'ARCHIVED = archive, DELETED = move to the trash (purged after 30 days), ACTIVE = restore',
  })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}
