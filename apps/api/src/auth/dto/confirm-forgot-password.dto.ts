import { IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class ConfirmForgotPasswordDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;

  @IsString()
  @MinLength(8)
  @MaxLength(256)
  password: string;
}
