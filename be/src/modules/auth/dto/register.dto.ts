import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, maxLength: 72, example: 'Passw0rd123' })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt only uses the first 72 bytes
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must contain at least one letter and one number',
  })
  password: string;

  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;
}
