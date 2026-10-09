import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim } from '../../common';

export const PARTICLE_EFFECTS = ['confetti', 'fireworks', 'hearts', 'petals', 'snow', 'none'] as const;
export type ParticleEffect = (typeof PARTICLE_EFFECTS)[number];

/** Saves the whole configuration (send every field each time). */
export class SaveUnboxingDto {
  @ApiProperty({ example: 'Mẹ yêu' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  recipientName: string;

  @ApiProperty({ example: 'Chúc mẹ một mùa xuân an lành, luôn mạnh khỏe và vui vẻ!' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  giftNote: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '/audio/xuan.mp3',
    description:
      'Music track: a file uploaded to WrapFit or a path of the frontend. URLs of other sites are refused (400 FILE_URL_NOT_ALLOWED): the recipient\'s browser would load them',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  audioTrackUrl?: string | null;

  @ApiPropertyOptional({ enum: PARTICLE_EFFECTS, default: 'confetti' })
  @IsOptional()
  @IsIn(PARTICLE_EFFECTS)
  particleEffect?: ParticleEffect;
}
