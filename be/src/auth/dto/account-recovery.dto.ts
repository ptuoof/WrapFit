import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { IsAccountPassword, normalizeEmail } from './register.dto';

/** The `token` query parameter of the link in the email (43 base64url characters). */
class OneTimeTokenDto {
  @ApiProperty({ description: 'Value of `?token=` in the link of the email' })
  @IsString()
  @Length(20, 128)
  token: string;
}

export class VerifyEmailDto extends OneTimeTokenDto {}

export class ResetPasswordDto extends OneTimeTokenDto {
  @IsAccountPassword()
  password: string;
}

/** Resend the verification email / forgot password: only the address. */
export class EmailOnlyDto {
  @ApiProperty({ example: 'user@example.com' })
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;
}
